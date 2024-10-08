const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const ExpressBrute = require('express-brute');
require('dotenv').config();

const app = express();
app.use(express.json());

// Cookie parser middleware
app.use(cookieParser()); 

// CORS configuration to allow requests from your frontend with credentials (cookies)

const corsOptions = {
    origin: 'https://localhost:3000', // Your frontend origin
    credentials: true, // Allow credentials (cookies) to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    optionsSuccessStatus: 204, // Some legacy browsers (like IE11) choke on 204
};

app.use(cors(corsOptions));

// Make sure you handle preflight requests by explicitly enabling OPTIONS
app.options('*', cors(corsOptions));

// Helmet middleware for securing HTTP headers
app.use(helmet());
app.use(helmet.frameguard({ action: 'deny' })); // Prevent clickjacking
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true })); // Enforces HTTPS by adding HSTS header
app.use(helmet.xssFilter()); // Adds XSS protection
app.use(helmet.noSniff()); // Prevents the browser from guessing MIME types
app.use(helmet.ieNoOpen()); // Prevents IE from opening untrusted HTML

// Rate limiting middleware to prevent DoS attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 100, // Limit each IP to 100 requests per window per 15 minutes
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter); // Apply rate limiting to all requests

app.use((req, res, next) => {
    res.header('Cache-Control', 'no-store');  // Disable caching
    next();
});

// Database connection setup
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // Use encryption for Azure SQL Database
        enableArithAbort: true,
    },
};

// Establish the connection to the database
sql.connect(dbConfig).then(pool => {
    if (pool.connected) {
        console.log('Connected to Azure SQL Database');
    }
}).catch(err => console.error('Database Connection Failed: ', err));

// Brute-force protection middleware using MemoryStore
const bruteStore = new ExpressBrute.MemoryStore(); // Non-persistent storage
const bruteForceProtection = new ExpressBrute(bruteStore, {
    freeRetries: 5, // Allow 5 attempts before blocking
    minWait: 5 * 60 * 1000, // 5 minutes
    maxWait: 60 * 60 * 1000, // 1 hour
    failCallback: (req, res, next, nextValidRequestDate) => {
        res.status(429).json({
            message: `Too many failed attempts. Please try again after ${nextValidRequestDate.toISOString()}`,
        });
    },
    handleStoreError: (error) => {
        console.error('Error in brute-force store:', error);
        throw error;
    },
});

// Middleware to prevent clickjacking by setting X-Frame-Options header
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    next();
});

// Routes

// Register endpoint with brute-force protection
app.post('/register', bruteForceProtection.prevent, async (req, res) => {
    const { fullName, username, idNumber, accountNumber, password } = req.body;

    // RegEx validation for inputs
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    const accountNumberRegex = /^[0-9]+$/;
    const idNumberRegex = /^[0-9]{13}$/;

    if (!usernameRegex.test(username)) {
        return res.status(400).send('Invalid username format. Only alphanumeric characters and underscores are allowed.');
    }
    if (!accountNumberRegex.test(accountNumber)) {
        return res.status(400).send('Invalid account number format. Only numeric values are allowed.');
    }
    if (!idNumberRegex.test(idNumber)) {
        return res.status(400).send('Invalid ID number format. It must be exactly 13 digits.');
    }

    try {
        // Check if the username already exists
        const queryCheckUsername = `SELECT * FROM Users WHERE Username = @username`;
        const requestCheck = new sql.Request();
        requestCheck.input('username', sql.VarChar, username);
        const resultCheck = await requestCheck.query(queryCheckUsername);

        if (resultCheck.recordset.length > 0) {
            return res.status(400).send('Username already exists. Please choose a different one.');
        }

        // Proceed with user registration
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `INSERT INTO Users (FullName, Username, IDNumber, AccountNumber, PasswordHash) 
                       VALUES (@fullName, @username, @idNumber, @accountNumber, @password)`;
        const request = new sql.Request();
        request.input('fullName', sql.VarChar, fullName);
        request.input('username', sql.VarChar, username);
        request.input('idNumber', sql.VarChar, idNumber);
        request.input('accountNumber', sql.VarChar, accountNumber);
        request.input('password', sql.VarChar, hashedPassword);

        await request.query(query);
        res.status(201).send('User Registered Successfully');
    } catch (err) {
        console.error('Error during registration:', err);
        if (err.code === 'EREQUEST' && err.originalError && err.originalError.info.message.includes('UQ_Username')) {
            res.status(400).send('Username already exists.');
        } else {
            res.status(500).send('Registration Failed. Please try again later.');
        }
    }
});

