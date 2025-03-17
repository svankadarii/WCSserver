    // transactionsService.js
    const { getConnection } = require('./DB2Connection');

    // Fetch transactions for a specific user (by email)
    async function getTransactionsByEmail(email) {
    try {
        const conn = await getConnection();

        // Look up user ID from USERS table
        const userResult = await conn.query("SELECT USER_ID FROM USERS WHERE EMAIL_ADDRESS = ?", [email]);
        if (userResult.length === 0) {
        conn.closeSync();
        return { success: false, message: "User not found" };
        }

        const userId = userResult[0].USER_ID;

        // Retrieve transactions for that user
        const transactions = await conn.query("SELECT * FROM TRANSACTIONS WHERE USER_ID = ?", [userId]);

        conn.closeSync();
        return { success: true, transactions };
    } catch (error) {
        console.error("Error fetching transactions by email:", error);
        return { success: false, message: "Failed to fetch transactions", error: error.message };
    }
    }

    // Fetch all transactions in the TRANSACTIONS table
    async function getAllTransactions() {
    try {
        const conn = await getConnection();
        const transactions = await conn.query("SELECT * FROM TRANSACTIONS");
        conn.closeSync();

        return { success: true, transactions };
    } catch (error) {
        console.error("Error fetching all transactions:", error);
        return { success: false, message: "Failed to fetch transactions", error: error.message };
    }
    }

    module.exports = {
    getTransactionsByEmail,
    getAllTransactions
    };