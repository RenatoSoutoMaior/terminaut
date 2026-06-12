import React, { useRef, useState } from 'react'
import { useSessionStore } from '../../store/sessionStore'
import { DEFAULT_AI_TOOLS, SHELL_OPTIONS } from '../../constants/aiTools'
import './Settings.css'

export function Settings(): React.JSX.Element {
  const {
    settings, platform, systemShell,
    updateTool, updateSettings, moveTool, closeSettings
  } = useSessionStore()

  const [defaultCwd, setDefaultCwd] = useState(settings.defaultCwd)

  // ── Drag-and-drop state ──────────────────────────────────────────────────
  const dragFromIdx = useRef<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  function handleDragStart(idx: number) {
    dragFromIdx.current = idx
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    setDragOverIdx(idx)
  }

  function handleDrop(toIdx: number) {
    const from = dragFromIdx.current
    if (from !== null && from !== toIdx) moveTool(from, toIdx)
    dragFromIdx.current = null
    setDragOverIdx(null)
  }

  function handleDragEnd() {
    dragFromIdx.current = null
    setDragOverIdx(null)
  }

  // ── Other handlers ───────────────────────────────────────────────────────
  const currentShell = settings.defaultShell || systemShell
  const platformShells = SHELL_OPTIONS.filter(
    (s) => s.platforms.includes(platform as 'linux' | 'darwin' | 'win32') || platform === ''
  )

  function saveCwd() { updateSettings({ defaultCwd }) }

  function handleShellChange(cmd: string) { updateSettings({ defaultShell: cmd }) }

  function handleReset() {
    if (!confirm('Restaurar todos os comandos para o padrão?')) return
    DEFAULT_AI_TOOLS.forEach((tool) => {
      updateTool(tool.id, { command: tool.command, name: tool.name, enabled: tool.enabled })
    })
  }

  const tools = settings.tools

  return (
    <div
      className="settings-overlay"
      onClick={(e) => e.target === e.currentTarget && closeSettings()}
    >
      <div className="settings-modal">
        <div className="settings-header">
          <span className="settings-title">⚙ Configurações</span>
          <button className="settings-close" onClick={closeSettings} title="Fechar">✕</button>
        </div>

        <div className="settings-body">

          {/* ── Default Shell ──────────────────────────────────────────── */}
          <section className="cfg-section">
            <div className="cfg-section-title">Shell padrão (Terminal genérico)</div>
            <p className="cfg-hint">
              Usado ao abrir uma sessão de <strong>Terminal</strong>.<br />
              Shell atual do sistema: <code>{systemShell}</code>
            </p>

            <div className="shell-options">
              {platformShells.map((sh) => (
                <label key={sh.id} className={`shell-option ${currentShell === sh.command ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="shell"
                    value={sh.command}
                    checked={currentShell === sh.command}
                    onChange={() => handleShellChange(sh.command)}
                  />
                  <span className="shell-label">{sh.label}</span>
                  <code className="shell-cmd">{sh.command}</code>
                </label>
              ))}

              <label className={`shell-option shell-custom ${!platformShells.some(s => s.command === currentShell) ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="shell"
                  value="__custom__"
                  checked={!platformShells.some((s) => s.command === currentShell)}
                  onChange={() => { /* handled via text input */ }}
                  readOnly
                />
                <span className="shell-label">Personalizado</span>
                <input
                  type="text"
                  className="cfg-input shell-custom-input"
                  placeholder="/usr/bin/fish ou C:\msys64\usr\bin\bash.exe"
                  value={!platformShells.some((s) => s.command === currentShell) ? currentShell : ''}
                  onChange={(e) => handleShellChange(e.target.value)}
                  spellCheck={false}
                />
              </label>
            </div>
          </section>

          {/* ── Default Working Directory ──────────────────────────────── */}
          <section className="cfg-section">
            <div className="cfg-section-title">Diretório de trabalho padrão</div>
            <input
              type="text"
              className="cfg-input"
              value={defaultCwd}
              onChange={(e) => setDefaultCwd(e.target.value)}
              onBlur={saveCwd}
              onKeyDown={(e) => e.key === 'Enter' && saveCwd()}
              placeholder="Deixe vazio para usar o diretório home"
              spellCheck={false}
            />
          </section>

          {/* ── AI Tool Commands + order ───────────────────────────────── */}
          <section className="cfg-section">
            <div className="cfg-section-title">
              Ferramentas IA — ordem e comandos
              <button className="reset-btn" onClick={handleReset}>↺ Padrão</button>
            </div>
            <p className="cfg-hint">
              Arraste as linhas para reordenar. Use <strong>↑ ↓</strong> para mover.
              A ordem reflete na sidebar e na tela inicial.
            </p>

            {tools.map((tool, idx) => (
              <div
                key={tool.id}
                className={[
                  'tool-cfg-row',
                  dragOverIdx === idx ? 'drag-over' : '',
                  dragFromIdx.current === idx ? 'dragging' : ''
                ].filter(Boolean).join(' ')}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={() => handleDrop(idx)}
                onDragEnd={handleDragEnd}
              >
                <div className="tool-cfg-top">
                  {/* Drag handle */}
                  <span className="tool-drag-handle" title="Arrastar para reordenar">⠿</span>

                  <span className="tool-cfg-icon" style={{ color: tool.color }}>{tool.icon}</span>
                  <span className="tool-cfg-name">{tool.name}</span>

                  {/* Up / Down buttons */}
                  <div className="tool-order-btns">
                    <button
                      className="order-btn"
                      title="Mover para cima"
                      disabled={idx === 0}
                      onClick={() => moveTool(idx, idx - 1)}
                    >↑</button>
                    <button
                      className="order-btn"
                      title="Mover para baixo"
                      disabled={idx === tools.length - 1}
                      onClick={() => moveTool(idx, idx + 1)}
                    >↓</button>
                  </div>

                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={tool.enabled}
                      onChange={(e) => updateTool(tool.id, { enabled: e.target.checked })}
                    />
                    Visível
                  </label>
                </div>

                <div className="tool-cfg-inputs">
                  <input
                    type="text"
                    className="cfg-input cfg-input-mono"
                    value={tool.command}
                    onChange={(e) => updateTool(tool.id, { command: e.target.value })}
                    placeholder={tool.id === 'terminal' ? '(usa shell padrão acima)' : `ex: ${tool.id}`}
                    spellCheck={false}
                  />
                  <input
                    type="text"
                    className="cfg-input cfg-input-name"
                    value={tool.name}
                    onChange={(e) => updateTool(tool.id, { name: e.target.value })}
                    placeholder="Nome de exibição"
                  />
                </div>
              </div>
            ))}
          </section>

          {/* ── About ─────────────────────────────────────────────────── */}
          <section className="cfg-section">
            <div className="cfg-section-title">Sobre</div>
            <p className="cfg-hint">
              <strong>Terminaut</strong> v0.2.0 — AI Terminal Hub<br />
              Múltiplas sessões de IA em um workspace unificado.<br />
              Plataforma: <code>{platform || '…'}</code>
            </p>
            <p className="cfg-hint cfg-hint-author">
              Desenvolvido por Renato Maior
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