// Login endpoint with brute-force protection
app.post('/login', bruteForceProtection.prevent, async (req, res) => {
    const { username, accountNumber, password } = req.body;

    // RegEx validation for inputs
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    const accountNumberRegex = /^[0-9]+$/;

    if (!usernameRegex.test(username)) {
        return res.status(400).send('Invalid username format.');
    }
    if (!accountNumberRegex.test(accountNumber)) {
        return res.status(400).send('Invalid account number format.');
    }

    const query = `SELECT * FROM Users WHERE Username = @username AND AccountNumber = @accountNumber`;

    try {
        const request = new sql.Request();
        request.input('username', sql.VarChar, username);
        request.input('accountNumber', sql.VarChar, accountNumber);
        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(404).send('Username or account number is incorrect.');
        }

        const user = result.recordset[0];
        const isPasswordMatch = await bcrypt.compare(password, user.PasswordHash);

        if (!isPasswordMatch) {
            return res.status(400).send('Incorrect password.');
        }

        // Create a JWT token
        const token = jwt.sign({ id: user.ID, role: user.Role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Log the generated token for debugging
        console.log('Generated JWT Token:', token);

        // Set HttpOnly cookie with the token
        res.cookie('token', token, {
            httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', // Ensures HTTPS in production
    sameSite: 'Strict', 
    maxAge: 60 * 60 * 1000, // 1 hour expiration
        });

        res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Login Failed. Please try again later.');
    }
});

// Payment endpoint
app.post('/payment', async (req, res) => {
    try {
        const token = req.cookies.token; // Get the token from the HttpOnly cookie
        if (!token) {
            return res.status(401).send('Authorization token is missing');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
        const userID = decoded.id; // Extract user ID from the token

        // Proceed with inserting payment
        const { amount, currency, provider, swiftCode } = req.body;

        const query = `INSERT INTO Payments (Amount, Currency, Provider, SWIFTCode, UserID) 
                       VALUES (@amount, @currency, @provider, @swiftCode, @userID)`;
        const request = new sql.Request();
        request.input('amount', sql.Decimal, amount);
        request.input('currency', sql.VarChar, currency);
        request.input('provider', sql.VarChar, provider);
        request.input('swiftCode', sql.VarChar, swiftCode);
        request.input('userID', sql.Int, userID);

        await request.query(query);
        res.status(201).send('Payment Processed');
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            console.error('JWT Error:', err.message); // Log detailed JWT error
            return res.status(401).send('Invalid or malformed token');
        }

        console.error('Error during payment processing:', err); // Log general errors
        res.status(500).send('Payment Failed');
    }
});

// Transactions endpoint
app.get('/transactions', async (req, res) => {
    const token = req.cookies.token; // Get token from the HttpOnly cookie

    if (!token) {
        return res.status(401).send('Authorization token is missing');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
        const userID = decoded.id; // Extract user ID from the token

        const query = `SELECT * FROM Payments WHERE UserID = @userID ORDER BY CreatedAt DESC`;
        const request = new sql.Request();
        request.input('userID', sql.Int, userID);
        const result = await request.query(query);

        res.status(200).json(result.recordset); // Return the transactions
    } catch (err) {
        console.error('Error verifying token:', err);
        res.status(500).send('Failed to fetch transactions');
    }
});

// Verify transaction endpoint
app.put('/verify-transaction/:id', async (req, res) => {
    const transactionID = req.params.id;
    const { swiftCode } = req.body;

    const query = `UPDATE Payments SET Verified = 1 WHERE ID = @transactionID AND SWIFTCode = @swiftCode`;

    try {
        const request = new sql.Request();
        request.input('transactionID', sql.Int, transactionID);
        request.input('swiftCode', sql.VarChar, swiftCode);
        const result = await request.query(query);

        if (result.rowsAffected[0] === 0) {
            return res.status(400).send('Invalid SWIFT Code or Transaction not found');
        }

        res.status(200).send('Transaction Verified');
    } catch (err) {
        res.status(500).send('Verification Failed');
    }
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
