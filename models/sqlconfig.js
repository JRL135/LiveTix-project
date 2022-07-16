const mysql = require('mysql2');
const mysqlPromise = require('mysql2/promise');
require('dotenv').config();

// const db = mysql.createConnection({
//     host: process.env.DATABASE_HOST,
//     user: process.env.DATABASE_USER,
//     // password: process.env.DATABASE_PASSWORD,
//     database: process.env.DATABASE_NAME,
// });

const pool = mysqlPromise.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 40,
  queueLimit: 0,
});

module.exports = {pool};

// module.exports = db;
