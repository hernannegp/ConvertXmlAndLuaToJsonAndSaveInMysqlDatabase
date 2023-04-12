
const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const luaparse = require('luaparse');

function luaToJson(filename) {
  const luaCode = fs.readFileSync(filename, 'utf8');
  const ast = luaparse.parse(luaCode);
  
  const json = JSON.stringify(ast, null, 2);
  fs.writeFileSync('lista_-_pokemon_e_move.json', json, 'utf8');
}

luaToJson('lista_-_pokemon_e_move.lua')

const content = fs.readFileSync('lista_-_pokemon_e_move.json', 'utf-8');
const data = JSON.parse(content);

const namesPokemons = [];
const attackPokemons = []


const acessarDadosPokemon = data.body[0].init[0].fields


for (const elemento of acessarDadosPokemon) {
  namesPokemons.push(elemento.key.raw)
  for (const dataInElement of elemento.value.fields) {
    attackPokemons.push(elemento.key.raw)
    for (const getAttacks of dataInElement.value.fields) {
      attackPokemons.push(getAttacks.value.raw)
    }
  }
}

function getPokemonAttacks(pokemonNames, attacksList) {
  const attacks = [];

  pokemonNames.forEach((pokemonName) => {
    const pokemonAttacks = [];
    let i = 0;

    while (i < attacksList.length) {
      if (attacksList[i] === pokemonName) {
        const attack = {
          name: attacksList[i + 1],
          level: attacksList[i + 2],
          cd: attacksList[i + 3],
          dist: attacksList[i + 4],
          target: attacksList[i + 5],
          f: attacksList[i + 6],
          t: attacksList[i + 7],
        };
        pokemonAttacks.push(attack);
        i += 8;
      } else {
        i++;
      }
    }

    const pokemon = {
      name: pokemonName,
      attacks: pokemonAttacks,
    };

    attacks.push(pokemon);
  });

  return attacks;
}

const formattedData = getPokemonAttacks(namesPokemons, attackPokemons)


async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  });

  // Criação da tabela "pokemon"
  await connection.query(`
    CREATE TABLE pokemon (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255),
      attack JSON
    )
  `);

  
formattedData.forEach(({ name, attacks }) => {
  const query = `INSERT INTO pokemon (name, attack) VALUES (?, ?)`;
  const values = [name, JSON.stringify(attacks)];

  connection.query(query, values, (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`Os ataques do pokemon ${name} foram inseridos com sucesso`);
    }
  });
});

  connection.end();
}

main()
