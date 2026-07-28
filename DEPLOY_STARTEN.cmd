@echo off
cd /d "%~dp0"

echo ==========================================
echo   Warenschmiede - Deploy vorbereiten
echo ==========================================
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0build_deploy.ps1"

if errorlevel 1 goto FEHLER

echo.
echo ==========================================
echo   Deploy erfolgreich erstellt
echo ==========================================
echo.
echo Ordner:
echo %~dp0_deploy
echo.
echo Der Deploy-Ordner wird jetzt geoeffnet.
echo.

start "" "%~dp0_deploy"

pause
exit /b 0

:FEHLER
echo.
echo ==========================================
echo   FEHLER BEIM DEPLOY
echo ==========================================
echo.
echo Der Deploy-Ordner wurde nicht korrekt erstellt.
echo Bitte die Fehlermeldung oben pruefen.
echo.
pause
exit /b 1