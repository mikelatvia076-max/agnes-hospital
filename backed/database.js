// =================================
// AGNES MEMORIAL HOSPITAL DATABASE (TiDB)
// =================================

const mysql = require("mysql2");

const db = mysql.createPool({
    host: process.env.DB_HOST || "gateway01.eu-central-1.prod.aws.tidbcloud.com",
    user: process.env.DB_USER || "2cdStbMBMTTWaTK.root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "agnes_memorial", 
    port: process.env.DB_PORT || 4000,
    dateStrings: true,
    ssl: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    connectTimeout: 30000
});

db.getConnection((err, connection) => {
    if (err) {
        console.log("Database connection failed");
        console.log(err);
    } else {
        console.log("Database connected successfully to TiDB (agnes_memorial)");
        connection.release();
    }
});

module.exports = db;