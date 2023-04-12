const mysql = require('mysql2/promise');
const { parseString } = require('xml2js');
const { createTable, insertData } = require('./Utils')
require('dotenv').config();


const fs = require('fs')
const xml = fs.readFileSync('XML-TEST-POKEMONS.xml');
let jsonMonsters;

parseString(xml, (err, result) => {
  if (err) {
    console.error(err);
    return;
  }

  const json = JSON.stringify(result);
  const obj = JSON.parse(json)
  jsonMonsters = obj
});

const main = async() => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  })
  
  await connection.connect((err) => {
    if (err) throw new Error('database failed to connect');
    console.log('Connection ready')
  })
  
  createTable("monsters", connection)
  insertData("monsters", connection, jsonMonsters)

  connection.end()
}

main()
