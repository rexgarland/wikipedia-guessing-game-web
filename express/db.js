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

async function getIdFromSeed(seed) {
  const rows = await knex('game')
    .select('id')
    .whereRaw('seed=?', [seed]);
  return rows[0].id;
}

// package rows from the |choice| table in a friendly json format
async function packageChoices(rows) {
  // collect the link ids
  const ids = rows.map(r => r.link_id);
  const uniqueIds = [...new Set(items)];
  // map the ids to links
  // fill levels [{choices:[{url, is_answer}], sentence}]
  return {data: levels}
}

async function getData(seed) {
  // get the game id
  const game_id = await getIdFromSeed(seed);
  // get pertaining rows
  const rows = await knex('choice')
    .select('level', 'link_id', 'is_answer')
    .whereRaw('game_id=?', [game_id]);
  // package into json
  return await packageChoices(rows);
}

module.exports = {
  seedExists,
  getRandomSeed,
  getData
}