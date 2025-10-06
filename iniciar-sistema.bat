@echo off
echo ========================================
echo  Sistema de Gestion de Robots y Drones
echo  Universidad Javeriana Cali
echo ========================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "backend\package.json" (
    echo ❌ Error: No se encuentra backend\package.json
    echo    Ejecute este script desde la raiz del proyecto
    pause
    exit /b 1
)

if not exist "frontend\package.json" (
    echo ❌ Error: No se encuentra frontend\package.json
    echo    Ejecute este script desde la raiz del proyecto
    pause
    exit /b 1
)

echo 🚀 Iniciando servidores...
echo.

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js no esta instalado
    echo    Descargue e instale Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

REM Iniciar backend en una nueva ventana
echo 🔧 Iniciando Backend (Puerto 4000)...
start "Backend - Sistema Robots" cmd /c "cd /d %~dp0backend && echo Iniciando Backend... && npm run dev && pause"

REM Esperar un poco antes de iniciar el frontend
timeout /t 5 /nobreak >nul

REM Iniciar frontend en una nueva ventana
echo 🎨 Iniciando Frontend (Puerto 3000)...
start "Frontend - Sistema Robots" cmd /c "cd /d %~dp0frontend && echo Iniciando Frontend... && npm run dev && pause"

REM Esperar un poco más
timeout /t 3 /nobreak >nul

echo.
echo ✅ Servidores iniciados exitosamente!
echo.
echo 📡 URLs del sistema:
echo    • Backend:  http://localhost:4000
echo    • Frontend: http://localhost:3000
echo    • API Info: http://localhost:4000/api/info
echo    • Health:   http://localhost:4000/health
echo.
echo 💡 Consejos:
echo    • Espere unos segundos a que los servidores se inicien completamente
echo    • El frontend se abrira automaticamente en el navegador
echo    • Para detener: Presione Ctrl+C en cada ventana de terminal
echo.
echo 📖 Para mas informacion, consulte: SETUP.md
echo.

REM Intentar abrir el navegador después de unos segundos
timeout /t 8 /nobreak >nul
echo 🌐 Abriendo navegador...
start http://localhost:3000

echo.
echo Presione cualquier tecla para cerrar esta ventana...
pause >nul