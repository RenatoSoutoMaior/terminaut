import React from 'react'
import { useSessionStore } from '../../store/sessionStore'
import { TerminalPanel } from '../TerminalPanel/TerminalPanel'
import './TerminalGrid.css'

function gridCols(count: number): number {
  if (count <= 1) return 1
  if (count === 2) return 2
  if (count === 3) return 3
  if (count <= 4) return 2
  if (count <= 6) return 3
  if (count <= 9) return 3
  return 4
}

function EmptyState(): React.JSX.Element {
  const { settings, createSession } = useSessionStore()
  const enabled = settings.tools.filter((t) => t.enabled)
  const aiTools = enabled.filter((t) => t.id !== 'terminal')
  const terminalTool = enabled.find((t) => t.id === 'terminal')

  return (
    <div className="grid-empty">
      <div className="grid-empty-content">

        {/* ── Logo ───────────────────────────────────────── */}
        <img
          src="/terminaut-icon.png"
          alt="Terminaut"
          className="grid-empty-logo"
          draggable={false}
        />

        {/* ── Subtitle ───────────────────────────────────── */}
        <p className="grid-empty-sub">
          AI Terminal Hub — rode qualquer ferramenta de IA&nbsp;
          <br />sem sair do teclado
        </p>

        {/* ── Divider ────────────────────────────────────── */}
        <div className="grid-empty-divider" />

        {/* ── AI tools grid ──────────────────────────────── */}
        <p className="grid-empty-section-label">Sessão rápida</p>

        <div className="grid-empty-tools">
          {aiTools.map((tool) => (
            <button
              key={tool.id}
              className="quick-tool-btn"
              onClick={() => createSession(tool.id)}
              title={`Abrir ${tool.name}`}
              style={{ '--tool-color': tool.color } as React.CSSProperties}
            >
              <span className="quick-tool-icon">{tool.icon}</span>
              <span className="quick-tool-name">{tool.name}</span>
            </button>
          ))}
        </div>

        {/* ── Terminal secondary action ───────────────────── */}
        {terminalTool && (
          <button
            className="quick-terminal-btn"
            onClick={() => createSession(terminalTool.id)}
            title="Abrir terminal genérico"
            style={{ '--tool-color': terminalTool.color } as React.CSSProperties}
          >
            <span className="quick-terminal-icon">{terminalTool.icon}</span>
            <span>Abrir Terminal</span>
          </button>
        )}

        {/* ── Footer hint ────────────────────────────────── */}
        <p className="grid-empty-footer">
          Ou selecione uma ferramenta na barra lateral à esquerda
        </p>

      </div>
    </div>
  )
}

export function TerminalGrid(): React.JSX.Element {
  const sessions = useSessionStore((s) => s.sessions)
  const maximized = sessions.find((s) => s.maximized)

  if (sessions.length === 0) return <EmptyState />

  if (maximized) {
    return (
      <div className="grid-maximized">
        <TerminalPanel key={maximized.id} session={maximized} />
      </div>
    )
  }

  const cols = gridCols(sessions.length)

  return (
    <div
      className="terminal-grid"
      style={{ '--grid-cols': cols } as React.CSSProperties}
    >
      {sessions.map((session) => (
        <TerminalPanel key={session.id} session={session} />
      ))}
    </div>
  )
}
