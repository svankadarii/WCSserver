const { getConnection } = require('./DB2Connection');

// **Withdraw Function**
const withdraw = async (userId, amount) => {
    const checkBalanceSQL = "SELECT BALANCE FROM USERS WHERE USER_ID = ?";
    const insertTransactionSQL = "INSERT INTO TRANSACTIONS (USER_ID, TRANSACTION_TYPE, AMOUNT) VALUES (?, ?, ?)";
    const updateBalanceSQL = "UPDATE USERS SET BALANCE = BALANCE - ? WHERE USER_ID = ?";

    try {
        const conn = await getConnection();
        await conn.beginTransaction(); // Start a transaction

        // 1️⃣ Check if the user exists and has enough balance
        const userResult = await conn.query(checkBalanceSQL, [userId]);
        if (userResult.length === 0) {
            console.error("❌ User not found:", userId);
            await conn.rollbackTransaction();
            conn.closeSync();
            return { success: false, message: "User not found" };
        }

        const userBalance = userResult[0].BALANCE;
        if (userBalance < amount) {
            console.error("❌ Insufficient funds:", userBalance, "<", amount);
            await conn.rollbackTransaction();
            conn.closeSync();
            return { success: false, message: "Insufficient funds" };
        }

        // 2️⃣ Insert withdrawal transaction
        await conn.query(insertTransactionSQL, [userId, 'withdraw', -amount]);

        // 3️⃣ Update user's balance
        await conn.query(updateBalanceSQL, [amount, userId]);

        // 4️⃣ Double-check new balance
        const updatedBalanceResult = await conn.query(checkBalanceSQL, [userId]);
        if (updatedBalanceResult.length === 0) {
            // Should never happen if user was found earlier, but just in case
            console.error("❌ User not found after update:", userId);
            await conn.rollbackTransaction();
            conn.closeSync();
            return { success: false, message: "User not found after update" };
        }

        // Compare the new balance to the old one
        const newBalance = updatedBalanceResult[0].BALANCE;
        if (newBalance !== userBalance - amount) {
            console.error(
                "❌ Balance mismatch after update:",
                newBalance,
                "!=",
                userBalance - amount
            );
            await conn.rollbackTransaction();
            conn.closeSync();
            return { success: false, message: "Failed to update balance (mismatch)" };
        }

        // 5️⃣ Commit the transaction
        await conn.commitTransaction();
        conn.closeSync();

        // Return success with the new balance
        return { success: true, message: `Withdrawal successful. New balance: ${newBalance}` };

    } catch (error) {
        console.error("❌ Error during withdrawal:", error);
        return { success: false, message: "Withdrawal failed", error: error.message };
    }
};

module.exports = { withdraw };
