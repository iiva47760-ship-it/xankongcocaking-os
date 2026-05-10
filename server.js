import express from 'express'
import { createServer } from 'http'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(express.json())

const history = []
const settings = {}

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

app.get('/api/history', (req, res) => { res.json(history.slice(-50)) })

app.post('/api/history', (req, res) => {
  const { command } = req.body
  if (command) history.push({ command, timestamp: new Date().toISOString() })
  res.json({ success: true })
})

const HTML = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>XANKONGCOCAKING OS v2.5</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:monospace;background:#030305;color:#00ff9d;min-height:100vh}
.lock{display:flex;align-items:center;justify-content:center;min-height:100vh}
.panel{border:1px solid rgba(0,255,157,0.3);padding:40px;max-width:360px;width:100%;text-align:center}
.icon{font-size:48px;margin-bottom:16px}
h1{font-size:18px;font-weight:900;letter-spacing:0.2em;margin-bottom:8px}
.sub{font-size:10px;opacity:0.4;margin-bottom:32px;letter-spacing:0.3em}
input{width:100%;background:transparent;border:1px solid rgba(0,255,157,0.3);color:#00ff9d;padding:12px;text-align:center;font-family:monospace;font-size:14px;letter-spacing:0.2em;margin-bottom:12px;outline:none}
.btn{width:100%;background:#00ff9d;color:#000;border:none;padding:12px;font-weight:900;font-size:13px;letter-spacing:0.2em;cursor:pointer}
.owner{font-size:10px;opacity:0.2;margin-top:24px}
.app{display:none;flex-direction:column;min-height:100vh}
.sidebar{width:180px;border-right:1px solid rgba(0,255,157,0.15);background:rgba(3,3,8,0.95);position:fixed;top:0;left:0;height:100vh;display:flex;flex-direction:column}
.logo{padding:20px 16px;border-bottom:1px solid rgba(0,255,157,0.15);display:flex;align-items:center;gap:10px;font-weight:900;font-size:11px}
nav{flex:1;padding:8px}
.nav-btn{width:100%;text-align:left;padding:8px 12px;background:transparent;border:1px solid transparent;color:rgba(0,255,157,0.4);font-size:11px;font-weight:700;letter-spacing:0.1em;cursor:pointer;margin-bottom:2px;font-family:monospace}
.nav-btn.active{background:rgba(0,255,157,0.1);border-color:rgba(0,255,157,0.3);color:#00ff9d}
.main{margin-left:180px;flex:1;padding:24px;max-width:900px}
.header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid rgba(0,255,157,0.15)}
.section{display:none}.section.active{display:block}
.card{border:1px solid rgba(0,255,157,0.15);background:#080810;padding:20px;margin-bottom:16px}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px}
.stat-label{font-size:10px;opacity:0.5;margin-bottom:8px;letter-spacing:0.1em}
.stat-val{font-size:24px;font-weight:900}
.terminal{border:1px solid rgba(0,255,157,0.15);background:#000}
.term-header{background:rgba(0,255,157,0.08);border-bottom:1px solid rgba(0,255,157,0.15);padding:8px 16px;font-size:11px;font-weight:700;letter-spacing:0.1em}
.term-out{height:400px;overflow-y:auto;padding:16px;font-size:13px;line-height:1.6}
.term-line{color:rgba(0,255,157,0.7)}
.term-line.cmd{color:#fff}
.term-input{border-top:1px solid rgba(0,255,157,0.15);padding:12px 16px;display:flex;gap:8px}
.term-input input{flex:1;background:transparent;border:none;color:#fff;font-family:monospace;font-size:13px;outline:none}
.prompt{color:#00ff9d;font-weight:700}
</style>
</head>
<body>
<div class="lock" id="lock">
  <div class="panel">
    <div class="icon">⚡</div>
    <h1>XANKONGCOCAKING</h1>
    <p class="sub">OS v2.5 · OWNER ACCESS</p>
    <input type="password" id="codeInput" placeholder="MASTER CODE" />
    <button class="btn" onclick="authenticate()">AUTHENTICATE</button>
    <p class="owner">Дмитрий Коваль Николаевич</p>
  </div>
</div>

<div class="app" id="app">
  <div class="sidebar">
    <div class="logo"><span>⚡</span><span>XKC OS v2.5</span></div>
    <nav>
      <button class="nav-btn active" onclick="showSection('dashboard')">DASHBOARD</button>
      <button class="nav-btn" onclick="showSection('terminal')">TERMINAL</button>
      <button class="nav-btn" onclick="showSection('crypto')">CRYPTO/TON</button>
      <button class="nav-btn" onclick="showSection('settings')">SETTINGS</button>
    </nav>
  </div>
  <div class="main">
    <div class="header">
      <div>
        <h2 id="sectionTitle" style="font-size:18px;font-weight:900;letter-spacing:0.1em">DASHBOARD</h2>
        <p style="font-size:10px;opacity:0.4;margin-top:2px">XANKONGCOCAKING OS v2.5</p>
      </div>
      <span id="priceDisplay" style="font-size:11px;opacity:0.6"></span>
    </div>

    <div class="section active" id="dashboard">
      <div class="grid3">
        <div class="card"><p class="stat-label">TON PRICE</p><p class="stat-val" id="tonPrice" style="color:#00ff9d">--</p></div>
        <div class="card"><p class="stat-label">SYSTEM</p><p class="stat-val" style="color:#4ade80">Online</p></div>
        <div class="card"><p class="stat-label">VERSION</p><p class="stat-val" style="color:#60a5fa">v2.5.0</p></div>
      </div>
      <div class="card">
        <p style="font-size:11px;font-weight:700;margin-bottom:12px;opacity:0.6;letter-spacing:0.1em">QUICK ACTIONS</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button onclick="runCmd('status')" style="border:1px solid rgba(0,255,157,0.3);background:transparent;color:#00ff9d;padding:8px 16px;font-size:11px;font-weight:700;cursor:pointer;font-family:monospace;letter-spacing:0.1em">STATUS</button>
          <button onclick="runCmd('help')" style="border:1px solid rgba(0,255,157,0.3);background:transparent;color:#00ff9d;padding:8px 16px;font-size:11px;font-weight:700;cursor:pointer;font-family:monospace;letter-spacing:0.1em">HELP</button>
          <button onclick="runCmd('history')" style="border:1px solid rgba(0,255,157,0.3);background:transparent;color:#00ff9d;padding:8px 16px;font-size:11px;font-weight:700;cursor:pointer;font-family:monospace;letter-spacing:0.1em">HISTORY</button>
        </div>
      </div>
    </div>

    <div class="section" id="terminal">
      <div class="terminal">
        <div class="term-header">XKC-OS TERMINAL · v2.5</div>
        <div class="term-out" id="termOut">
          <div class="term-line">XANKONGCOCAKING OS v2.5</div>
          <div class="term-line">Ready. Type help.</div>
        </div>
        <div class="term-input">
          <span class="prompt">❯</span>
          <input id="termIn" placeholder="Enter command..." autocomplete="off" onkeydown="if(event.key==='Enter')execCmd()" />
        </div>
      </div>
    </div>

    <div class="section" id="crypto">
      <div class="card">
        <p class="stat-label">TON / USDT LIVE PRICE</p>
        <p class="stat-val" id="tonPriceBig" style="font-size:48px">Loading...</p>
      </div>
      <div class="card">
        <p style="font-size:12px;opacity:0.6;margin-bottom:8px">Connect TON wallet to manage XKC tokens and NFTs.</p>
        <p style="font-size:11px;opacity:0.4">TON Connect integration available in full version.</p>
      </div>
    </div>

    <div class="section" id="settings">
      <div class="card">
        <p style="font-size:12px;font-weight:700;margin-bottom:16px;opacity:0.6;letter-spacing:0.1em">OWNER PROFILE</p>
        <div style="font-size:12px">
          <div style="display:flex;gap:16px;padding:8px 0;border-bottom:1px solid rgba(0,255,157,0.15)"><span style="opacity:0.4;width:80px">Owner</span><span>Дмитрий Коваль Николаевич</span></div>
          <div style="display:flex;gap:16px;padding:8px 0;border-bottom:1px solid rgba(0,255,157,0.15)"><span style="opacity:0.4;width:80px">Email</span><span>ivanbolwan666@gmail.com</span></div>
          <div style="display:flex;gap:16px;padding:8px 0;border-bottom:1px solid rgba(0,255,157,0.15)"><span style="opacity:0.4;width:80px">Telegram</span><span>@sositedruzia</span></div>
          <div style="display:flex;gap:16px;padding:8px 0"><span style="opacity:0.4;width:80px">Phone</span><span>+48 791 057 456</span></div>
        </div>
      </div>
      <div class="card">
        <p style="font-size:12px;opacity:0.6">XANKONGCOCAKING OS v2.5 · React 18 · TypeScript · Express · Socket.io</p>
        <p style="font-size:12px;opacity:0.4;margin-top:8px">Build: March 2026 · Status: ✅ Online</p>
      </div>
    </div>
  </div>
</div>

<script>
let tonPrice = null;

function authenticate() {
  const code = document.getElementById('codeInput').value;
  if (code === 'XKC-777-REALTIME') {
    document.getElementById('lock').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    fetchPrice();
    setInterval(fetchPrice, 60000);
  } else {
    document.getElementById('codeInput').value = '';
    alert('Invalid master code');
  }
}

document.getElementById('codeInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') authenticate();
});

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.getElementById('sectionTitle').textContent = id.toUpperCase();
  event.target.classList.add('active');
}

function addLine(text, isCmd) {
  const out = document.getElementById('termOut');
  const div = document.createElement('div');
  div.className = 'term-line' + (isCmd ? ' cmd' : '');
  div.textContent = text;
  out.appendChild(div);
  out.scrollTop = out.scrollHeight;
}

function execCmd() {
  const input = document.getElementById('termIn');
  const cmd = input.value.trim().toLowerCase();
  if (!cmd) return;
  addLine('> ' + cmd, true);
  if (cmd === 'clear') { document.getElementById('termOut').innerHTML = '<div class="term-line">XANKONGCOCAKING OS v2.5</div><div class="term-line">Ready.</div>'; }
  else if (cmd === 'status') addLine('System: Online | TON: ' + (tonPrice ? '$' + tonPrice.toFixed(2) : 'Loading'));
  else if (cmd === 'help') addLine('Commands: clear, status, help, history');
  else if (cmd === 'history') {
    fetch('/api/history').then(r=>r.json()).then(d=>d.forEach(h=>addLine(h.command))).catch(()=>addLine('No history'));
  }
  else addLine('Unknown. Type help.');
  fetch('/api/history', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({command:cmd})}).catch(()=>{});
  input.value = '';
}

function runCmd(cmd) {
  showSection('terminal');
  setTimeout(() => {
    document.getElementById('termIn').value = cmd;
    execCmd();
  }, 100);
}

function fetchPrice() {
  fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT')
    .then(r=>r.json()).then(d=>{
      tonPrice = parseFloat(d.price);
      const p = '$' + tonPrice.toFixed(2);
      document.getElementById('tonPrice').textContent = p;
      document.getElementById('tonPriceBig').textContent = '$' + tonPrice.toFixed(4);
      document.getElementById('priceDisplay').textContent = 'TON ' + p;
    }).catch(()=>{});
}
</script>
</body>
</html>`

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.send(HTML)
})

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' })
  res.setHeader('Content-Type', 'text/html')
  res.send(HTML)
})

const PORT = parseInt(process.env.PORT || '3000')
app.listen(PORT, '0.0.0.0', () => {
  console.log('XANKONGCOCAKING OS v2.5 on port ' + PORT)
})
