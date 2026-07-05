$ErrorActionPreference = "Stop"
Set-Location C:\Users\manue\Desktop\opencode-orchestrator\backend

# Step 1: Activate venv
Write-Output "=== STEP 1: Activate venv ==="
try {
    & .\venv\Scripts\Activate.ps1
    $python = (Get-Command python).Source
    Write-Output "Python: $python"
} catch {
    Write-Error "FAIL: venv activation error: $_"
    exit 1
}

# Step 2: Syntax check all .py files (exclude venv)
Write-Output "`n=== STEP 2: Syntax check ==="
$pyFiles = Get-ChildItem . -Recurse -Filter "*.py" | Where-Object { $_.FullName -notmatch '\\venv\\' }
$hasError = $false
foreach ($f in $pyFiles) {
    $result = python -m py_compile $f.FullName 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "SYNTAX ERROR in $($f.Name): $result"
        $hasError = $true
    } else {
        Write-Output "  OK: $($f.Name)"
    }
}
if (-not $hasError) {
    Write-Output "Result: All syntax OK"
} else {
    exit 1
}

# Step 3: Import test
Write-Output "`n=== STEP 3: Import app ==="
$importResult = python -c "from main import app; print('OK')" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "FAIL: Import error: $importResult"
    exit 1
} else {
    Write-Output "Result: Import OK"
}

# Step 4: Start server with 5s timeout
Write-Output "`n=== STEP 4: Start uvicorn server (timeout 5s) ==="
$proc = Start-Process -NoNewWindow -PassThru -FilePath "python" -ArgumentList "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"
Start-Sleep 5
if ($proc.HasExited) {
    Write-Error "FAIL: Server exited early, code $($proc.ExitCode)"
    exit 1
} else {
    Write-Output "Result: Server running OK"
    $proc.Kill()
    Write-Output "Server killed after test"
}

Write-Output "`n=== ALL TESTS PASSED ==="
