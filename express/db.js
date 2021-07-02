const path = require('path');

const dbfile = path.join(__dirname, '../sqlite/data.db')

const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: dbfile
  },
  useNullAsDefault: true
});
knex.raw('PRAGMA foreign_keys = ON;')

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

async function getData(seed) {
  // get the game id
  const game_id = await getIdFromSeed(seed);
  // get pertaining rows
  const rows = await knex('choice')
    .join('link', 'choice.link_id', 'link.id')
    .groupBy('level')
    .select(knex.raw('group_concat(sentence) as sentence, group_concat(url," ") as urls, group_concat(case when is_answer=1 then url else "" end,"") as answer'))
    .whereRaw('game_id=?',[game_id]);;
  return rows.map(row => ({
      ...row,
      urls: row.urls.split(' ')
    }));
}

async function incrementCount(seed) {
  await knex.raw('UPDATE game SET num_visits = num_visits + 1 WHERE seed=?', [seed]);
}

module.exports = {
  seedExists,
  getRandomSeed,
  getData,
  incrementCount
}