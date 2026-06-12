// ── ANSI helpers ──────────────────────────────────────────────────────────
const R = '\x1b[0m'       // reset
const B = '\x1b[1m'       // bold
const D = '\x1b[2m'       // dim
const GR = '\x1b[32m'     // green
const YL = '\x1b[33m'     // yellow
const CY = '\x1b[36m'     // cyan
const RD = '\x1b[31m'     // red
const MG = '\x1b[35m'     // magenta
const BL = '\x1b[34m'     // blue

function header(title: string, color: string): string[] {
  const w = 56
  const pad = Math.max(0, w - title.length - 2)
  const l = Math.floor(pad / 2)
  const r = pad - l
  return [
    `${color}${'─'.repeat(w)}${R}`,
    `${color}  ${B}${' '.repeat(l)}${title}${' '.repeat(r)}${R}${color}  ${R}`,
    `${color}${'─'.repeat(w)}${R}`,
    ''
  ]
}

function step(n: number, title: string): string[] {
  return [
    `${B}  ${n}. ${title}${R}`,
    `${D}  ${'─'.repeat(50)}${R}`
  ]
}

function cmd(c: string, comment?: string): string {
  return `  ${CY}$ ${c}${R}${comment ? `  ${D}# ${comment}${R}` : ''}`
}

function note(text: string): string { return `  ${D}${text}${R}` }
function link(url: string): string  { return `  ${BL}${url}${R}` }
function warn(text: string): string { return `  ${YL}⚠  ${text}${R}` }
function ok(text: string): string   { return `  ${GR}✓  ${text}${R}` }
function sep(): string              { return `  ${D}${'─'.repeat(50)}${R}` }

// ── Guides por ferramenta ─────────────────────────────────────────────────

