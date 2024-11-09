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
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use(cookieParser());

const options = {
    key: fs.readFileSync('../client/localhost-key.pem'), // SSL key
    cert: fs.readFileSync('../client/localhost.pem'),    // SSL certificate
};

const corsOptions = {
    origin: 'https://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

app.use(helmet());
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.ieNoOpen());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

app.use((req, res, next) => {
    res.header('Cache-Control', 'no-store');
    next();
});

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        enableArithAbort: true,
    },
};

sql.connect(dbConfig).then(pool => {
    if (pool.connected) {
        console.log('Connected to Azure SQL Database');
    }
}).catch(err => console.error('Database Connection Failed: ', err));

const bruteStore = new ExpressBrute.MemoryStore();
const bruteForceProtection = new ExpressBrute(bruteStore, {
    freeRetries: 5,
    minWait: 5 * 60 * 1000,
    maxWait: 60 * 60 * 1000,
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

app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    next();
});

// Routes

app.post('/register', bruteForceProtection.prevent, async (req, res) => {
    const { fullName, username, idNumber, accountNumber, password } = req.body;

    // Regex patterns to validate user input
    const usernameRegex = /^[a-zA-Z0-9_]+$/; // Allows letters, numbers, and underscores
    const accountNumberRegex = /^[0-9]+$/; // Allows only digits
    const idNumberRegex = /^[0-9]{13}$/; // Exactly 13 digits

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

        // Generate salt and hashed password using the new method
        const salt = generateSalt();
        const hashedPassword = hashPassword(password, salt);

        const query = `INSERT INTO Users (FullName, Username, IDNumber, AccountNumber, PasswordHash, Salt) 
                       VALUES (@fullName, @username, @idNumber, @accountNumber, @password, @salt)`;
        const request = new sql.Request();
        request.input('fullName', sql.VarChar, fullName);
        request.input('username', sql.VarChar, username);
        request.input('idNumber', sql.VarChar, idNumber);
        request.input('accountNumber', sql.VarChar, accountNumber);
        request.input('password', sql.VarChar, hashedPassword);
        request.input('salt', sql.VarChar, salt);

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

app.post('/login', async (req, res) => {
    const { username, accountNumber, password } = req.body;

    // Regex patterns to validate login input
    const usernameRegex = /^[a-zA-Z0-9_]+$/; // Allows letters, numbers, and underscores
    const accountNumberRegex = /^[0-9]+$/; // Allows only digits

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

        // Verify password using multiple hashing algorithms with salt
        const isPasswordMatch = user.PasswordHash === hashPassword(password, user.Salt);

        if (!isPasswordMatch) {
            return res.status(400).send('Invalid credentials.');
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.ID, role: user.Role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('JWT-SESSION', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'Lax',
            maxAge: 60 * 60 * 1000, // 1 hour
        });

        // Send response with role
        res.status(200).json({ message: 'Login successful', role: user.Role });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Login Failed. Please try again later.');
    }
});



app.post('/payment', async (req, res) => {
    try {
        const token = req.cookies['JWT-SESSION'];
        console.log('Cookies:', req.cookies);
        if (!token) {
            return res.status(401).send('Authorization token is missing');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userID = decoded.id;

        const { amount, currency, provider, swiftCode } = req.body;

        // Regex patterns to validate payment details
        const amountRegex = /^\d+(\.\d{1,2})?$/;     // Numbers with up to 2 decimal places
        const currencyRegex = /^[A-Z]{3}$/;          // Exactly 3 uppercase letters (ISO currency codes)
        const providerRegex = /^[a-zA-Z\s]+$/;       // Letters and spaces
        const swiftCodeRegex = /^[A-Z0-9]{8,11}$/;   // Alphanumeric, 8 to 11 characters

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

app.get('/transactions', async (req, res) => {
    const token = req.cookies['JWT-SESSION'];

    if (!token) {
        return res.status(401).send('Authorization token is missing');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userID = decoded.id;

        const query = `SELECT * FROM Payments WHERE UserID = @userID ORDER BY CreatedAt DESC`;
        const request = new sql.Request();
        request.input('userID', sql.Int, userID);
        const result = await request.query(query);

        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('Error fetching transactions:', err);
        res.status(500).send('Failed to fetch transactions');
    }
});

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



//EMPLOYEE ENDPOINTS



app.get('/api/employee/transactions', async (req, res) => {
    const token = req.cookies['JWT-SESSION'];

    if (!token) {
        return res.status(401).send('Authorization token is missing');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== 'Employee') {
            return res.status(403).send('Access denied');
        }

        const query = `SELECT * FROM Payments ORDER BY CreatedAt DESC`;
        const request = new sql.Request();
        const result = await request.query(query);

        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('Error fetching transactions:', err.message);
        res.status(500).send('Failed to fetch transactions');
    }
});




app.put('/api/employee/transaction/verify/:id', async (req, res) => {
    const token = req.cookies['JWT-SESSION'];
    const transactionID = req.params.id;
    const { swiftCode } = req.body;

    if (!token) {
        return res.status(401).send('Authorization token is missing');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== 'Employee') {
            return res.status(403).send('Access denied');
        }

        const query = `UPDATE Payments SET Verified = 1 WHERE ID = @transactionID AND SWIFTCode = @swiftCode`;
        const request = new sql.Request();
        request.input('transactionID', sql.Int, transactionID);
        request.input('swiftCode', sql.VarChar, swiftCode);
        const result = await request.query(query);

        if (result.rowsAffected[0] === 0) {
            return res.status(400).send('Invalid SWIFT Code or Transaction not found');
        }

        res.status(200).send('Transaction Verified');
    } catch (err) {
        console.error('Error during transaction verification:', err);
        res.status(500).send('Verification Failed');
    }
});

app.put('/api/employee/transaction/unverify/:id', async (req, res) => {
    const token = req.cookies['JWT-SESSION'];
    const transactionID = req.params.id;

    if (!token) {
        return res.status(401).send('Authorization token is missing');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== 'Employee') {
            return res.status(403).send('Access denied');
        }

        const query = `UPDATE Payments SET Verified = 0 WHERE ID = @transactionID`;
        const request = new sql.Request();
        request.input('transactionID', sql.Int, transactionID);
        const result = await request.query(query);

        if (result.rowsAffected[0] === 0) {
            return res.status(400).send('Transaction not found');
        }

        res.status(200).send('Transaction Unverified');
    } catch (err) {
        console.error('Error during transaction unverification:', err);
        res.status(500).send('Unverification Failed');
    }
});





function generateSalt() {
    return crypto.randomBytes(16).toString('hex');
}

function hashPassword(password, salt) {
    const hashes = [
        crypto.createHmac('sha256', salt).update(password).digest('hex'),
        crypto.createHmac('sha512', salt).update(password).digest('hex'),
        crypto.createHmac('sha1', salt).update(password).digest('hex'),
        crypto.createHmac('md5', salt).update(password).digest('hex'),
        crypto.createHmac('ripemd160', salt).update(password).digest('hex'),
    ];
    return hashes.join('|'); // Combining hashes with a separator
}

const verifyPassword = (enteredPassword, storedHash, salt) => {
    const enteredHash = hashPassword(enteredPassword, salt);
    return storedHash === enteredHash;
};

app.post('/employee-login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Ensure a valid connection
        const pool = await sql.connect(dbConfig);

        // Query the employee by username
        const request = pool.request();
        request.input('username', sql.VarChar, username);
        const result = await request.query(`SELECT * FROM Employees WHERE Username = @username`);

        // Check if user exists
        if (result.recordset.length === 0) {
            return res.status(401).send('Invalid username or password.');
        }

        const employee = result.recordset[0];
        const { PasswordHash, Salt, Role } = employee;

        // Verify password
        if (!verifyPassword(password, PasswordHash, Salt)) {
            return res.status(401).send('Invalid username or password.');
        }

        // Generate JWT token
        const token = jwt.sign({ id: employee.ID, role: Role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // Set token as a secure cookie
        res.cookie('JWT-SESSION', token, {
            httpOnly: true,
            secure: true, // Ensure this is true in production
            sameSite: 'Lax',
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        // Send response with role
        res.json({ message: 'Login Successful', role: Role });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).send('Server error');
    }
});






const server = https.createServer(options, app);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Secure server running on https://localhost:${PORT}`);
});
