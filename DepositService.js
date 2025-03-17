const { getConnection } = require('./DB2Connection');

const deposit = async (userId, amount) => {
    try {
        const conn = await getConnection();
        await conn.beginTransaction();

        // 1️⃣ Check if user exists and get old balance
        const userCheck = await conn.query("SELECT BALANCE FROM USERS WHERE USER_ID = ?", [userId]);
        if (userCheck.length === 0) {
            await conn.rollbackTransaction();
            conn.closeSync();
            return { success: false, message: "User ID does not exist" };
        }
        const oldBalance = userCheck[0].BALANCE;

        // 2️⃣ Insert transaction
        await conn.query(
            "INSERT INTO TRANSACTIONS (USER_ID, TRANSACTION_TYPE, AMOUNT) VALUES (?, ?, ?)",
            [userId, 'deposit', amount]
        );

        // 3️⃣ Update balance
        await conn.query(
            "UPDATE USERS SET BALANCE = BALANCE + ? WHERE USER_ID = ?",
            [amount, userId]
        );

        // 4️⃣ Re-select the new balance
        const newCheck = await conn.query("SELECT BALANCE FROM USERS WHERE USER_ID = ?", [userId]);
        if (newCheck.length === 0) {
            await conn.rollbackTransaction();
            conn.closeSync();
            return { success: false, message: "User not found after deposit" };
        }

        const newBalance = newCheck[0].BALANCE;

        // 5️⃣ Confirm the balance actually changed
        if (newBalance !== oldBalance + amount) {
            await conn.rollbackTransaction();
            conn.closeSync();
            return { success: false, message: "Failed to update balance (mismatch)" };
        }

        // 6️⃣ Commit the transaction
        await conn.commitTransaction();
        conn.closeSync();

        return { success: true, message: `Deposit successful. New balance: ${newBalance}` };
    } catch (error) {
        console.error("❌ Error during deposit:", error);
        return { success: false, message: "Deposit failed", error: error.message };
    }
};

module.exports = { deposit };
