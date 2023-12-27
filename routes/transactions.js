const express = require('express');
const router = express.Router();
const { getAllTransactions, addTransaction, updateTransaction, deleteTransaction } = require('../services/transactionService');
const { authenticateToken } = require('../services/authService');

router.get('/', authenticateToken, getAllTransactions);
router.post('/', authenticateToken, addTransaction);
router.put('/:id', authenticateToken, updateTransaction);
router.delete('/:id', authenticateToken, deleteTransaction);

module.exports = router;
