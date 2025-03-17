const { getConnection } = require('./DB2Connection');

// **E-Transfer Function**
const eTransfer = async (senderId, recipientId, amount) => {
    const checkBalanceSQL = "SELECT BALANCE FROM USERS WHERE USER_ID = ?";
    const insertTransactionSQL = "INSERT INTO TRANSACTIONS (USER_ID, TRANSACTION_TYPE, AMOUNT, RECIPIENT_ID) VALUES (?, ?, ?, ?)";
    const updateSenderBalanceSQL = "UPDATE USERS SET BALANCE = BALANCE - ? WHERE USER_ID = ?";
    const updateRecipientBalanceSQL = "UPDATE USERS SET BALANCE = BALANCE + ? WHERE USER_ID = ?";

    try {
        const conn = await getConnection();
        await conn.beginTransaction();

        // **1️⃣ Check sender's balance**
        const senderResult = await conn.query(checkBalanceSQL, [senderId]);
        if (senderResult.length === 0) {
            console.error("❌ Sender not found:", senderId);
            await conn.rollbackTransaction();
            conn.closeSync();
            return { success: false, message: "Sender not found" };
        }

        const senderBalance = senderResult[0].BALANCE;
        if (senderBalance < amount) {
            console.error("❌ Insufficient funds:", senderBalance, "<", amount);
            await conn.rollbackTransaction();
            conn.closeSync();
            return { success: false, message: "Insufficient funds for transfer" };
        }

        // **2️⃣ Check if recipient exists**
        const recipientResult = await conn.query(checkBalanceSQL, [recipientId]);
        if (recipientResult.length === 0) {
            console.error("❌ Recipient not found:", recipientId);
            await conn.rollbackTransaction();
            conn.closeSync();
            return { success: false, message: "Recipient not found" };
        }

        // **3️⃣ Deduct from sender's balance**
        await conn.query(updateSenderBalanceSQL, [amount, senderId]);

        // **4️⃣ Add to recipient's balance**
        await conn.query(updateRecipientBalanceSQL, [amount, recipientId]);

        // **5️⃣ Log transactions**
        await conn.query(insertTransactionSQL, [senderId, 'etransfer', -amount, recipientId]);
        await conn.query(insertTransactionSQL, [recipientId, 'etransfer', amount, senderId]);

        // **6️⃣ Commit transaction**
        await conn.commitTransaction();
        conn.closeSync();
        return { success: true, message: "E-Transfer successful" };
    } catch (error) {
        console.error("❌ Error during e-transfer:", error);
        return { success: false, message: "E-Transfer failed", error: error.message };
    }
};

module.exports = { eTransfer };
