import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import path from 'path'
import { fileURLToPath } from 'url'
import { getSetting, setSetting, addHistory, getHistory } from './database.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } })

app.use(express.json())

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')))
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '2.5.0', timestamp: new Date().toISOString() })
})

app.get('/api/settings/:key', (req, res) => {
  const value = getSetting(req.params.key)
  res.json({ key: req.params.key, value })
})

app.post('/api/settings', (req, res) => {
  const { key, value } = req.body
  if (!key || value === undefined) return res.status(400).json({ error: 'key and value required' })
  setSetting(key, String(value))
  res.json({ success: true, key })
})

app.get('/api/history', (_req, res) => { res.json(getHistory()) })

app.post('/api/history', (req, res) => {
  const { command } = req.body
  if (command) addHistory(command)
  res.json({ success: true })
})

app.get('/api/export-code', (_req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename=xkc_os_source.txt')
  res.setHeader('Content-Type', 'text/plain')
  res.send('XANKONGCOCAKING OS v2.5\nhttps://github.com/iiva47760-ship-it/xankongcocaking-os')
})

io.on('connection', (socket) => {
  socket.on('message', (data) => { socket.broadcast.emit('message', data) })
})

if (process.env.NODE_ENV === 'production') {
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
  })
}

const PORT = parseInt(process.env.PORT || '3000')
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`XANKONGCOCAKING OS v2.5 running on port ${PORT}`)
})
