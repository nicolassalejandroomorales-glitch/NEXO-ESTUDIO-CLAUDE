@echo off
rem Doble clic: prende el servidor de Nexo y abre la app en el navegador.
rem Para apagarlo: cierra la ventana negra "Servidor de Nexo" (o Ctrl+C dentro de ella).
cd /d "%~dp0"
where node >/dev/null 2>/dev/null || (echo No encuentro Node.js. Instalalo desde https://nodejs.org y vuelve a intentar. & pause & exit /b 1)
netstat -ano | findstr ":8765" | findstr "LISTENING" >nul
if errorlevel 1 (
  start "Servidor de Nexo" /min cmd /k node tools\static-server.cjs
  timeout /t 2 /nobreak >nul
)
start "" "http://127.0.0.1:8765/#/home"
