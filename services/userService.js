const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/database');

const registerUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
            [username, hashedPassword]
        );
        res.status(201).send(`User created with ID: ${result.rows[0].user_id}`);
    } catch (error) {
        res.status(500).send('User registration failed.');
    }
};

const loginUser = async (req, res) => {
    try {
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (user.rows.length > 0) {
            const validPassword = await bcrypt.compare(password, user.rows[0].password);
            if (validPassword) {
                const token = jwt.sign({ user_id: user.rows[0].user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.status(200).json({ token });
            } else {
                res.status(400).send('Invalid Credentials');
            }
        } else {
            res.status(400).send('User does not exist');
        }
    } catch (error) {
        res.status(500).send('Login failed.');
    }
};

module.exports = { registerUser, loginUser };