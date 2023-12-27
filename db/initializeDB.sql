CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE budgets (
    budget_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    category VARCHAR(50) NOT NULL,
    limit_amount DECIMAL(10, 2) NOT NULL
);