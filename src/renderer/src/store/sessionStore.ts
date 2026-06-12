import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { Session, SessionContext, AppSettings, AITool } from '../types'
import { DEFAULT_SETTINGS } from '../constants/aiTools'

// ── Persistence helpers ─────────────────────────────────────────────────────

const SETTINGS_KEY = 'terminaut:settings:v2'

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return structuredClone(DEFAULT_SETTINGS)
    const saved = JSON.parse(raw) as Partial<AppSettings>
    return {
      tools: saved.tools ?? DEFAULT_SETTINGS.tools,
      defaultCwd: saved.defaultCwd ?? '',
      defaultShell: saved.defaultShell ?? ''
    }
  } catch {
    return structuredClone(DEFAULT_SETTINGS)
  }
}

function saveSettings(s: AppSettings): void {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function emptyContext(): SessionContext {
  return { objective: '', tags: '', repo: '', branch: '', cardId: '', prUrl: '', notes: '' }
}

// ── Store ───────────────────────────────────────────────────────────────────

interface SessionStore {
  sessions: Session[]
  settings: AppSettings
  settingsOpen: boolean
  /** Platform info loaded from main process */
  platform: string
  systemShell: string  // shell reported by main process ($SHELL / COMSPEC)

  // ── Session actions
  createSession: (toolId: string, cwd?: string) => Session
  closeSession: (id: string) => void
  renameSession: (id: string, name: string) => void
  setStatus: (id: string, status: Session['status']) => void
  setMaximized: (id: string, maximized: boolean) => void
  setMinimized: (id: string, minimized: boolean) => void
  updateContext: (id: string, patch: Partial<SessionContext>) => void

  // ── Settings actions
  updateSettings: (patch: Partial<AppSettings>) => void
  updateTool: (toolId: string, patch: Partial<AITool>) => void
  moveTool: (fromIndex: number, toIndex: number) => void
  openSettings: () => void
  closeSettings: () => void

  // ── Bootstrap
  initPlatform: () => Promise<void>
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessions: [],
  settings: loadSettings(),
  settingsOpen: false,
  platform: 'linux',
  systemShell: '/bin/bash',

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  initPlatform: async () => {
    try {
      const info = await window.appAPI.getInfo()
      set({ platform: info.platform, systemShell: info.defaultShell })
      // If user has not configured a default shell, store the system one
      const { settings } = get()
      if (!settings.defaultShell) {
        const updated = { ...settings, defaultShell: info.defaultShell }
        saveSettings(updated)
        set({ settings: updated })
      }
    } catch {
      /* main process may not have responded yet — ignore */
    }
  },

  // ── Session CRUD ──────────────────────────────────────────────────────────

  createSession: (toolId, cwd?) => {
    const { settings, sessions, systemShell } = get()
    const tool = settings.tools.find((t) => t.id === toolId)
    if (!tool) throw new Error(`Unknown tool id: ${toolId}`)

    // Resolve command: empty command → use configured/system shell
    const resolvedCommand =
      tool.command.trim() || settings.defaultShell || systemShell || 'bash'

    const sameType = sessions.filter((s) => s.aiToolId === toolId).length
    const name = `${tool.name} ${sameType + 1}`

    const session: Session = {
      id: uuidv4(),
      name,
      aiToolId: toolId,
      command: resolvedCommand,
      cwd: cwd || settings.defaultCwd || '',
      status: 'starting',
      minimized: false,
      maximized: false,
      context: emptyContext(),
      createdAt: Date.now()
    }

    set((state) => ({ sessions: [...state.sessions, session] }))
    return session
  },

  closeSession: (id) =>
    set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) })),

  renameSession: (id, name) =>
    set((s) => ({
      sessions: s.sessions.map((x) => (x.id === id ? { ...x, name } : x))
    })),

  setStatus: (id, status) =>
    set((s) => ({
      sessions: s.sessions.map((x) => (x.id === id ? { ...x, status } : x))
    })),

  setMaximized: (id, maximized) =>
    set((s) => ({
      sessions: s.sessions.map((x) => (x.id === id ? { ...x, maximized } : x))
    })),

  setMinimized: (id, minimized) =>
    set((s) => ({
      sessions: s.sessions.map((x) => (x.id === id ? { ...x, minimized } : x))
    })),

  updateContext: (id, patch) =>
    set((s) => ({
      sessions: s.sessions.map((x) =>
        x.id === id ? { ...x, context: { ...x.context, ...patch } } : x
      )
    })),

  // ── Settings CRUD ─────────────────────────────────────────────────────────

  updateSettings: (patch) => {
    set((s) => {
      const updated = { ...s.settings, ...patch }
      saveSettings(updated)
      return { settings: updated }
    })
  },

  updateTool: (toolId, patch) => {
    set((s) => {
      const tools = s.settings.tools.map((t) =>
        t.id === toolId ? { ...t, ...patch } : t
      )
      const updated = { ...s.settings, tools }
      saveSettings(updated)
      return { settings: updated }
    })
  },

  moveTool: (fromIndex, toIndex) => {
    set((s) => {
      const tools = [...s.settings.tools]
      const [moved] = tools.splice(fromIndex, 1)
      tools.splice(toIndex, 0, moved)
      const updated = { ...s.settings, tools }
      saveSettings(updated)
      return { settings: updated }
    })
  },

  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false })
}))
