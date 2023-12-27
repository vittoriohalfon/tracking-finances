const express = require('express');
const app = express();
const usersRoutes = require('./routes/users');
const transactionsRoutes = require('./routes/transactions');
const analyticsRoutes = require('./routes/analytics');

app.use(express.json());

app.use('/api/users', usersRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/analytics', analyticsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));