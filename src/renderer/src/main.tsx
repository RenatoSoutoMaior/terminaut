import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'

// StrictMode is intentionally omitted — it causes double-invoke of useEffect
// which breaks PTY sessions (terminal mounts → kills PTY → remounts blank).
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)
