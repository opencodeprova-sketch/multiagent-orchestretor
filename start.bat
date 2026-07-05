@echo off
cd /d "%~dp0"

:: Avvio backend - finestra completamente nascosta via PowerShell
powershell -WindowStyle Hidden -NoProfile -Command "Start-Process -WindowStyle Hidden -FilePath '%~dp0backend\venv\Scripts\python.exe' -ArgumentList '-m uvicorn main:app --host 127.0.0.1 --port 8000' -WorkingDirectory '%~dp0backend'"

:: Attesa backend
timeout /t 3 /nobreak >nul

:: Avvio frontend - finestra completamente nascosta via PowerShell
:: npm.cmd su Windows va lanciato con cmd.exe /c
:: npm.cmd esplicito (npm bash script e npm.ps1 non funzionano su Windows)
powershell -WindowStyle Hidden -NoProfile -Command "Start-Process -WindowStyle Hidden -FilePath 'cmd.exe' -ArgumentList '/c npm.cmd run dev' -WorkingDirectory '%~dp0.'"

:: Attesa frontend
timeout /t 5 /nobreak >nul

:: Apertura browser
start http://localhost:5173/
exit
