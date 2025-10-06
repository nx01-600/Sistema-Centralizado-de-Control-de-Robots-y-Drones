@echo off
echo.
echo 🤖 Sistema Centralizado de Control de Robots y Drones
echo ====================================================
echo.
echo Iniciando servidores de desarrollo...
echo.

echo 📦 Backend: http://localhost:4000
echo 🌐 Frontend: http://localhost:3000
echo.

echo Presiona Ctrl+C para detener los servidores
echo.

start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Servidores iniciados en ventanas separadas
echo.
pause