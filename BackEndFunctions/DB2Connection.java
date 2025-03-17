import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DB2Connection {
    private static final String URL = "jdbc:db2://148.100.85.112:60000/BANKDB"; // Static variable
    private static final String USER = "Linux1"; // Static variable
    private static final String PASSWORD = "BankFrame"; // Static variable

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
