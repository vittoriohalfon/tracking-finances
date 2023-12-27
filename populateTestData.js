const bcrypt = require('bcryptjs');
const pool = require('./db/database');  // Adjust the path as necessary

async function createTestUsers() {
    for (let i = 1; i <= 10; i++) {  // Creates 5 test users
        const username = `testuser${i}`;
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2)',
            [username, hashedPassword]
        );
    }
}

async function createTransactionsForUser(userId) {
    const categories = ['groceries', 'utilities', 'entertainment', 'rent'];
    for (let i = 0; i < 10; i++) {  // Creates 10 transactions per user
        const amount = Math.floor(Math.random() * 100) + 10;  // Random amount between 10 and 110
        const category = categories[i % categories.length];  // Cycles through the categories array
        const transaction_type = i % 2 === 0 ? 'income' : 'expense';  // Alternates between income and expense

        await pool.query(
            'INSERT INTO transactions (user_id, amount, transaction_type, category, transaction_date) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
            [userId, amount, transaction_type, category]
        );
    }
}

async function populateData() {
    try {
        await createTestUsers();
        for (let userId = 1; userId <= 5; userId++) {  // Assumes user IDs 1 through 5
            await createTransactionsForUser(userId);
        }
        console.log('Test data populated successfully!');
    } catch (error) {
        console.error('Failed to populate test data:', error);
    } finally {
        pool.end();  // Close the database connection
    }
}

populateData();
