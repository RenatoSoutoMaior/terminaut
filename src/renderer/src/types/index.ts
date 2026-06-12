// ── AI Tool ────────────────────────────────────────────────────────────────

export interface AITool {
  id: string
  name: string
  /** Shell command to execute. Supports arguments separated by spaces. */
  command: string
  icon: string
  color: string
  enabled: boolean
}

// ── Session Context (annotations) ─────────────────────────────────────────

export interface SessionContext {
  objective: string
  tags: string
  repo: string
  branch: string
  cardId: string
  prUrl: string
  notes: string
}

// ── Session ────────────────────────────────────────────────────────────────

export interface Session {
  id: string
  name: string
  aiToolId: string
  command: string
  cwd: string
  status: 'starting' | 'running' | 'stopped' | 'error'
  minimized: boolean
  maximized: boolean
  context: SessionContext
  createdAt: number
}

// ── Shell option (for the shell picker) ───────────────────────────────────

export interface ShellOption {
  id: string
  label: string
  command: string
  platforms: Array<'linux' | 'darwin' | 'win32'>
}

// ── App Settings ───────────────────────────────────────────────────────────

export interface AppSettings {
  tools: AITool[]
  defaultCwd: string
  defaultShell: string
}

// ── Window & App APIs (preload bridges) ───────────────────────────────────

export interface TerminalAPI {
  create: (opts: {
    sessionId: string
    command: string
    cwd?: string
    cols?: number
    rows?: number
  }) => Promise<{ success: boolean; error?: string }>
  write: (sessionId: string, data: string) => Promise<void>
  resize: (sessionId: string, cols: number, rows: number) => Promise<void>
  kill: (sessionId: string) => Promise<void>
  onData: (callback: (payload: { sessionId: string; data: string }) => void) => () => void
  onExit: (callback: (payload: { sessionId: string; exitCode: number; signal?: string }) => void) => () => void
}

export interface AppAPI {
  getInfo: () => Promise<{ platform: string; defaultShell: string; home: string }>
  pickDirectory: () => Promise<string | null>
}

export interface WindowAPI {
  minimize: () => Promise<void>
  maximize: () => Promise<void>
  close: () => Promise<void>
}

declare global {
  interface Window {
    terminalAPI: TerminalAPI
    appAPI: AppAPI
    windowAPI: WindowAPI
  }
}
