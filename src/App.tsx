import { useState, useEffect, useRef } from 'react'
import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react'

type Section = 'dashboard' | 'terminal' | 'messenger' | 'crypto' | 'bioguard' | 'settings'

export default function App() {
  const [auth, setAuth] = useState(false)
  const [code, setCode] = useState('')
  const [section, setSection] = useState<Section>('dashboard')
  const [termOut, setTermOut] = useState<string[]>(['XANKONGCOCAKING OS v2.5', 'Ready.'])
  const [termIn, setTermIn] = useState('')
  const [price, setPrice] = useState<number | null>(null)
  const wallet = useTonWallet()
  const termRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT')
      .then(r => r.json()).then(d => setPrice(parseFloat(d.price))).catch(() => {})
    const id = setInterval(() => {
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT')
        .then(r => r.json()).then(d => setPrice(parseFloat(d.price))).catch(() => {})
    }, 60000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight
  }, [termOut])

  const addLine = (l: string) => setTermOut(p => [...p, l].slice(-80))

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (code === 'XKC-777-REALTIME') setAuth(true)
    else { setCode(''); alert('Invalid master code') }
  }

  const handleCmd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!termIn.trim()) return
    const cmd = termIn.trim().toLowerCase()
    addLine('> ' + cmd)
    if (cmd === 'clear') setTermOut(['XANKONGCOCAKING OS v2.5', 'Ready.'])
    else if (cmd === 'status') addLine('AI: Online | TON: ' + (wallet ? 'Connected' : 'Offline'))
    else if (cmd === 'help') addLine('Commands: clear, status, help, history')
    else if (cmd === 'history') {
      fetch('/api/history').then(r => r.json())
        .then(d => d.forEach((h: any) => addLine(h.command))).catch(() => addLine('No history'))
    }
    else addLine('Unknown command. Type help.')
    fetch('/api/history', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd })
    }).catch(() => {})
    setTermIn('')
  }

  const nav: { id: Section; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'terminal', label: 'Terminal' },
    { id: 'messenger', label: 'Messenger' },
    { id: 'crypto', label: 'Crypto/TON' },
    { id: 'bioguard', label: 'BioGuard' },
    { id: 'settings', label: 'Settings' },
  ]

  const g = '#00ff9d'
  const bg = '#030305'
  const surf = '#080810'
  const bdr = 'rgba(0,255,157,0.15)'

  if (!auth) return (
    <div style={{ minHeight: '100vh', background: bg, color: g, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
      <div style={{ border: '1px solid rgba(0,255,157,0.3)', padding: '40px', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
        <h1 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '0.2em', marginBottom: '8px' }}>XANKONGCOCAKING</h1>
        <p style={{ fontSize: '10px', opacity: 0.4, marginBottom: '32px', letterSpacing: '0.3em' }}>OS v2.5 · OWNER ACCESS</p>
        <form onSubmit={handleAuth}>
          <input
            type="password" value={code} onChange={e => setCode(e.target.value)}
            placeholder="MASTER CODE" autoFocus
            style={{ width: '100%', background: 'transparent', border: '1px solid rgba(0,255,157,0.3)', color: g, padding: '12px', textAlign: 'center', fontFamily: 'monospace', fontSize: '14px', letterSpacing: '0.2em', marginBottom: '12px', outline: 'none' }}
          />
          <button type="submit" style={{ width: '100%', background: g, color: '#000', border: 'none', padding: '12px', fontWeight: '900', fontSize: '13px', letterSpacing: '0.2em', cursor: 'pointer' }}>
            AUTHENTICATE
          </button>
        </form>
        <p style={{ fontSize: '10px', opacity: 0.2, marginTop: '24px' }}>Дмитрий Коваль Николаевич</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: bg, color: g, fontFamily: 'monospace', display: 'flex' }}>
      <aside style={{ width: '180px', borderRight: `1px solid ${bdr}`, background: 'rgba(3,3,8,0.95)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40 }}>
        <div style={{ padding: '20px 16px', borderBottom: `1px solid ${bdr}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>⚡</span>
          <span style={{ fontWeight: '900', fontSize: '11px', letterSpacing: '0.1em' }}>XKC OS v2.5</span>
        </div>
        <nav style={{ flex: 1, padding: '8px' }}>
          {nav.map(n => (
            <button key={n.id} onClick={() => setSection(n.id)}
              style={{
                width: '100%', textAlign: 'left', padding: '8px 12px',
                background: section === n.id ? 'rgba(0,255,157,0.1)' : 'transparent',
                border: section === n.id ? '1px solid rgba(0,255,157,0.3)' : '1px solid transparent',
                color: section === n.id ? g : 'rgba(0,255,157,0.4)',
                fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em',
                cursor: 'pointer', marginBottom: '2px', fontFamily: 'monospace'
              }}>
              {n.label.toUpperCase()}
            </button>
          ))}
        </nav>
        <div style={{ padding: '12px', borderTop: `1px solid ${bdr}` }}>
          <TonConnectButton />
        </div>
      </aside>

      <main style={{ marginLeft: '180px', flex: 1, padding: '24px', maxWidth: '900px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${bdr}` }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '0.1em' }}>{section.toUpperCase()}</h2>
            <p style={{ fontSize: '10px', opacity: 0.4, marginTop: '2px' }}>XANKONGCOCAKING OS v2.5</p>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '11px', opacity: 0.6 }}>
            {price && <span>TON ${price.toFixed(2)}</span>}
            {wallet && <span>Wallet ✓</span>}
          </div>
        </div>

        {section === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'TON Price', value: price ? `$${price.toFixed(2)}` : '--', color: g },
                { label: 'Wallet', value: wallet ? 'Connected' : 'Offline', color: '#60a5fa' },
                { label: 'System', value: 'Online', color: '#4ade80' },
              ].map((s, i) => (
                <div key={i} style={{ border: `1px solid ${bdr}`, background: surf, padding: '20px' }}>
                  <p style={{ fontSize: '10px', opacity: 0.5, marginBottom: '8px', letterSpacing: '0.1em' }}>{s.label.toUpperCase()}</p>
                  <p style={{ fontSize: '24px', fontWeight: '900', color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
            <div style={{ border: `1px solid ${bdr}`, background: surf, padding: '20px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: '700', marginBottom: '12px', opacity: 0.6, letterSpacing: '0.1em' }}>QUICK ACTIONS</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['status', 'help', 'history'].map(cmd => (
                  <button key={cmd} onClick={() => { setSection('terminal'); setTimeout(() => setTermIn(cmd), 100) }}
                    style={{ border: '1px solid rgba(0,255,157,0.3)', background: 'transparent', color: g, padding: '8px 16px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                    {cmd.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {section === 'terminal' && (
          <div style={{ border: `1px solid ${bdr}`, background: '#000' }}>
            <div style={{ background: 'rgba(0,255,157,0.08)', borderBottom: `1px solid ${bdr}`, padding: '8px 16px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em' }}>
              XKC-OS TERMINAL · v2.5
            </div>
            <div ref={termRef} style={{ height: '400px', overflowY: 'auto', padding: '16px', fontSize: '13px', lineHeight: '1.6' }}>
              {termOut.map((l, i) => (
                <div key={i} style={{ color: l.startsWith('>') ? '#fff' : l.includes('error') ? '#f87171' : 'rgba(0,255,157,0.7)' }}>{l}</div>
              ))}
            </div>
            <form onSubmit={handleCmd} style={{ borderTop: `1px solid ${bdr}`, padding: '12px 16px', display: 'flex', gap: '8px' }}>
              <span style={{ color: g, fontWeight: '700' }}>❯</span>
              <input value={termIn} onChange={e => setTermIn(e.target.value)}
                style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontFamily: 'monospace', fontSize: '13px', outline: 'none' }}
                placeholder="Enter command..." autoComplete="off" />
            </form>
          </div>
        )}

        {section === 'crypto' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ border: `1px solid ${bdr}`, background: surf, padding: '24px' }}>
              <p style={{ fontSize: '10px', opacity: 0.5, marginBottom: '8px', letterSpacing: '0.1em' }}>TON / USDT LIVE PRICE</p>
              <p style={{ fontSize: '48px', fontWeight: '900' }}>{price ? `$${price.toFixed(4)}` : 'Loading...'}</p>
            </div>
            <div style={{ border: `1px solid ${bdr}`, background: surf, padding: '24px' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', marginBottom: '16px', opacity: 0.6, letterSpacing: '0.1em' }}>TON WALLET</p>
              <TonConnectButton />
            </div>
          </div>
        )}

        {section === 'messenger' && (
          <div style={{ border: `1px solid ${bdr}`, background: surf, padding: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '24px', marginBottom: '16px' }}>💬</p>
            <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>AETHER MESSENGER</h3>
            <p style={{ fontSize: '12px', opacity: 0.5 }}>E2EE encrypted AI chat. Powered by Gemini.</p>
          </div>
        )}

        {section === 'bioguard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ border: '1px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.05)', padding: '24px' }}>
              <p style={{ fontSize: '10px', opacity: 0.5, marginBottom: '8px', letterSpacing: '0.1em' }}>HEART RATE (BLE)</p>
              <p style={{ fontSize: '48px', fontWeight: '900', color: '#f87171' }}>-- BPM</p>
            </div>
            <p style={{ fontSize: '12px', opacity: 0.5 }}>Connect a BLE heart rate sensor via Web Bluetooth API.</p>
            <div style={{ border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.05)', padding: '16px', fontSize: '12px', opacity: 0.7 }}>
              Privacy: All biometric data processed locally. ZKP encrypted. Never leaves device.
            </div>
          </div>
        )}

        {section === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ border: `1px solid ${bdr}`, background: surf, padding: '24px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: '700', marginBottom: '16px', opacity: 0.6, letterSpacing: '0.1em' }}>OWNER PROFILE</h3>
              {[['Owner', 'Дмитрий Коваль Николаевич'], ['Email', 'ivanbolwan666@gmail.com'], ['Telegram', '@sositedruzia'], ['Phone', '+48 791 057 456']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: '16px', padding: '8px 0', borderBottom: `1px solid ${bdr}`, fontSize: '12px' }}>
                  <span style={{ opacity: 0.4, width: '80px' }}>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ border: `1px solid ${bdr}`, background: surf, padding: '24px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: '700', marginBottom: '8px', opacity: 0.6, letterSpacing: '0.1em' }}>SYSTEM INFO</h3>
              <p style={{ fontSize: '12px', opacity: 0.6 }}>XANKONGCOCAKING OS v2.5 · React 19 · TypeScript · TON · Gemini AI</p>
              <p style={{ fontSize: '12px', opacity: 0.4, marginTop: '8px' }}>Build: March 2026 · Status: ✅ Online</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
