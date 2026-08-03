// =================================
// AGNES MEMORIAL HOSPITAL DATABASE
// =================================

const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    // Change "defaultdb" to your actual database name:
    database: process.env.DB_NAME || "agnes_hospital", 
    port: process.env.DB_PORT || 3306,
    dateStrings: true,
    ssl: false 
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed");
        console.log(err);
    } else {
        console.log("Database connected successfully");
    }
});

module.exports = db;