const pool = require('../db/database');

const getAllTransactions = async (req, res) => {
    const user_id = req.user.user_id;
    try {
        const transactions = await pool.query('SELECT * FROM transactions WHERE user_id = $1', [user_id]);
        res.status(200).json(transactions.rows);
    } catch (error) {
        res.status(500).send('Failed to retrieve transactions.');
    }
};

const addTransaction = async (req, res) => {
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
};

const updateTransaction = async (req, res) => {
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
};

const deleteTransaction = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM transactions WHERE transaction_id = $1', [id]);
        res.status(204).send('Transaction deleted.');
    } catch (error) {
        res.status(500).send('Failed to delete transaction.');
    }
};

module.exports = { getAllTransactions, addTransaction, updateTransaction, deleteTransaction };