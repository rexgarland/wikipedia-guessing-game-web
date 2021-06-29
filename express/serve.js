const express = require('express')
const app = express()

const port = 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect('/123')
})

const digits = '0123456789'
const isValidSeed = seed => [...seed].reduce((a,v) => a*(digits.includes(v)), true)

app.get('/:seed', (req, res) => {
  const seed = req.params.seed
  if (isValidSeed(seed)) {
    res.render('index.ejs', {seed})
  } else {
    res.redirect('/');
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})