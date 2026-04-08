param(
    [string]$BackendProfile = "local",
    [switch]$InstallFrontendDeps
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendPath = Join-Path $projectRoot "frontend"

if (-not (Test-Path (Join-Path $projectRoot "mvnw.cmd"))) {
    throw "mvnw.cmd not found in project root. Run this script from repository root."
}

if (-not (Test-Path $frontendPath)) {
    throw "frontend folder not found in project root."
}

# Prefer the VS Code Java runtime when JAVA_HOME is not configured.
if (-not $env:JAVA_HOME) {
    $vscodeJava = "C:\Users\vinicius_sens\.vscode\extensions\redhat.java-1.53.0-win32-x64\jre\21.0.10-win32-x86_64"
    if (Test-Path $vscodeJava) {
        $env:JAVA_HOME = $vscodeJava
        $env:Path = "$env:JAVA_HOME\bin;$env:Path"
    }
}

if ($InstallFrontendDeps) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location $frontendPath
    npm install
    Pop-Location
}

$backendCommand = "Set-Location '$projectRoot'; `"`$env:SPRING_PROFILES_ACTIVE='$BackendProfile'; .\mvnw.cmd spring-boot:run`""
$frontendCommand = "Set-Location '$frontendPath'; npm run dev"

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand -WindowStyle Normal
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand -WindowStyle Normal

Write-Host "Services starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:8080" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "H2 console (local profile): http://localhost:8080/h2-console" -ForegroundColor Green
