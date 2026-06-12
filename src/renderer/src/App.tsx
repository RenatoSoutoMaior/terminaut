import React, { useEffect } from 'react'
import { Sidebar } from './components/Sidebar/Sidebar'
import { TerminalGrid } from './components/TerminalGrid/TerminalGrid'
import { Settings } from './components/Settings/Settings'
import { useSessionStore } from './store/sessionStore'
import './styles/global.css'

export function App(): React.JSX.Element {
  const settingsOpen = useSessionStore((s) => s.settingsOpen)
  const initPlatform = useSessionStore((s) => s.initPlatform)

  // Load platform / default shell from main process once on startup
  useEffect(() => {
    initPlatform()
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden', background: '#0e0e0e' }}>
        <TerminalGrid />
      </main>
      {settingsOpen && <Settings />}
    </div>
  )
}
