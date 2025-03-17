const ibmdb = require('ibm_db');
const { getConnection } = require('./DB2Connection'); // Import DB2 connection function

// // **Signup Function**
// const registerUser = async (name, email, password, balance) => {
//     const checkUserSQL = "SELECT USER_ID FROM USERS WHERE EMAIL_ADDRESS = ?";
//     const insertUserSQL = "INSERT INTO USERS (NAME, EMAIL_ADDRESS, PASSWORD, BALANCE) VALUES (?, ?, ?, ?)";

//     try {
//         const conn = await getConnection();
//         await conn.beginTransaction();

//         // Check if the email is already registered
//         const users = await conn.query(checkUserSQL, [email]);
//         if (users.length > 0) {
//             console.log("Email already registered.");
//             await conn.rollbackTransaction();
//             conn.closeSync();
//             return { success: false, message: "Email already registered" };
//         }

//         // Insert new user into USERS table
//         await conn.query(insertUserSQL, [name, email, password, balance]);

//         await conn.commitTransaction();
//         conn.closeSync();
//         return { success: true, message: "User registered successfully" };

//     } catch (error) {
//         console.error("Error during user registration:", error);
//         return { success: false, message: "Registration failed", error: error.message };
//     }
// };

// // **Login Function**
// const loginUser = async (email, password) => {
//     const fetchUserSQL = "SELECT PASSWORD FROM USERS WHERE EMAIL_ADDRESS = ?";

//     try {
//         const conn = await getConnection();
//         const users = await conn.query(fetchUserSQL, [email]);

//         if (users.length === 0) {
//             console.log("Email not found.");
//             conn.closeSync();
//             return { success: false, message: "Email not found" };
//         }

//         const storedPassword = users[0].PASSWORD;
//         if (storedPassword === password) { // Plain text comparison (Consider using bcrypt for hashing in production)
//             conn.closeSync();
//             return { success: true, message: "Login successful" };
//         } else {
//             console.log("Invalid password.");
//             conn.closeSync();
//             return { success: false, message: "Invalid password" };
//         }

//     } catch (error) {
//         console.error("Error during user login:", error);
//         return { success: false, message: "Login failed", error: error.message };
//     }
// };

// module.exports = { registerUser, loginUser };
// **Signup Function**
const registerUser = async (name, email, password, balance) => {
    const checkUserSQL = "SELECT USER_ID FROM USERS WHERE EMAIL_ADDRESS = ?";
    const insertUserSQL = "INSERT INTO USERS (NAME, EMAIL_ADDRESS, PASSWORD, BALANCE) VALUES (?, ?, ?, ?)";

    try {
        const conn = await getConnection();
        await conn.beginTransaction();

        // Check if the email is already registered
        const users = await conn.query(checkUserSQL, [email]);
        if (users.length > 0) {
            console.log("❌ Email already registered.");
            await conn.rollbackTransaction();
            conn.closeSync();
            return { success: false, message: "Email already registered" };
        }

        // Insert new user into USERS table
        await conn.query(insertUserSQL, [name, email, password, balance]);

        await conn.commitTransaction();
        conn.closeSync();
        return { success: true, message: "User registered successfully", name, email };

    } catch (error) {
        console.error("❌ Error during user registration:", error);
        return { success: false, message: "Registration failed", error: error.message };
    }
};

// **Login Function**
const loginUser = async (email, password) => {
    const fetchUserSQL = "SELECT NAME, EMAIL_ADDRESS, PASSWORD FROM USERS WHERE EMAIL_ADDRESS = ?";

    try {
        const conn = await getConnection();
        const users = await conn.query(fetchUserSQL, [email]);

        if (users.length === 0) {
            console.log("❌ Email not found.");
            conn.closeSync();
            return { success: false, message: "Invalid email or password" };
        }

        const user = users[0];
        const storedPassword = user.PASSWORD;

        if (storedPassword !== password) {
            console.log("❌ Invalid password.");
            conn.closeSync();
            return { success: false, message: "Invalid email or password" };
        }

        console.log("✅ Login successful:", user);
        conn.closeSync();

        return {
            success: true,
            message: "Login successful",
            name: user.NAME, // ✅ Ensure full name is returned
            email: user.EMAIL_ADDRESS
        };

    } catch (error) {
        console.error("❌ Error during user login:", error);
        return { success: false, message: "Login failed", error: error.message };
    }
};

module.exports = { registerUser, loginUser };