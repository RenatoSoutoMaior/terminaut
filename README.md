# Terminaut

**AI Terminal Hub** — gerencie múltiplas sessões de ferramentas de IA em um workspace unificado.

---

## O que é

Terminaut é uma aplicação desktop construída com Electron que permite abrir e gerenciar simultaneamente sessões de CLI de diferentes ferramentas de IA (Claude, GitHub Copilot, Cursor, Gemini, OpenAI Codex, Aider) em um único workspace com terminais PTY reais.

Cada sessão é um terminal interativo completo — você pode autenticar, digitar, usar atalhos do terminal e fazer tudo que faria em um terminal normal.

---

## Funcionalidades

- **Múltiplas sessões simultâneas** — abra quantos terminais quiser, de qualquer ferramenta
- **Grid dinâmico** — layout automático que se adapta ao número de sessões abertas (1→100%, 2→50/50, 3→3 colunas, 4→2×2, etc.)
- **Terminais PTY reais** via `node-pty` — suporte completo a cores, atalhos, mouse e interatividade
- **Seletor de pasta** — escolha o diretório de trabalho antes de abrir cada sessão
- **Guia de instalação inline** — se uma ferramenta não estiver instalada, o terminal mostra instruções passo a passo para configurá-la
- **Sessões nomeadas e editáveis** — renomeie qualquer sessão com duplo clique
- **Painel de contexto** — anotações por sessão (objetivo, branch, card, PR, etc.)
- **Destaque da sessão ativa** — borda laranja e header diferenciado na janela em foco
- **Ordenação de ferramentas** — reordene as IAs nas configurações via drag-and-drop ou botões ↑/↓
- **Shell configurável** — Bash, Zsh, Fish, sh, PowerShell Core, cmd, Git Bash, WSL
- **Persistência de configurações** — comandos, ordem das ferramentas e preferências salvas localmente
- **Comando global `terminaut`** — abra o app de qualquer terminal

---

## Ferramentas suportadas

| Ferramenta | Comando padrão | Requisito |
|------------|---------------|-----------|
| Claude | `claude` | `npm install -g @anthropic-ai/claude-code` |
| GitHub Copilot | `gh copilot` | `gh extension install github/gh-copilot` |
| Cursor | `cursor` | Download em cursor.sh |
| Gemini | `gemini` | `npm install -g @google/gemini-cli` |
| OpenAI Codex | `codex` | `npm install -g @openai/codex` |
| Aider | `aider` | `pipx install aider-chat` |
| Terminal | *(shell padrão)* | — |

---

## Stack

- **Electron 33** + **electron-vite 2**
- **React 18** + **TypeScript**
- **xterm.js** (`@xterm/xterm` v5) — emulação de terminal
- **node-pty** — sessões PTY reais
- **Zustand 5** — gerenciamento de estado
- **electron-builder** — empacotamento para Linux, Windows e macOS

---

## Desenvolvimento

### Pré-requisitos

- Node.js 18+
- npm 9+
- Linux/macOS/Windows

### Instalação

```bash
git clone <repo>
cd terminaut
npm install
```

### Executar em modo dev

```bash
npm run dev
```

Ou, se tiver o comando global instalado:

```bash
terminaut --logs
```

### Build de produção

```bash
npm run build
```

### Empacotar (AppImage / deb / NSIS / DMG)

```bash
npm run dist
```

---

## Comando global `terminaut`

Instale uma vez e depois abra o app de qualquer terminal digitando `terminaut`.

### Linux / macOS

```bash
npm run install:linux
```

Requer que `~/.local/bin` esteja no `$PATH`. Se não estiver, o script avisa e mostra o que adicionar ao `.bashrc` / `.zshrc`.

### Windows

Abra o **PowerShell** ou **cmd** na pasta do projeto e execute:

```powershell
npm run install:win
```

Isso cria `terminaut.cmd` em `%LOCALAPPDATA%\Microsoft\WindowsApps`, que já está no PATH do Windows 10/11.

---

### Uso

```bash
# Inicia em background (padrão)
terminaut

# Inicia com logs no terminal atual (útil para debug)
terminaut --logs
```

---

## Estrutura do projeto

```
terminaut/
├── build/                  # Ícones e assets de build
│   ├── icon.png            # Ícone da janela (500×500)
│   └── terminaut-icon.png  # Logo do app (1000×250)
├── src/
│   ├── main/               # Processo principal Electron (Node.js)
│   │   └── index.ts        # PTY, IPC handlers, janela
│   ├── preload/            # Bridge main ↔ renderer (contextBridge)
│   │   └── index.ts
│   └── renderer/           # Interface React
│       └── src/
│           ├── components/
│           │   ├── TerminalGrid/   # Grid de sessões + empty state
│           │   ├── TerminalPanel/  # Painel individual com xterm.js
│           │   ├── Sidebar/        # Barra lateral com ferramentas
│           │   ├── Settings/       # Modal de configurações
│           │   └── ContextPanel/   # Painel de anotações por sessão
│           ├── constants/
│           │   ├── aiTools.ts      # Definição das ferramentas e shells
│           │   └── setupGuides.ts  # Guias de instalação por ferramenta
│           ├── store/
│           │   └── sessionStore.ts # Estado global (Zustand)
│           └── types/
│               └── index.ts        # Tipos TypeScript
├── electron.vite.config.ts
├── electron-builder.yml
└── package.json
```

---

## Configurações

Abra as configurações pelo ícone ⚙ no rodapé da sidebar:

- **Shell padrão** — shell usado ao abrir o Terminal genérico
- **Diretório de trabalho padrão** — pasta inicial das sessões
- **Ferramentas IA** — ative/desative, renomeie, ajuste o comando e reordene via drag-and-drop
- **Sobre** — versão e plataforma

---

## Desenvolvido por

Renato Souto Maior
