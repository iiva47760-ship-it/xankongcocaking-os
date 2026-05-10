import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import App from './App.tsx'
import './index.css'

const manifestUrl = 'https://raw.githubusercontent.com/iiva47760-ship-it/xankongcocaking-os/main/tonconnect-manifest.json'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </StrictMode>,
)
