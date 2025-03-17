const ibmdb = require('ibm_db');

const connectionString = "DATABASE=BANKDB;HOSTNAME=148.100.85.112;UID=Linux1;PWD=BankFrame;PORT=60000;PROTOCOL=TCPIP;";


const getConnection = async () => {
  try {
    const conn = await ibmdb.open(connectionString);
    console.log("Connected successfully to DB2");
    return conn;
  } catch (err) {
    console.error("Error connecting to DB2:", err);
    throw err; // Rethrow to handle the error externally if necessary
  }
};

module.exports = { getConnection };
