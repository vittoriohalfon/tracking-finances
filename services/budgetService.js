const pool = require('../db/database');

const getBudget = async (req, res) => {
    const user_id = req.user.user_id;
    try {
        const budgetResults = await pool.query(
            'SELECT category, SUM(amount) as total_spent FROM transactions WHERE user_id = $1 GROUP BY category',
            [user_id]
        );
        res.status(200).json(budgetResults.rows);
    } catch (error) {
        res.status(500).send('Failed to retrieve budget information.');
    }
};

const getTrends = async (req, res) => {
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
};

// Function to retrieve user budget limits
const getUserBudgetLimits = async (userId) => {
    try {
        const budgetResults = await pool.query(
            'SELECT category, limit_amount FROM budgets WHERE user_id = $1',
            [userId]
        );
        return budgetResults.rows;  // Returns an array of { category, limit_amount }
    } catch (error) {
        console.error('Error retrieving budget limits:', error);
        throw error;
    }
};

const getAlerts = async (req, res) => {
    const user_id = req.user.user_id;
    try {
        // Retrieve user-defined budget limits
        const budgetLimitsRows = await getUserBudgetLimits(user_id);
        const budgetLimits = budgetLimitsRows.reduce((acc, limit) => {
            acc[limit.category] = limit.limit_amount;
            return acc;
        }, {});

        // Calculate current spending
        const spendingResults = await pool.query(
            'SELECT category, SUM(amount) as total_spent FROM transactions WHERE user_id = $1 AND transaction_type = \'expense\' GROUP BY category',
            [user_id]
        );

        // Compare spending with limits and generate alerts
        const alerts = spendingResults.rows.reduce((acc, spending) => {
            const limit = budgetLimits[spending.category];
            if (limit && spending.total_spent > limit) {
                acc.push(`Alert: Your spending for ${spending.category} is over the limit by ${(spending.total_spent - limit).toFixed(2)}!`);
            }
            return acc;
        }, []);

        res.status(200).json({ alerts });
    } catch (error) {
        console.error('Error generating alerts:', error);
        res.status(500).send('Failed to generate alerts.');
    }
};

module.exports = { getBudget, getTrends, getAlerts };