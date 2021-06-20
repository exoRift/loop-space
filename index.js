const express = require('express')
const path = require('path')

const {
  PORT
} = process.env

const app = express()

app.use(express.static(path.join(__dirname, '/src')))
app.get('/', (req, res) => res.sendFile('index.html'))

const server = app.listen(PORT, () => {
  const {
    address,
    port
  } = server.address()

  console.info('API online listening at http://%s:%s', address, port)
})
