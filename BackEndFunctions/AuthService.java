import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class AuthService {

    // **Signup Function**
    public static boolean registerUser(String name, String email, String password, double balance) {
        String checkUserSQL = "SELECT USER_ID FROM USERS WHERE EMAIL_ADDRESS = ?";
        String insertUserSQL = "INSERT INTO USERS (NAME, EMAIL_ADDRESS, PASSWORD, BALANCE) VALUES (?, ?, ?, ?)";

        try (Connection conn = DB2Connection.getConnection()) {
            conn.setAutoCommit(false); 

            // Check if the email is already registered
            try (PreparedStatement checkStmt = conn.prepareStatement(checkUserSQL)) {
                checkStmt.setString(1, email);
                ResultSet rs = checkStmt.executeQuery();
                if (rs.next()) {
                    System.out.println("Email already registered.");
                    conn.rollback();
                    return false;
                }
            }

            // Insert new user into USERS table
            try (PreparedStatement insertStmt = conn.prepareStatement(insertUserSQL)) {
                insertStmt.setString(1, name);
                insertStmt.setString(2, email);
                insertStmt.setString(3, password);
                insertStmt.setDouble(4, balance);
                insertStmt.executeUpdate();
            }

            conn.commit(); 
            return true; // Signup successful

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // **Login Function**
    public static boolean loginUser(String email, String password) {
        String fetchUserSQL = "SELECT PASSWORD FROM USERS WHERE EMAIL_ADDRESS = ?";

        try (Connection conn = DB2Connection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(fetchUserSQL)) {

            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                String storedPassword = rs.getString("PASSWORD");

                // Check if passwords match (No hashing, just plain text comparison)
                if (storedPassword.equals(password)) {
                    return true; // Login successful
                } else {
                    System.out.println("Invalid password.");
                    return false;
                }
            } else {
                System.out.println("Email not found.");
                return false;
            }

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}
