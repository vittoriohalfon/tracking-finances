const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pg = require('pg');
const usersRoutes = require('./routes/users');
const transactionsRoutes = require('./routes/transactions');
const analyticsRoutes = require('./routes/analytics');

require('dotenv').config();
const app = express();
app.use(express.json());

// Database connection setup
const pool = new pg.Pool({
  connectionString: process.env.DB_CONNECTION
});

// Middleware for authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Register User
app.post('/register', async (req, res) => {
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
});

// User Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
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
});

// Get all transactions for a user
app.get('/transactions', authenticateToken, async (req, res) => {
    const user_id = req.user.user_id;
    try {
        const transactions = await pool.query('SELECT * FROM transactions WHERE user_id = $1', [user_id]);
        res.status(200).json(transactions.rows);
    } catch (error) {
        res.status(500).send('Failed to retrieve transactions.');
    }
});

// Add a new transaction
app.post('/transactions', authenticateToken, async (req, res) => {
    const { amount, transaction_type, category } = req.body;
    const user_id = req.user.user_id;
    try {
        const newTransaction = await pool.query(
            'INSERT INTO transactions (user_id, amount, transaction_type, category) VALUES ($1, $2, $3, $4) RETURNING *',
            [user_id, amount, transaction_type, category]
        );
        res.status(201).json(newTransaction.rows[0]);
    } catch (error) {
        res.status(500).send('Failed to create transaction.');
    }
});

// Update an existing transaction
app.put('/transactions/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { amount, transaction_type, category } = req.body;
    try {
        const updatedTransaction = await pool.query(
            'UPDATE transactions SET amount = $1, transaction_type = $2, category = $3 WHERE transaction_id = $4 RETURNING *',
            [amount, transaction_type, category, id]
        );
        res.status(200).json(updatedTransaction.rows[0]);
    } catch (error) {
        res.status(500).send('Failed to update transaction.');
    }
});

// Delete a transaction
app.delete('/transactions/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM transactions WHERE transaction_id = $1', [id]);
        res.status(204).send('Transaction deleted.');
    } catch (error) {
        res.status(500).send('Failed to delete transaction.');
    }
});

app.get('/budget', authenticateToken, async (req, res) => {
    const user_id = req.user.user_id;
    try {
        const budgetResults = await pool.query(
            'SELECT category, SUM(amount) as total_spent FROM transactions WHERE user_id = $1 GROUP BY category',
            [user_id]
        );
        // TODO: Compare total_spent with user-defined budget limits for each category
        res.status(200).json(budgetResults.rows);
    } catch (error) {
        res.status(500).send('Failed to retrieve budget information.');
    }
});

app.get('/trends', authenticateToken, async (req, res) => {
    const user_id = req.user.user_id;
    const { period } = req.query; // e.g., 'monthly', 'weekly'
    try {
        let interval;
        if (period === 'monthly') {
            interval = 'month';
        } else if (period === 'weekly') {
            interval = 'week';
        }
        const trendResults = await pool.query(
            `SELECT date_trunc('${interval}', transaction_date) as period, SUM(amount) as total_amount, transaction_type 
             FROM transactions WHERE user_id = $1 GROUP BY period, transaction_type ORDER BY period`,
            [user_id]
        );
        res.status(200).json(trendResults.rows);
    } catch (error) {
        res.status(500).send('Failed to retrieve trend information.');
    }
});

app.get('/alerts', authenticateToken, async (req, res) => {
    const user_id = req.user.user_id;
    try {
        // Retrieve user-defined budget limits
        const budgetLimits = /* Logic to retrieve user's budget limits from DB */;

        // Calculate current spending
        const spendingResults = await pool.query(
            'SELECT category, SUM(amount) as total_spent FROM transactions WHERE user_id = $1 AND transaction_type = \'expense\' GROUP BY category',
            [user_id]
        );

        // Compare spending with limits and generate alerts
        const alerts = spendingResults.rows.map(spending => {
            const limit = budgetLimits[spending.category];
            if (spending.total_spent > limit) {
                return `Alert: Your spending for ${spending.category} is over the limit!`;
            }
        }).filter(Boolean);

        res.status(200).json({ alerts });
    } catch (error) {
        res.status(500).send('Failed to generate alerts.');
    }
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
