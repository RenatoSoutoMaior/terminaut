#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BIN_DIR="$HOME/.local/bin"
CMD="$BIN_DIR/terminaut"

mkdir -p "$BIN_DIR"

cat > "$CMD" << SCRIPT
#!/usr/bin/env bash
PROJECT="$PROJECT_ROOT"
if [ "\$1" = "--logs" ]; then
  cd "\$PROJECT"
  npm run dev
else
  cd "\$PROJECT"
  nohup npm run dev > /dev/null 2>&1 &
  echo "Terminaut iniciando em background…"
fi
SCRIPT

chmod +x "$CMD"

if ! echo "$PATH" | tr ':' '\n' | grep -qx "$BIN_DIR"; then
  echo ""
  echo "ATENÇÃO: $BIN_DIR não está no PATH."
  echo "Adicione ao seu ~/.bashrc ou ~/.zshrc:"
  echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
  echo "Depois rode: source ~/.bashrc"
  echo ""
fi

echo "✓ Comando 'terminaut' instalado em $CMD"
echo "  Abra um novo terminal e digite: terminaut"
