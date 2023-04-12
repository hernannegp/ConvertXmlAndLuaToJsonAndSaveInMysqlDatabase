const mysql = require('mysql2/promise');

async function createTable(tableName, connection) {
  const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (id INT AUTO_INCREMENT PRIMARY KEY, data JSON)`;

  await connection.execute(sql);

  console.log(`Table ${tableName} created successfully`);
}


async function insertData(tableName, connection, data) {
  const sql = `INSERT INTO ${tableName} (data) VALUES (?)`;

  const jsonData = {};

  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      jsonData[key] = value;
    } else {
      jsonData[key] = [value];
    }
  }

  await connection.execute(sql, [jsonData]);

  console.log(`Data inserted successfully`);
}

module.exports = { createTable, insertData };