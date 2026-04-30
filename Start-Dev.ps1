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

$vscodeJava = "C:\Users\vinicius_sens\.vscode\extensions\redhat.java-1.53.0-win32-x64\jre\21.0.10-win32-x86_64"
if (Test-Path $vscodeJava) {
    $env:JAVA_HOME = $vscodeJava
    $env:Path = "$env:JAVA_HOME\bin;$env:Path"
}

# If a system JDK (with javac) is available, prefer it over the embedded JRE
$javacCmd = Get-Command javac -ErrorAction SilentlyContinue
if ($javacCmd) {
    $javacPath = $javacCmd.Path
    $jdkBin = Split-Path -Parent $javacPath
    $jdkHome = Split-Path -Parent $jdkBin
    if (Test-Path $jdkHome) {
        $vscodeJava = $jdkHome
        $env:JAVA_HOME = $vscodeJava
        $env:Path = "$env:JAVA_HOME\bin;$env:Path"
    }
}

# Prefer common Program Files Java installations (explicit list)
$commonJdks = @(
    'C:\Program Files\Java\jdk-23',
    'C:\Program Files\Java\jdk-21',
    'C:\Program Files\Java\jdk-17',
    'C:\Program Files\OpenJDK\jdk-21',
    'C:\Program Files\OpenJDK\jdk-17'
)
foreach ($p in $commonJdks) {
    if (Test-Path $p) {
        $vscodeJava = $p
        $env:JAVA_HOME = $vscodeJava
        $env:Path = "$env:JAVA_HOME\bin;$env:Path"
        break
    }
}

if ($InstallFrontendDeps) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location $frontendPath
    npm install
    Pop-Location
}

$backendCommand = "Set-Location '$projectRoot'; `$env:JAVA_HOME='$vscodeJava'; `$env:Path=`"$vscodeJava\bin;`$env:Path`"; `$env:SPRING_PROFILES_ACTIVE='$BackendProfile'; .\mvnw.cmd spring-boot:run"
$frontendCommand = "Set-Location '$frontendPath'; npm run dev"

$psExe = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
Start-Process -FilePath $psExe -ArgumentList "-NoExit", "-Command", $backendCommand -WindowStyle Normal
Start-Process -FilePath $psExe -ArgumentList "-NoExit", "-Command", $frontendCommand -WindowStyle Normal

Write-Host "Services starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:8080" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "H2 console (local profile): http://localhost:8080/h2-console" -ForegroundColor Green
