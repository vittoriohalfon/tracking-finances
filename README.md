**## Personal Finance Tracker API**
A backend API for a personal finance tracking application designed to help users manage their incomes and expenses efficiently.

## Features
* User Authentication: Securely register and authenticate users.
* Transaction Management: Users can add, retrieve, and categorize their income and expenses.
* Budget Setting: Users can set budget limits for different spending categories.
* Analytics: Provides insights on spending trends and budget alerts.

## Technologies Used

* Node.js and Express: For creating the RESTful API.
* PostgreSQL: As the database to store user data, transactions, and budgets.
* JWT: For secure user authentication and token management.
* bcrypt.js: For hashing and securing user passwords.

## Local Setup
Clone the repository:
git clone https://github.com/vittoriohalfon/finance-tracker.git

## Navigate to the project directory:
cd finance-tracker

## Install dependencies:
npm install

## Set up your PostgreSQL database and ensure it's running.
Database Schema in db/initializeDB.js

## Create a .env file in the root directory and add your database and JWT configurations:
DB_CONNECTION=your_database_connection_string JWT_SECRET=your_jwt_secret

## Start the server:
node server.js

## Testing
* Import the provided Postman collection (Finance_Tracker.postman_collection.json) to test and interact with the API endpoints.
* The collection includes various pre-configured requests to demonstrate the API's capabilities.

## Future Enhancements
* Implement additional features such as [list any potential features you consider].
* Enhance the analytics module for more detailed financial insights.

## Contributions
Feel free to fork the project and submit pull requests for any improvements or fixes.
Thank you for checking out my Personal Finance Tracker API. Any feedback or contributions are greatly appreciated!
