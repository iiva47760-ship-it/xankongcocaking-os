import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } })

app.use(express.json())

// In-memory storage (no SQLite needed)
const history = []
const settings = {}

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')))
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '2.5.0', timestamp: new Date().toISOString() })
})

app.get('/api/settings/:key', (req, res) => {
  res.json({ key: req.params.key, value: settings[req.params.key] || null })
})

app.post('/api/settings', (req, res) => {
  const { key, value } = req.body
  if (key) settings[key] = value
  res.json({ success: true })
})

app.get('/api/history', (req, res) => {
  res.json(history.slice(-50))
})

app.post('/api/history', (req, res) => {
  const { command } = req.body
  if (command) history.push({ command, timestamp: new Date().toISOString() })
  res.json({ success: true })
})

app.get('/api/export-code', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename=xkc_os_source.txt')
  res.setHeader('Content-Type', 'text/plain')
  res.send('XANKONGCOCAKING OS v2.5\nhttps://github.com/iiva47760-ship-it/xankongcocaking-os')
})

io.on('connection', (socket) => {
  socket.on('message', (data) => { socket.broadcast.emit('message', data) })
})

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
  })
}

const PORT = parseInt(process.env.PORT || '3000')
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log('XANKONGCOCAKING OS v2.5 on port ' + PORT)
})
