$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Требуется Node.js 20 или новее: https://nodejs.org/"
}

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "[TechM] Активирую pnpm через Corepack..."
    corepack enable
    corepack prepare pnpm@10 --activate
}

if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot "node_modules"))) {
    Write-Host "[TechM] Устанавливаю зависимости..."
    pnpm install
}

Write-Host "[TechM] Запуск: http://localhost:5173"
pnpm dev
