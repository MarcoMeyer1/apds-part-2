const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Prevent Clickjacking by setting X-Frame-Options header
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    next();
});

// Database connection
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

sql.connect(dbConfig).then(pool => {
    if (pool.connected) {
        console.log('Connected to Azure SQL Database');
    }
}).catch(err => console.error('Database Connection Failed: ', err));

// Routes
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Whitelist input using RegEx for username validation
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
        return res.status(400).send('Invalid username format. Only alphanumeric characters and underscores are allowed.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO Users (Username, PasswordHash) VALUES (@username, @password)`;
    try {
        const request = new sql.Request();
        request.input('username', sql.VarChar, username);
        request.input('password', sql.VarChar, hashedPassword);
        await request.query(query);
        res.status(201).send('User Registered');
    } catch (err) {
        res.status(500).send('Registration Failed');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Whitelist input using RegEx for username validation
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
        return res.status(400).send('Invalid username format. Only alphanumeric characters and underscores are allowed.');
    }

    const query = `SELECT * FROM Users WHERE Username = @username`;
    try {
        const request = new sql.Request();
        request.input('username', sql.VarChar, username);
        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(404).send('User not found');
        }

        const user = result.recordset[0];
        const isPasswordMatch = await bcrypt.compare(password, user.PasswordHash);

        if (!isPasswordMatch) {
            return res.status(400).send('Invalid credentials');
        }

        const token = jwt.sign({ id: user.ID }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (err) {
        res.status(500).send('Login Failed');
    }
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
