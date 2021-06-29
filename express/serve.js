const express = require('express')
const app = express()

const port = 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect('/123')
})

app.get('/:seed', (req, res) => {
  // prevent sql injection
  req.params.seed
  res.render('index.ejs', {
    seed: req.params.seed
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})