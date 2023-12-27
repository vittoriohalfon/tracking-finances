const express = require('express');
const router = express.Router();
const { getBudget, getTrends, getAlerts } = require('../services/budgetService');
const { authenticateToken } = require('../services/authService');

router.get('/budget', authenticateToken, getBudget);
router.get('/trends', authenticateToken, getTrends);
router.get('/alerts', authenticateToken, getAlerts);

module.exports = router;
