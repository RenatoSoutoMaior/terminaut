import React from 'react'
import { useSessionStore } from '../../store/sessionStore'
import type { Session } from '../../types'
import './ContextPanel.css'

interface Props {
  session: Session
  onClose: () => void
}

export function ContextPanel({ session, onClose }: Props): React.JSX.Element {
  const { updateContext } = useSessionStore()
  const ctx = session.context

  function update(field: keyof typeof ctx): (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void {
    return (e) => updateContext(session.id, { [field]: e.target.value })
  }

  return (
    <div className="context-panel">
      <div className="context-header">
        <span className="context-title">Contexto da Sessão</span>
        <button className="context-close" onClick={onClose}>✕</button>
      </div>
      <div className="context-body">
        <div className="ctx-row">
          <label>Objetivo</label>
          <textarea
            rows={2}
            value={ctx.objective}
            onChange={update('objective')}
            placeholder="Descreva o objetivo desta sessão…"
          />
        </div>
        <div className="ctx-row ctx-row-inline">
          <div>
            <label>Repo</label>
            <input type="text" value={ctx.repo} onChange={update('repo')} placeholder="meu-projeto-…" />
          </div>
          <div>
            <label>Branch</label>
            <input type="text" value={ctx.branch} onChange={update('branch')} placeholder="feature/…" />
          </div>
        </div>
        <div className="ctx-row ctx-row-inline">
          <div>
            <label>Card / Azure ID</label>
            <input type="text" value={ctx.cardId} onChange={update('cardId')} placeholder="1234567" />
          </div>
          <div>
            <label>PR / MR</label>
            <input type="text" value={ctx.prUrl} onChange={update('prUrl')} placeholder="!42 ou URL" />
          </div>
        </div>
        <div className="ctx-row">
          <label>Tags</label>
          <input type="text" value={ctx.tags} onChange={update('tags')} placeholder="frontend, api, bugfix" />
        </div>
        <div className="ctx-row">
          <label>Observações</label>
          <textarea
            rows={2}
            value={ctx.notes}
            onChange={update('notes')}
            placeholder="Notas livres…"
          />
        </div>
      </div>
    </div>
  )
}
