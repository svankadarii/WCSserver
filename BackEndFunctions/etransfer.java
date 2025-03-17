import java.sql.*;

public class etransfer {
    public static boolean eTransfer(int senderId, int recipientId, double amount) {
        String checkBalanceSQL = "SELECT BALANCE FROM USERS WHERE USER_ID = ?";
        String insertTransactionSQL = "INSERT INTO TRANSACTIONS (USER_ID, TRANSACTION_TYPE, AMOUNT, RECIPIENT_ID) VALUES (?, ?, ?, ?)";
        String updateSenderBalanceSQL = "UPDATE USERS SET BALANCE = BALANCE - ? WHERE USER_ID = ?";
        String updateRecipientBalanceSQL = "UPDATE USERS SET BALANCE = BALANCE + ? WHERE USER_ID = ?";

        try (Connection conn = DB2Connection.getConnection()) {
            conn.setAutoCommit(false); 

            try (PreparedStatement balanceCheckStmt = conn.prepareStatement(checkBalanceSQL)) {
                balanceCheckStmt.setInt(1, senderId);
                ResultSet rs = balanceCheckStmt.executeQuery();

                if (rs.next()) {
                    double senderBalance = rs.getDouble(1);
                    if (senderBalance < amount) {
                        System.out.println("Insufficient funds for transfer.");
                        conn.rollback();
                        return false;
                    }
                } else {
                    System.out.println("Sender not found.");
                    conn.rollback();
                    return false;
                }
            }

            try (PreparedStatement deductStmt = conn.prepareStatement(updateSenderBalanceSQL)) {
                deductStmt.setDouble(1, amount);
                deductStmt.setInt(2, senderId);
                deductStmt.executeUpdate();
            }

            try (PreparedStatement addStmt = conn.prepareStatement(updateRecipientBalanceSQL)) {
                addStmt.setDouble(1, amount);
                addStmt.setInt(2, recipientId);
                addStmt.executeUpdate();
            }

            try (PreparedStatement transactionStmt = conn.prepareStatement(insertTransactionSQL)) {
                transactionStmt.setInt(1, senderId);
                transactionStmt.setString(2, "etransfer");
                transactionStmt.setDouble(3, -amount); 
                transactionStmt.setInt(4, recipientId);
                transactionStmt.executeUpdate();
            }

            try (PreparedStatement transactionStmt = conn.prepareStatement(insertTransactionSQL)) {
                transactionStmt.setInt(1, recipientId);
                transactionStmt.setString(2, "etransfer");
                transactionStmt.setDouble(3, amount); 
                transactionStmt.setNull(4, java.sql.Types.INTEGER); 
                transactionStmt.executeUpdate();
            }

            conn.commit(); 
            return true;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}
