$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$TargetDir = "$env:USERPROFILE\AppData\Local\Microsoft\WindowsApps"
$CmdPath = Join-Path $TargetDir "terminaut.cmd"

$content = @"
@echo off
setlocal
set "PROJECT=$ProjectRoot"
if "%1"=="--logs" (
    cd /d "%PROJECT%"
    npm run dev
) else (
    start "Terminaut" /MIN cmd /C "cd /d ""%PROJECT%"" && npm run dev"
    echo Terminaut iniciando em background...
)
"@

try {
    Set-Content -Path $CmdPath -Value $content -Encoding ASCII
    Write-Host ""
    Write-Host "Comando 'terminaut' instalado com sucesso!"
    Write-Host ""
    Write-Host "  terminaut          -> inicia em background (janela minimizada)"
    Write-Host "  terminaut --logs   -> inicia com logs visiveis no terminal"
    Write-Host ""
    Write-Host "Abra um novo terminal (cmd ou PowerShell) e teste: terminaut"
} catch {
    Write-Host "Erro: $_" -ForegroundColor Red
    Write-Host "Tente rodar o PowerShell como Administrador."
}
