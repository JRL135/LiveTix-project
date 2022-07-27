// const mysql = require('mysql2');
const mysqlPromise = require('mysql2/promise');
require('dotenv').config();

let pool;

if (process.env.MODE === 'development' || process.env.MODE === 'production') {
  pool = mysqlPromise.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: 40,
    queueLimit: 0,
  });
} else if (process.env.MODE === 'test') {
  pool = mysqlPromise.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME_TEST,
    waitForConnections: true,
    connectionLimit: 40,
    queueLimit: 0,
  });
}

module.exports = {pool};
