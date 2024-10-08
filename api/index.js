const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const cors = require('cors');
const helmet = require('helmet');
const fs = require("fs");
const https = require('https');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const ExpressBrute = require('express-brute');
require('dotenv').config();

const app = express();
app.use(express.json());

// Cookie parser middleware
app.use(cookieParser()); 

// CORS configuration to allow requests from your frontend with credentials (cookies)

const options = {
    key: fs.readFileSync('../client/localhost-key.pem'), // Path to the key file
    cert: fs.readFileSync('../client/localhost.pem'),    // Path to the cert file
};

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
app.post('/login', async (req, res) => {
    const { username, accountNumber, password } = req.body;
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    const accountNumberRegex = /^[0-9]+$/;

    if (!usernameRegex.test(username) || !accountNumberRegex.test(accountNumber)) {
        return res.status(400).send('Invalid input format.');
    }

    try {
        const query = `SELECT * FROM Users WHERE Username = @username AND AccountNumber = @accountNumber`;
        const request = new sql.Request();
        request.input('username', sql.VarChar, username);
        request.input('accountNumber', sql.VarChar, accountNumber);
        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(404).send('Invalid credentials.');
        }

        const user = result.recordset[0];
        const isPasswordMatch = await bcrypt.compare(password, user.PasswordHash);

        if (!isPasswordMatch) {
            return res.status(400).send('Invalid credentials.');
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.ID }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('JWT-SESSION', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'Lax',
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
        // Get the token from 'JWT-SESSION' cookie
        const token = req.cookies['JWT-SESSION'];
        console.log('Cookies:', req.cookies);
        if (!token) {
            return res.status(401).send('Authorization token is missing');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userID = decoded.id;

        // Extract payment details from the request body
        const { amount, currency, provider, swiftCode } = req.body;

        // Regular expression validation for each field
        const amountRegex = /^\d+(\.\d{1,2})?$/;  // Allows numeric values with up to 2 decimal places
        const currencyRegex = /^[A-Z]{3}$/;  // Ensures currency is in uppercase ISO 4217 format (e.g., USD, EUR, ZAR)
        const providerRegex = /^[a-zA-Z\s]+$/;  // Allows only letters and spaces (for provider names)
        const swiftCodeRegex = /^[A-Z0-9]{8,11}$/;  // SWIFT code must be alphanumeric with 8-11 characters

        // Validate each field using the regex patterns
        if (!amountRegex.test(amount)) {
            return res.status(400).send('Invalid amount format. Only numbers with up to 2 decimal places are allowed.');
        }
        if (!currencyRegex.test(currency)) {
            return res.status(400).send('Invalid currency format. Must be a 3-letter ISO 4217 currency code.');
        }
        if (!providerRegex.test(provider)) {
            return res.status(400).send('Invalid provider name. Only letters and spaces are allowed.');
        }
        if (!swiftCodeRegex.test(swiftCode)) {
            return res.status(400).send('Invalid SWIFT code format. Must be alphanumeric and 8-11 characters long.');
        }

        // Proceed with inserting payment into the database
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
            console.error('JWT Error:', err.message);
            return res.status(401).send('Invalid or malformed token');
        }

        console.error('Error during payment processing:', err);
        res.status(500).send('Payment Failed');
    }
});



// Transactions endpoint
app.get('/transactions', async (req, res) => {
    // Correcting the key to match the cookie set in the login route
    const token = req.cookies['JWT-SESSION']; // Get token from the 'JWT-SESSION' cookie

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
        console.error('Error fetching transactions:', err); // Log the error for debugging
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
const server = https.createServer(options, app);
// Server start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Secure server running on https://localhost:${PORT}`);
});