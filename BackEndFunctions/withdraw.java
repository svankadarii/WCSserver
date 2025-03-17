import java.sql.*;

public class withdraw {
    public static boolean withdraw(int userId, double amount) {
        String checkBalanceSQL = "SELECT BALANCE FROM USERS WHERE USER_ID = ?";
        String insertTransactionSQL = "INSERT INTO TRANSACTIONS (USER_ID, TRANSACTION_TYPE, AMOUNT) VALUES (?, ?, ?)";
        String updateBalanceSQL = "UPDATE USERS SET BALANCE = BALANCE - ? WHERE USER_ID = ?";

        try (Connection conn = DB2Connection.getConnection();
             PreparedStatement balanceCheckStmt = conn.prepareStatement(checkBalanceSQL);
             PreparedStatement transactionStmt = conn.prepareStatement(insertTransactionSQL);
             PreparedStatement balanceStmt = conn.prepareStatement(updateBalanceSQL)) {

            // Check user balance
            balanceCheckStmt.setInt(1, userId);
            ResultSet rs = balanceCheckStmt.executeQuery();

            if (rs.next()) {
                double balance = rs.getDouble(1);
                if (balance < amount) {
                    System.out.println("Insufficient funds.");
                    return false;
                }
            } else {
                System.out.println("User not found.");
                return false;
            }

            // Insert transaction record
            transactionStmt.setInt(1, userId);
            transactionStmt.setString(2, "withdraw");
            transactionStmt.setDouble(3, -amount); 
            transactionStmt.executeUpdate();

            // Update user balance
            balanceStmt.setDouble(1, amount);
            balanceStmt.setInt(2, userId);
            int rowsUpdated = balanceStmt.executeUpdate();

            return rowsUpdated > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}
