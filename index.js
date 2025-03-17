require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Import DB2 connection, authentication & transaction services
const { getConnection } = require('./DB2Connection');
const { registerUser, loginUser } = require('./AuthService');
const { deposit } = require('./DepositService');
const { withdraw } = require('./withdrawService');
const { eTransfer } = require('./eTransferService');
const { fetchAllUsers } = require('./fetchUsersService'); 
// *** Import these at the top (not inside the route) ***
const {
  getTransactionsByEmail,
  getAllTransactions
} = require('./Transactions.js'); // Make sure this path is correct

// Parse JSON body
app.use(express.json());

// CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/**
 * Helper function to fetch USER_ID by name
 */
const getUserIdByName = async (name) => {
  try {
    const conn = await getConnection();
    const result = await conn.query("SELECT USER_ID FROM USERS WHERE NAME = ?", [name]);
    conn.closeSync();

    if (result.length === 0) {
      console.error(`❌ User not found for name: ${name}`);
      return null;
    }
    
    return result[0].USER_ID;
  } catch (error) {
    console.error("❌ Error fetching USER_ID:", error);
    return null;
  }
};

/**
 * 🛠️ Test DB Connection API
 */
app.get('/api/test-db', async (req, res) => {
  try {
    const conn = await getConnection();
    if (conn) {
      res.json({ success: true, message: "Connected successfully to DB2" });
      conn.closeSync();
    }
  } catch (err) {
    console.error("DB connection error:", err);
    res.status(500).json({ success: false, message: "Failed to connect to DB2", error: err.message });
  }
});

/**
 * 🔐 Register API
 */
app.post('/api/register', async (req, res) => {
  const { name, email, password, balance } = req.body;

  if (!name || !email || !password || balance === undefined) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const result = await registerUser(name, email, password, balance);
  res.status(result.success ? 200 : 400).json(result);
});

/**
 * 🔐 Login API
 */
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  const result = await loginUser(email, password);
  res.status(result.success ? 200 : 400).json(result);
});

/**
 * 🏦 Deposit API (Uses Name Instead of USER_ID)
 */
app.post('/api/deposit', async (req, res) => {
  const { fromAccount, toAccount, amount } = req.body;

  // Validate that both names match before proceeding
  if (fromAccount !== toAccount) {
    return res.status(400).json({ success: false, message: "Both accounts must match for deposits" });
  }

  // Fetch USER_ID from the database
  const userId = await getUserIdByName(fromAccount);
  if (!userId) {
    return res.status(400).json({ success: false, message: "Invalid deposit request. User not found." });
  }

  // Call deposit service
  const result = await deposit(userId, amount);
  res.status(result.success ? 200 : 400).json(result);
});

/**
 * 💸 Withdraw API (Uses Name Instead of USER_ID)
 */
app.post('/api/withdraw', async (req, res) => {
  const { fromAccount, toAccount, amount } = req.body;

  // Validate that both names match before proceeding
  if (fromAccount !== toAccount) {
    return res.status(400).json({ success: false, message: "Both accounts must match for withdrawals" });
  }

  // Fetch USER_ID from the database
  const userId = await getUserIdByName(fromAccount);
  if (!userId) {
    return res.status(400).json({ success: false, message: "Invalid withdrawal request. User not found." });
  }

  // Call withdraw service
  const result = await withdraw(userId, amount);
  res.status(result.success ? 200 : 400).json(result);
});

/**
 * 🔁 E-Transfer API (Uses Name Instead of USER_ID)
 */
app.post('/api/etransfer', async (req, res) => {
  const { fromAccount, toAccount, amount } = req.body;

  // Fetch USER_IDs for both sender & recipient
  const senderId = await getUserIdByName(fromAccount);
  const recipientId = await getUserIdByName(toAccount);

  if (!senderId || !recipientId) {
    return res.status(400).json({ success: false, message: "Invalid transfer request. Users not found." });
  }

  // Call eTransfer service
  const result = await eTransfer(senderId, recipientId, amount);
  res.status(result.success ? 200 : 400).json(result);
});

/**
 * 📋 Fetch All Users API
 */
app.get('/api/users', async (req, res) => {
  const result = await fetchAllUsers();
  res.status(result.success ? 200 : 500).json(result);
});

// CHANGED: Use req.body to get the email for transactions
app.post('/api/transactions', async (req, res) => {
  try {
    // We'll first check if an email is in the body:
    const { email } = req.body; // <-- CHANGED: reading from body
    console.log("POST /api/transactions - email from body:", email);

    if (email) {
      const result = await getTransactionsByEmail(email);
      // Return 200 if success, 404 if user not found
      return res.status(result.success ? 200 : 404).json(result);
    }

    // Otherwise, return all transactions
    const result = await getAllTransactions();
    return res.status(result.success ? 200 : 500).json(result);

  } catch (error) {
    console.error("Error in /api/transactions route:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// ADDED: Simple demo route to verify body parsing
app.post('/api/demo-body', (req, res) => {
  console.log("POST /api/demo-body - Received:", req.body);
  res.json({ 
    success: true, 
    message: "Demo body received successfully!",
    receivedData: req.body
  });
});

/**
 * 🚀 Start Express Server
 */
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
