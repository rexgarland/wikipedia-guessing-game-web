const path = require('path');

const dbfile = path.join(__dirname, '../sqlite/data.db')

const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: dbfile
  },
  useNullAsDefault: true
})

async function seedExists(seed) {
  const rows = await knex('game')
    .select('id')
    .whereRaw('seed=?', [seed])
  return rows.length>0
}

async function getRandomSeed() {
  const rows = await knex('game')
    .select('seed')
    .orderByRaw('RANDOM()')
    .limit(1);
  return rows[0].seed;
}

module.exports = {
  seedExists,
  getRandomSeed
}