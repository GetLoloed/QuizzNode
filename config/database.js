let mysql = require('mysql2');

let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: '',
    database: 'tp_quizz'
});

connection.connect();

module.exports = connection;