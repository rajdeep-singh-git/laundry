const mysql = require('mysql2');

const { HOST, USER, PASSWORD, DB, CONNECTION_LIMIT } = require('../env');

const pool = mysql.createPool({
    host: HOST,
    user: USER,
    password: PASSWORD,
    database: DB,
    connectionLimit: CONNECTION_LIMIT, // The maximum number of connections in the pool
});

async function executeQuery(query, preparedQueryArgument) {
    return new Promise((resolve, reject) => {
        pool.query(query, preparedQueryArgument, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        })
    })
}

module.exports = {
    query: (query, values, callback) => {
        pool.query(query, values, callback)
    },
    executeQuery
}

pool.on('error', (err) => {
    console.error('Database connection error:', err);
});