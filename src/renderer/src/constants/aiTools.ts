import type { AITool, ShellOption } from '../types'

// ── Tool order: Claude, Copilot, Cursor, Gemini, OpenAI, Aider, Terminal ──

export const DEFAULT_AI_TOOLS: AITool[] = [
  {
    id: 'claude',
    name: 'Claude',
    command: 'claude',
    icon: '◆',
    color: '#C96442',
    enabled: true
  },
  {
    id: 'copilot',
    name: 'Copilot',
    command: 'gh copilot',
    icon: '◉',
    color: '#8957E5',
    enabled: true
  },
  {
    id: 'cursor',
    name: 'Cursor',
    command: 'cursor',
    icon: '▷',
    color: '#3b82f6',
    enabled: true
  },
  {
    id: 'gemini',
    name: 'Gemini',
    command: 'gemini',
    icon: '✦',
    color: '#4285F4',
    enabled: true
  },
  {
    id: 'openai',
    name: 'OpenAI',
    command: 'codex',
    icon: '⬡',
    color: '#10A37F',
    enabled: true
  },
  {
    id: 'aider',
    name: 'Aider',
    command: 'aider',
    icon: '◈',
    color: '#FF6B35',
    enabled: true
  },
  {
    id: 'terminal',
    name: 'Terminal',
    command: '',          // empty → usa defaultShell em runtime
    icon: '$',
    color: '#52525b',
    enabled: true
  }
]

export const SHELL_OPTIONS: ShellOption[] = [
  { id: 'bash',       label: 'Bash',            command: 'bash',                                          platforms: ['linux', 'darwin'] },
  { id: 'zsh',        label: 'Zsh',             command: 'zsh',                                           platforms: ['linux', 'darwin'] },
  { id: 'fish',       label: 'Fish',            command: 'fish',                                          platforms: ['linux', 'darwin'] },
  { id: 'sh',         label: 'Sh',              command: 'sh',                                            platforms: ['linux', 'darwin'] },
  { id: 'pwsh',       label: 'PowerShell Core', command: 'pwsh',                                          platforms: ['linux', 'darwin', 'win32'] },
  { id: 'powershell', label: 'PowerShell',      command: 'powershell.exe',                                platforms: ['win32'] },
  { id: 'cmd',        label: 'Command Prompt',  command: 'cmd.exe',                                       platforms: ['win32'] },
  { id: 'gitbash',    label: 'Git Bash',        command: 'C:\\Program Files\\Git\\bin\\bash.exe',         platforms: ['win32'] },
  { id: 'wsl',        label: 'WSL',             command: 'wsl.exe',                                       platforms: ['win32'] },
]

export const DEFAULT_SETTINGS = {
  tools: DEFAULT_AI_TOOLS,
  defaultCwd: '',
  defaultShell: ''
}
