const mysql = require("mysql2/promise");
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: 40,
    queueLimit: 0
});

pool.connect((err) =>{
    if (err) {
        throw err;
    }
    console.log("Mysql connected");
});
 
module.exports = pool;