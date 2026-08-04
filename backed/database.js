// =================================
// AGNES MEMORIAL HOSPITAL DATABASE
// =================================

const mysql = require("mysql2");

// Using createPool instead of createConnection prevents ETIMEDOUT errors
// and automatically handles dropped serverless database connections.
const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "agnes_hospital", 
    port: process.env.DB_PORT || 3306,
    dateStrings: true,
    ssl: false,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 30000
});

// Test the pool connection on startup
db.getConnection((err, connection) => {
    if (err) {
        console.log("Database connection failed");
        console.log(err);
    } else {
        console.log("Database connected successfully via pool");
        connection.release();
    }
});

module.exports = db;