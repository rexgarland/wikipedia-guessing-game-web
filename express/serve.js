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

if (process.env.NODE_ENV=='development') {
  app.get('/test', (req, res) => {
    res.render('test.ejs', {
      urls: [
        "https://en.wikipedia.org/wiki/2012_Wolverine%E2%80%93Hoosier_Athletic_Conference_Women%27s_Basketball_Tournament",
        "https://en.wikipedia.org/wiki/Mazaces",
        "https://en.wikipedia.org/wiki/Two_from_the_Vault",
        "https://en.wikipedia.org/wiki/Khirapat"
      ],
      sentence: "Mazakes may have been nominated as satrap of Mesopotamia in reward for his submission, as coins in his name and in a style similar to his Egyptian predecessor Sabakes, are found in this region, and the satrap of Mesopotamia at that time is otherwise unknown."
    })
  })
}

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