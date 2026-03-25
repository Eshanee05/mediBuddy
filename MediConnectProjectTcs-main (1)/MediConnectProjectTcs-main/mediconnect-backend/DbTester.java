import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DbTester {
    public static void main(String[] args) {
        String[] passwords = {"", "password", "root", "admin", "1234", "123456", "12345678", "mysql"};
        String url = "jdbc:mysql://127.0.0.1:3306/?useSSL=false&serverTimezone=UTC";
        String user = "root";

        System.out.println("Testing MySQL connections...");
        for (String pwd : passwords) {
            try (Connection conn = DriverManager.getConnection(url, user, pwd)) {
                System.out.println("SUCCESS! Password is: '" + pwd + "'");
                System.exit(0);
            } catch (SQLException e) {
                System.out.println("FAILED for '" + pwd + "': " + e.getMessage());
            }
        }
        System.out.println("All common passwords failed.");
        System.exit(1);
    }
}
