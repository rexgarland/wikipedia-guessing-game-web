const express = require('express')
const app = express()

const db = require('./db')

const port = 3000

const digits = '0123456789'
const isValidSeed = seed => [...seed].reduce((a,v) => a*(digits.includes(v)), true)

app.use(express.static('public'))
app.use(express.json())

app.get('/', async (req, res) => {
  const seed = await db.getRandomSeed();
  res.redirect(`/${seed}`)
})

app.get('/:seed', async (req, res) => {
  const seed = req.params.seed
  if (isValidSeed(seed) && await db.seedExists(seed)) {
    res.render('index.ejs', {seed})
    await db.incrementCount(seed);
  } else {
    res.render('invalid.ejs', {seed})
  }
})

app.get('/data/:seed', async (req, res) => {
  const seed = req.params.seed
  if (isValidSeed(seed) && await db.seedExists(seed)) {
    const data = await db.getData(seed);
    res.send(data);
  } else {
    res.render('invalid.ejs', {seed})
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})