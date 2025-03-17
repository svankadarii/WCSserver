import java.sql.*;

public class deposit {
    public static boolean deposit(int userId, double amount) {
        String insertTransactionSQL = "INSERT INTO TRANSACTIONS (USER_ID, TRANSACTION_TYPE, AMOUNT) VALUES (?, ?, ?)";
        String updateBalanceSQL = "UPDATE USERS SET BALANCE = BALANCE + ? WHERE USER_ID = ?";

        try (Connection conn = DB2Connection.getConnection();
             PreparedStatement transactionStmt = conn.prepareStatement(insertTransactionSQL);
             PreparedStatement balanceStmt = conn.prepareStatement(updateBalanceSQL)) {

            transactionStmt.setInt(1, userId);
            transactionStmt.setString(2, "deposit");
            transactionStmt.setDouble(3, amount);
            transactionStmt.executeUpdate();

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