const GUIDES: Record<string, string[]> = {

  // ── Claude ───────────────────────────────────────────────────────────────
  claude: [
    ...header('Claude Code CLI — Instalação', YL),

    ...step(1, 'Pré-requisito: Node.js 18+'),
    cmd('node --version', 'deve ser v18 ou superior'),
    cmd('# Se não tiver: https://nodejs.org'),
    '',

    ...step(2, 'Instalar o Claude Code CLI'),
    cmd('npm install -g @anthropic-ai/claude-code'),
    '',

    ...step(3, 'Autenticar'),
    cmd('claude', 'abre o browser para login com conta Anthropic'),
    note('Ou configure via variável de ambiente:'),
    cmd('export ANTHROPIC_API_KEY="sk-ant-..."'),
    '',

    ...step(4, 'Verificar instalação'),
    cmd('claude --version'),
    cmd('claude "olá, tudo funcionando?"'),
    '',

    ok('Após instalar, feche este painel e abra uma nova sessão Claude.'),
    '',
    link('https://claude.ai/code'),
    link('https://docs.anthropic.com/pt/docs/claude-code'),
  ],

  // ── Copilot ──────────────────────────────────────────────────────────────
  copilot: [
    ...header('GitHub Copilot CLI — Instalação', MG),

    warn('Copilot CLI requer uma assinatura ativa do GitHub Copilot.'),
    '',

    ...step(1, 'Instalar GitHub CLI (gh)'),
    note('Ubuntu / Debian:'),
    cmd('sudo apt update && sudo apt install gh'),
    note('Ou via curl (qualquer Linux):'),
    cmd('curl -sS https://webi.sh/gh | sh'),
    note('macOS:'),
    cmd('brew install gh'),
    note('Windows:'),
    cmd('winget install GitHub.cli'),
    '',

    ...step(2, 'Autenticar com GitHub'),
    cmd('gh auth login', 'siga as instruções no browser'),
    '',

    ...step(3, 'Instalar extensão Copilot'),
    cmd('gh extension install github/gh-copilot'),
    '',

    ...step(4, 'Verificar e usar'),
    cmd('gh copilot --version'),
    cmd('gh copilot suggest "listar arquivos por tamanho"'),
    cmd('gh copilot explain "grep -r pattern ."'),
    '',

    ok('Após instalar, feche este painel e abra uma nova sessão Copilot.'),
    '',
    link('https://docs.github.com/en/copilot/github-copilot-in-the-cli'),
  ],

  // ── Cursor ───────────────────────────────────────────────────────────────
  cursor: [
    ...header('Cursor — Instalação', BL),

    note('Cursor é uma IDE com IA embutida. O comando "cursor" abre o editor.'),
    '',

    ...step(1, 'Baixar o Cursor'),
    note('Linux (AppImage):'),
    link('https://cursor.sh  →  Download  →  Linux'),
    '',

    ...step(2, 'Instalar no Linux'),
    cmd('chmod +x cursor-*.AppImage'),
    cmd('sudo mv cursor-*.AppImage /opt/cursor.AppImage'),
    note('Criar atalho no PATH:'),
    cmd('echo \'exec /opt/cursor.AppImage "$@"\' | sudo tee /usr/local/bin/cursor'),
    cmd('sudo chmod +x /usr/local/bin/cursor'),
    '',

    note('Windows: baixar o instalador .exe em https://cursor.sh'),
    note('macOS: baixar o .dmg em https://cursor.sh'),
    '',

    ...step(3, 'Testar'),
    cmd('cursor --version'),
    cmd('cursor .', 'abre o diretório atual no Cursor'),
    '',

    warn('Cursor abre como aplicação GUI, não como terminal interativo.'),
    warn('Use o terminal integrado do Cursor para rodar comandos.'),
    '',

    ok('Após instalar e adicionar ao PATH, abra uma nova sessão Cursor.'),
    '',
    link('https://cursor.sh'),
    link('https://docs.cursor.com'),
  ],

  // ── Gemini ───────────────────────────────────────────────────────────────
  gemini: [
    ...header('Google Gemini CLI — Instalação', BL),

    ...step(1, 'Instalar via npm (requer Node.js 18+)'),
    cmd('npm install -g @google/gemini-cli'),
    '',

    ...step(2, 'Configurar chave de API'),
    note('Obtenha sua chave em: https://aistudio.google.com/apikey'),
    cmd('export GEMINI_API_KEY="AIza..."'),
    note('Para persistir, adicione ao seu ~/.bashrc ou ~/.zshrc:'),
    cmd('echo \'export GEMINI_API_KEY="AIza..."\' >> ~/.bashrc'),
    '',

    ...step(3, 'Autenticar (alternativa via conta Google)'),
    cmd('gemini auth', 'abre o browser para login com conta Google'),
    '',

    ...step(4, 'Verificar e usar'),
    cmd('gemini --version'),
    cmd('gemini', 'modo interativo'),
    '',

    ok('Após instalar, feche este painel e abra uma nova sessão Gemini.'),
    '',
    link('https://ai.google.dev/gemini-api/docs/gemini-cli'),
    link('https://aistudio.google.com/apikey'),
  ],

  // ── OpenAI / Codex ────────────────────────────────────────────────────────
  openai: [
    ...header('OpenAI Codex CLI — Instalação', GR),

    ...step(1, 'Instalar via npm (requer Node.js 22+)'),
    cmd('npm install -g @openai/codex'),
    note('Ou executar sem instalar:'),
    cmd('npx @openai/codex'),
    '',

    ...step(2, 'Configurar chave de API'),
    note('Obtenha sua chave em: https://platform.openai.com/api-keys'),
    cmd('export OPENAI_API_KEY="sk-..."'),
    note('Para persistir, adicione ao ~/.bashrc ou ~/.zshrc:'),
    cmd('echo \'export OPENAI_API_KEY="sk-..."\' >> ~/.bashrc'),
    '',

    ...step(3, 'Verificar e usar'),
    cmd('codex --version'),
    cmd('codex', 'modo interativo'),
    cmd('codex "explique este arquivo: main.py"'),
    '',

    note('Modelos suportados: gpt-4o, gpt-4-turbo, o1, o3-mini, etc.'),
    note('Para usar outro modelo: codex --model o3'),
    '',

    ok('Após instalar, feche este painel e abra uma nova sessão OpenAI.'),
    '',
    link('https://github.com/openai/codex'),
    link('https://platform.openai.com/api-keys'),
  ],

  // ── Aider ────────────────────────────────────────────────────────────────
  aider: [
    ...header('Aider — AI Pair Programming — Instalação', RD),

    note('Aider conecta ao seu repositório Git e usa IA para editar código.'),
    '',

    ...step(1, 'Instalar (Python 3.9+ necessário)'),
    note('Opção 1 — pipx (recomendado, ambiente isolado):'),
    cmd('pipx install aider-chat'),
    note('Opção 2 — pip:'),
    cmd('pip install aider-chat'),
    note('Opção 3 — uv (mais rápido):'),
    cmd('uv tool install aider-chat'),
    '',

    ...step(2, 'Configurar modelo de IA'),
    note('Com Claude (recomendado):'),
    cmd('export ANTHROPIC_API_KEY="sk-ant-..."'),
    cmd('aider --model claude-3-7-sonnet-20250219'),
    '',
    note('Com OpenAI:'),
    cmd('export OPENAI_API_KEY="sk-..."'),
    cmd('aider --model gpt-4o'),
    '',
    note('Com Gemini:'),
    cmd('export GEMINI_API_KEY="AIza..."'),
    cmd('aider --model gemini/gemini-2.5-pro'),
    '',

    ...step(3, 'Usar dentro de um repositório Git'),
    cmd('cd ~/seu-projeto'),
    cmd('aider', 'abre modo interativo no repositório atual'),
    cmd('aider src/arquivo.py', 'inicia já com arquivo aberto'),
    '',

    ok('Após instalar, feche este painel e abra uma nova sessão Aider.'),
    ok('Dica: abra o Aider já dentro do diretório do seu projeto.'),
    '',
    link('https://aider.chat'),
    link('https://aider.chat/docs/install.html'),
  ],
}

/**
 * Returns lines to write to xterm.js when a tool's command is not found.
 * Falls back to a generic message if no guide exists for the tool.
 */
export function getSetupGuide(toolId: string, toolName: string, command: string): string[] {
  const guide = GUIDES[toolId]
  if (guide) return guide

  // Generic fallback
  return [
    ...header(`${toolName} — Comando não encontrado`, YL),
    warn(`Comando '${command}' não encontrado no PATH.`),
    '',
    note('Verifique se a ferramenta está instalada:'),
    cmd(`which ${command.split(' ')[0]}`),
    '',
    note('Ajuste o comando em  ⚙ Configurações  e reabra a sessão.'),
  ]
}
