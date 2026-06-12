import React, { useEffect, useRef, useState } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'
import { useSessionStore } from '../../store/sessionStore'
import { ContextPanel } from '../ContextPanel/ContextPanel'
import { getSetupGuide } from '../../constants/setupGuides'
import type { Session } from '../../types'
import './TerminalPanel.css'

interface Props {
  session: Session
}

const TERMINAL_THEME = {
  background: '#111111',
  foreground: '#e8e8e8',
  cursor: '#e8e8e8',
  cursorAccent: '#111111',
  selectionBackground: 'rgba(255,255,255,0.2)',
  black:         '#1a1a1a',
  red:           '#f87171',
  green:         '#4ade80',
  yellow:        '#fbbf24',
  blue:          '#60a5fa',
  magenta:       '#c084fc',
  cyan:          '#22d3ee',
  white:         '#d4d4d4',
  brightBlack:   '#404040',
  brightRed:     '#fca5a5',
  brightGreen:   '#86efac',
  brightYellow:  '#fde68a',
  brightBlue:    '#93c5fd',
  brightMagenta: '#d8b4fe',
  brightCyan:    '#67e8f9',
  brightWhite:   '#f5f5f5'
}

export function TerminalPanel({ session }: Props): React.JSX.Element {
  // The terminal container is ALWAYS rendered — never conditionally.
  // We hide it with CSS when minimized so xterm never gets unmounted.
  const containerRef = useRef<HTMLDivElement>(null)

  // Internal terminal state kept in refs (not React state — no re-renders needed)
  const termRef    = useRef<Terminal | null>(null)
  const fitRef     = useRef<FitAddon | null>(null)

  const { closeSession, renameSession, setStatus, setMaximized, setMinimized, settings } =
    useSessionStore()

  const tool = settings.tools.find((t) => t.id === session.aiToolId)

  const [editingName, setEditingName]   = useState(false)
  const [nameInput,   setNameInput]     = useState(session.name)
  const [contextOpen, setContextOpen]   = useState(false)

  // ── Helpers ─────────────────────────────────────────────────────────────

  function fitAndSync() {
    const term = termRef.current
    const fit  = fitRef.current
    if (!term || !fit) return
    try {
      fit.fit()
      window.terminalAPI.resize(session.id, term.cols, term.rows)
    } catch { /* ignore */ }
  }

  // ── MAIN EFFECT: create terminal + PTY, subscribe to events ─────────────
  //
  // Runs once per session.id (which is a stable UUID).
  // All cleanup (terminal dispose + PTY kill + listener removal) happens in
  // the return function — safe for both unmount and React double-invokeation.
  //
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // ── 1. Create xterm instance ──────────────────────────────────────────
    const term = new Terminal({
      theme: TERMINAL_THEME,
      fontFamily: '"Cascadia Code", "JetBrains Mono", "Fira Code", Menlo, "Courier New", monospace',
      fontSize: 13,
      lineHeight: 1.2,
      letterSpacing: 0,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 10000,
      allowProposedApi: true,
      // Allow right-click to work naturally (browser handles clipboard)
      rightClickSelectsWord: true,
    })

    const fitAddon   = new FitAddon()
    const linksAddon = new WebLinksAddon()
    term.loadAddon(fitAddon)
    term.loadAddon(linksAddon)
    term.open(container)

    termRef.current = term
    fitRef.current  = fitAddon

    // ── 2. Fit + focus + start PTY after paint ────────────────────────────
    const rafId = requestAnimationFrame(() => {
      try { fitAddon.fit() } catch { /* container may not be visible yet */ }

      // Auto-focus the terminal so keyboard input goes directly to the PTY
      // (prevents Enter from firing sidebar buttons after opening a session)
      term.focus()

      // Show Claude-specific trust hint before the CLI starts
      if (session.aiToolId === 'claude') {
        term.writeln('\x1b[2mDica: se o Claude pedir "trust da pasta", digite \x1b[0m\x1b[33my\x1b[0m\x1b[2m + Enter para aceitar (só precisa fazer isso uma vez por pasta).\x1b[0m')
        term.writeln('')
      }

      const { cols, rows } = term
      window.terminalAPI
        .create({
          sessionId: session.id,
          command:   session.command,
          cwd:       session.cwd || undefined,
          cols,
          rows
        })
        .then((result) => {
          if (result.success) {
            setStatus(session.id, 'running')
            term.focus()   // re-focus after async create confirms success
          } else {
            // Show tool-specific installation guide
            const toolName = tool?.name ?? session.aiToolId
            const lines = getSetupGuide(session.aiToolId, toolName, session.command)
            term.writeln('')
            lines.forEach((line) => term.writeln(line))
            term.writeln('')
            setStatus(session.id, 'error')
          }
        })
        .catch((err) => {
          term.writeln(`\x1b[31mErro interno: ${String(err)}\x1b[0m`)
          setStatus(session.id, 'error')
        })
    })

    // ── 3. Forward keyboard / paste input to PTY ─────────────────────────
    const inputDispose = term.onData((data) => {
      window.terminalAPI.write(session.id, data)
    })

    // ── 4. Forward binary data (e.g. mouse reports) ───────────────────────
    const binaryDispose = term.onBinary((data) => {
      window.terminalAPI.write(session.id, data)
    })

    // ── 5. Receive PTY output ──────────────────────────────────────────────
    const offData = window.terminalAPI.onData(({ sessionId, data }) => {
      if (sessionId === session.id) {
        term.write(data)
      }
    })

    // ── 6. Handle PTY exit ────────────────────────────────────────────────
    const offExit = window.terminalAPI.onExit(({ sessionId, exitCode }) => {
      if (sessionId !== session.id) return
      setStatus(session.id, 'stopped')
      const msg = exitCode === 0
        ? '\x1b[2m ─ processo encerrado ─ \x1b[0m'
        : `\x1b[31m ─ processo encerrado (código ${exitCode}) ─ \x1b[0m`
      term.writeln(`\r\n${msg}`)
    })

    // ── 7. Cleanup ────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId)
      inputDispose.dispose()
      binaryDispose.dispose()
      offData()
      offExit()
      term.dispose()
      termRef.current = null
      fitRef.current  = null
      // Kill PTY (best effort; may already be gone)
      window.terminalAPI.kill(session.id).catch(() => { /* ignore */ })
    }
  }, [session.id]) // session.id is a stable UUID

  // ── Resize observer ────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver(fitAndSync)
    ro.observe(container)
    return () => ro.disconnect()
  }, [session.id])

  // ── Re-fit when panel is restored from minimized ───────────────────────
  useEffect(() => {
    if (session.minimized) return
    const id = setTimeout(fitAndSync, 60)
    return () => clearTimeout(id)
  }, [session.minimized])

  // ── Re-fit when panel is restored from maximized ───────────────────────
  useEffect(() => {
    const id = setTimeout(fitAndSync, 60)
    return () => clearTimeout(id)
  }, [session.maximized])

  // ── Name editing ───────────────────────────────────────────────────────

  function commitRename(): void {
    setEditingName(false)
    const trimmed = nameInput.trim()
    if (trimmed && trimmed !== session.name) renameSession(session.id, trimmed)
    else setNameInput(session.name)
  }

  function handleClose(): void {
    window.terminalAPI.kill(session.id).catch(() => { /* ignore */ })
    closeSession(session.id)
  }

  const hasContext = Object.values(session.context).some((v) => v.trim() !== '')

  return (
    <div
      className={[
        'terminal-panel',
        session.minimized ? 'is-minimized' : '',
        `status-${session.status}`
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="panel-header">
        <span className="panel-tool-icon" style={{ color: tool?.color }}>
          {tool?.icon ?? '$'}
        </span>

        {editingName ? (
          <input
            className="panel-name-input"
            value={nameInput}
            autoFocus
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter')  commitRename()
              if (e.key === 'Escape') { setNameInput(session.name); setEditingName(false) }
            }}
          />
        ) : (
          <span
            className="panel-name"
            title="Duplo-clique para renomear"
            onDoubleClick={() => { setNameInput(session.name); setEditingName(true) }}
          >
            {session.name}
          </span>
        )}

        <span className={`panel-status ${session.status}`} title={session.status}>
          {session.status === 'starting' && '◌'}
          {session.status === 'running'  && '●'}
          {session.status === 'stopped'  && '○'}
          {session.status === 'error'    && '✕'}
        </span>

        <div className="panel-actions">
          <button
            className={`act-btn ${contextOpen ? 'active' : ''} ${hasContext ? 'has-data' : ''}`}
            title="Contexto / Anotações (≡)"
            onClick={() => setContextOpen((v) => !v)}
          >
            ≡
          </button>
          <button
            className="act-btn"
            title={session.minimized ? 'Restaurar' : 'Minimizar'}
            onClick={() => setMinimized(session.id, !session.minimized)}
          >
            {session.minimized ? '▲' : '▼'}
          </button>
          <button
            className="act-btn"
            title={session.maximized ? 'Restaurar' : 'Maximizar tela cheia'}
            onClick={() => setMaximized(session.id, !session.maximized)}
          >
            {session.maximized ? '⊡' : '⊞'}
          </button>
          <button className="act-btn close-btn" title="Fechar sessão" onClick={handleClose}>
            ✕
          </button>
        </div>
      </div>

      {/* ── Context panel (collapsible) ───────────────────────────────── */}
      {contextOpen && !session.minimized && (
        <ContextPanel session={session} onClose={() => setContextOpen(false)} />
      )}

      {/* ── Terminal container — ALWAYS in DOM, hidden via CSS when minimized */}
      <div
        ref={containerRef}
        className="panel-terminal-wrap"
        aria-hidden={session.minimized}
        onClick={() => termRef.current?.focus()}
      />
    </div>
  )
}
