import { contextBridge, ipcRenderer } from 'electron'

// ── Terminal API ────────────────────────────────────────────────────────────

const terminalAPI = {
  create: (opts: {
    sessionId: string
    command: string
    cwd?: string
    cols?: number
    rows?: number
  }) => ipcRenderer.invoke('terminal:create', opts),

  write: (sessionId: string, data: string) =>
    ipcRenderer.invoke('terminal:write', { sessionId, data }),

  resize: (sessionId: string, cols: number, rows: number) =>
    ipcRenderer.invoke('terminal:resize', { sessionId, cols, rows }),

  kill: (sessionId: string) =>
    ipcRenderer.invoke('terminal:kill', { sessionId }),

  /**
   * Subscribe to PTY output. Returns an unsubscribe function.
   */
  onData: (
    callback: (payload: { sessionId: string; data: string }) => void
  ): (() => void) => {
    const handler = (
      _: Electron.IpcRendererEvent,
      payload: { sessionId: string; data: string }
    ) => callback(payload)
    ipcRenderer.on('terminal:data', handler)
    return () => ipcRenderer.removeListener('terminal:data', handler)
  },

  /**
   * Subscribe to PTY exit events. Returns an unsubscribe function.
   */
  onExit: (
    callback: (payload: {
      sessionId: string
      exitCode: number
      signal?: string
    }) => void
  ): (() => void) => {
    const handler = (
      _: Electron.IpcRendererEvent,
      payload: { sessionId: string; exitCode: number; signal?: string }
    ) => callback(payload)
    ipcRenderer.on('terminal:exit', handler)
    return () => ipcRenderer.removeListener('terminal:exit', handler)
  }
}

// ── App / System info ────────────────────────────────────────────────────────

const appAPI = {
  getInfo: (): Promise<{ platform: string; defaultShell: string; home: string }> =>
    ipcRenderer.invoke('app:info'),

  pickDirectory: (): Promise<string | null> =>
    ipcRenderer.invoke('dialog:pickDirectory')
}

// ── Window controls ──────────────────────────────────────────────────────────

const windowAPI = {
  minimize: () => ipcRenderer.invoke('win:minimize'),
  maximize: () => ipcRenderer.invoke('win:maximize'),
  close: () => ipcRenderer.invoke('win:close')
}

// ── Expose ───────────────────────────────────────────────────────────────────

contextBridge.exposeInMainWorld('terminalAPI', terminalAPI)
contextBridge.exposeInMainWorld('appAPI', appAPI)
contextBridge.exposeInMainWorld('windowAPI', windowAPI)
