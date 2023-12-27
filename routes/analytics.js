const express = require('express');
const router = express.Router();
const { getBudget, getTrends, getAlerts, setBudget } = require('../services/budgetService');
const { authenticateToken } = require('../services/authService');

router.get('/budget', authenticateToken, getBudget);
router.get('/trends', authenticateToken, getTrends);
router.get('/alerts', authenticateToken, getAlerts);
// router.post('/setBudget', authenticateToken, setBudget);
router.post('/setBudget', setBudget);

module.exports = router;
