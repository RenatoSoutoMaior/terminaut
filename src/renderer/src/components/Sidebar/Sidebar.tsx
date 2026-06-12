import React from 'react'
import { useSessionStore } from '../../store/sessionStore'
import './Sidebar.css'

const LOGO_V = Date.now()

export function Sidebar(): React.JSX.Element {
  const { settings, sessions, createSession, openSettings } = useSessionStore()
  const { tools } = settings

  const enabledTools = tools.filter((t) => t.enabled)

  // Open session in default cwd
  function handleOpen(toolId: string, cwd?: string): void {
    createSession(toolId, cwd)
  }

  // Pick a folder, then immediately open the session in that folder
  async function handlePickDir(toolId: string): Promise<void> {
    const picked = await window.appAPI.pickDirectory()
    if (picked) handleOpen(toolId, picked)
  }

  function renderTool(tool: typeof enabledTools[number]): React.JSX.Element {
    const count = sessions.filter((s) => s.aiToolId === tool.id).length

    return (
      <div key={tool.id} className="tool-row">
        <button
          className={`tool-btn${tool.id === 'terminal' ? ' tool-btn-terminal' : ''}`}
          title={`Abrir sessão ${tool.name}`}
          onClick={() => handleOpen(tool.id)}
        >
          <span className="tool-icon" style={{ color: tool.color }}>
            {tool.icon}
          </span>
          <span className="tool-name">{tool.name}</span>
          {count > 0 && (
            <span
              className="tool-count"
              style={
                tool.id === 'terminal'
                  ? { background: '#333', color: '#888' }
                  : { background: tool.color + '33', color: tool.color }
              }
            >
              {count}
            </span>
          )}
        </button>

        <button
          className="tool-folder-btn"
          title="Escolher pasta e abrir"
          onClick={() => handlePickDir(tool.id)}
        >
          📁
        </button>
      </div>
    )
  }

  return (
    <aside className="sidebar">
      {/* ── Logo ─────────────────────────────────────────────────────── */}
      <div className="sidebar-logo-area">
        <img
          src={`/terminaut-icon.png?v=${LOGO_V}`}
          alt="Terminaut"
          className="sidebar-logo-img"
          draggable={false}
        />
      </div>

      {/* ── AI Tools ─────────────────────────────────────────────────── */}
      <div className="sidebar-section-label">Ferramentas IA</div>

      <nav className="sidebar-tools">
        {enabledTools.filter((t) => t.id !== 'terminal').map(renderTool)}

        {enabledTools.some((t) => t.id === 'terminal') && (
          <>
            <div className="sidebar-divider" />
            {enabledTools.filter((t) => t.id === 'terminal').map(renderTool)}
          </>
        )}
      </nav>

      {/* ── Open Sessions ────────────────────────────────────────────── */}
      {sessions.length > 0 && (
        <>
          <div className="sidebar-section-label">Abertas ({sessions.length})</div>
          <div className="sidebar-sessions">
            {sessions.map((session) => {
              const tool = tools.find((t) => t.id === session.aiToolId)
              return (
                <div
                  key={session.id}
                  className={`session-item status-${session.status}`}
                  title={`${session.name} — ${session.status}`}
                >
                  <span className="session-icon" style={{ color: tool?.color }}>
                    {tool?.icon}
                  </span>
                  <span className="session-name">{session.name}</span>
                  <span className={`session-dot ${session.status}`} />
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div className="sidebar-footer">
        <button className="settings-btn" onClick={openSettings} title="Configurações">
          <span>⚙</span>
          <span>Configurações</span>
        </button>
      </div>
    </aside>
  )
}
