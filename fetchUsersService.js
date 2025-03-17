const { getConnection } = require('./DB2Connection');

// **Fetch All Users Function**
const fetchAllUsers = async () => {
    const fetchUsersSQL = "SELECT USER_ID, NAME, EMAIL_ADDRESS, PASSWORD, BALANCE FROM USERS";

    try {
        const conn = await getConnection();
        const users = await conn.query(fetchUsersSQL);
        conn.closeSync(); // Close connection after fetching data
        return { success: true, users };
    } catch (error) {
        console.error("Error fetching users:", error);
        return { success: false, message: "Failed to fetch users", error: error.message };
    }
};

module.exports = { fetchAllUsers };
