const path = require('path');

const dbfile = path.join(__dirname, '../data.db')

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
    .where(knex.raw('seed=?', [seed]))
  return rows.length>0
}

module.exports = {
  seedExists
}