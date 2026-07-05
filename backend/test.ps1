# Step 1: Activate venv
$venvPath = ".\venv\Scripts\Activate.ps1"
if (-not (Test-Path $venvPath)) {
    Write-Error "venv not found at $venvPath"
    exit 1
}
& $venvPath

# Step 2: Syntax check all .py files (exclude venv)
$pyFiles = Get-ChildItem -Recurse -Filter "*.py" -Exclude "venv/*" | Where-Object { $_.FullName -notmatch '\\venv\\' }
$hasError = $false
foreach ($f in $pyFiles) {
    $result = python -m py_compile $f.FullName 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "SYNTAX ERROR in $($f.Name): $result"
        $hasError = $true
    }
}
if (-not $hasError) {
    Write-Output "Step 2: All syntax OK"
}

# Step 3: Import test
$importResult = python -c "from main import app; print('OK')" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Step 3: Import FAILED: $importResult"
} else {
    Write-Output "Step 3: Import OK"
}

# Step 4: Start server with 5s timeout
Write-Output "Step 4: Starting uvicorn..."
$proc = Start-Process -NoNewWindow -PassThru -FilePath "python" -ArgumentList "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"
Start-Sleep 5
if ($proc.HasExited) {
    Write-Error "Step 4: Server exit early, code $($proc.ExitCode)"
} else {
    Write-Output "Step 4: Server running OK"
    $proc.Kill()
}
