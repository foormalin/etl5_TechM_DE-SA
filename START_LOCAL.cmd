@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo [TechM] Node.js 20+ ne naiden.
  echo Ustanovite Node.js LTS: https://nodejs.org/
  pause
  exit /b 1
)
where pnpm >nul 2>nul
if errorlevel 1 (
  echo [TechM] Ustanavlivayu pnpm...
  call corepack enable
  call corepack prepare pnpm@10 --activate
)
if not exist node_modules (
  echo [TechM] Ustanavlivayu zavisimosti...
  call pnpm install
  if errorlevel 1 (
    echo [TechM] Oshibka ustanovki zavisimostei.
    pause
    exit /b 1
  )
)
echo [TechM] Otkroite http://localhost:5173
call pnpm dev
endlocal
