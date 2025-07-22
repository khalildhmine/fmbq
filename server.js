const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const path = require('path')
const { initSocketIO } = require('./lib/socketio')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  // Initialize Socket.IO with our HTTP server
  initSocketIO(server)

  const port = process.env.PORT || 3000
  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
