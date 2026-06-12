import { app, shell, BrowserWindow, ipcMain, nativeImage, dialog } from 'electron'
import { join } from 'path'
import { execFileSync } from 'child_process'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import * as pty from 'node-pty'
import { platform } from 'os'

// ── GPU workaround for Linux environments without hardware acceleration
if (platform() === 'linux') {
  app.commandLine.appendSwitch('--disable-gpu-sandbox')
  app.commandLine.appendSwitch('--disable-software-rasterizer')
}

const IS_WINDOWS = platform() === 'win32'
const IS_MAC = platform() === 'darwin'

function getDefaultShell(): string {
  if (IS_WINDOWS) {
    return process.env.COMSPEC || 'powershell.exe'
  }
  return process.env.SHELL || (IS_MAC ? '/bin/zsh' : '/bin/bash')
}

const ptyProcesses = new Map<string, pty.IPty>()

function commandExists(cmd: string): boolean {
  try {
    if (IS_WINDOWS) {
      execFileSync('where', [cmd], { stdio: 'ignore' })
    } else {
      execFileSync('which', [cmd], { stdio: 'ignore' })
    }
    return true
  } catch {
    return false
  }
}

function createWindow(): BrowserWindow {
  const iconPath = join(__dirname, '../../build/icon.png')
  const icon = nativeImage.createFromPath(iconPath)

  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#111111',
    icon: icon.isEmpty() ? undefined : icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

function parseCommand(commandStr: string): { cmd: string; args: string[] } {
  const trimmed = commandStr.trim()
  if (!trimmed) {
    const sh = getDefaultShell()
    return { cmd: sh, args: [] }
  }
  const parts = trimmed.split(/\s+/)
  return { cmd: parts[0], args: parts.slice(1) }
}

function setupIPCHandlers(mainWindow: BrowserWindow): void {

  // ── Terminal lifecycle ──────────────────────────────────────────────────

  ipcMain.handle('terminal:create', (_event, { sessionId, command, cwd, cols, rows }) => {
    // Kill any existing session with same id (robustness)
    const existing = ptyProcesses.get(sessionId)
    if (existing) {
      try { existing.kill() } catch { /* ignore */ }
      ptyProcesses.delete(sessionId)
    }

    try {
      const { cmd, args } = parseCommand(command as string)

      // Check before spawning so renderer can show the install guide
      if (!commandExists(cmd)) {
        return { success: false, error: `Command '${cmd}' not found in PATH` }
      }

      const workdir =
        (cwd as string | undefined)?.trim() ||
        process.env.HOME ||
        process.env.USERPROFILE ||
        (IS_WINDOWS ? 'C:\\' : '/')

      const env: Record<string, string> = {
        ...process.env as Record<string, string>,
        TERM: 'xterm-256color',
        COLORTERM: 'truecolor'
      }
      // Remove undefined values
      Object.keys(env).forEach(k => { if (env[k] === undefined) delete env[k] })

      const ptyProcess = pty.spawn(cmd, args, {
        name: 'xterm-256color',
        cols: (cols as number) || 80,
        rows: (rows as number) || 24,
        cwd: workdir,
        env
      })

      ptyProcesses.set(sessionId, ptyProcess)

      ptyProcess.onData((data) => {
        if (!mainWindow.isDestroyed()) {
          mainWindow.webContents.send('terminal:data', { sessionId, data })
        }
      })

      ptyProcess.onExit(({ exitCode, signal }) => {
        ptyProcesses.delete(sessionId)
        if (!mainWindow.isDestroyed()) {
          mainWindow.webContents.send('terminal:exit', { sessionId, exitCode, signal })
        }
      })

      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      return { success: false, error: msg }
    }
  })

  ipcMain.handle('terminal:write', (_event, { sessionId, data }) => {
    ptyProcesses.get(sessionId as string)?.write(data as string)
  })

  ipcMain.handle('terminal:resize', (_event, { sessionId, cols, rows }) => {
    try {
      ptyProcesses.get(sessionId as string)?.resize(
        Math.max(1, cols as number),
        Math.max(1, rows as number)
      )
    } catch { /* ignore — PTY may be gone */ }
  })

  ipcMain.handle('terminal:kill', (_event, { sessionId }) => {
    const proc = ptyProcesses.get(sessionId as string)
    if (proc) {
      try { proc.kill() } catch { /* ignore */ }
      ptyProcesses.delete(sessionId as string)
    }
  })

  // ── App info ────────────────────────────────────────────────────────────

  ipcMain.handle('app:info', () => ({
    platform: platform(),
    defaultShell: getDefaultShell(),
    home: process.env.HOME || process.env.USERPROFILE || ''
  }))

  // ── Native directory picker ─────────────────────────────────────────────

  ipcMain.handle('dialog:pickDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Selecionar pasta de trabalho',
      defaultPath: process.env.HOME || process.env.USERPROFILE || '/'
    })
    return canceled ? null : filePaths[0]
  })

  // ── Window controls ─────────────────────────────────────────────────────

  ipcMain.handle('win:minimize', () => mainWindow.minimize())
  ipcMain.handle('win:maximize', () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize()
    else mainWindow.maximize()
  })
  ipcMain.handle('win:close', () => mainWindow.close())
}

// ── Bootstrap ──────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.terminaut.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const mainWindow = createWindow()
  setupIPCHandlers(mainWindow)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  ptyProcesses.forEach((proc) => {
    try { proc.kill() } catch { /* ignore */ }
  })
  ptyProcesses.clear()
  if (!IS_MAC) app.quit()
})
