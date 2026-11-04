# ContractRadar Windows setup
# Usage:
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\setup-windows.ps1
# Optional:
#   -InstallRoot "C:\ContractRadar"  -SkipPrereqs  -StartServices  -WithDocker
#
# This script installs missing prerequisites with winget when available,
# clones/updates the repository, builds the backend and installs admin deps.

[CmdletBinding()]
param(
    [string]$InstallRoot = "C:\ContractRadar",
    [string]$RepoUrl = "https://github.com/3q5yyt/ContractRadar.git",
    [switch]$SkipPrereqs,
    [switch]$StartServices,
    [switch]$WithDocker
)

$ErrorActionPreference = "Stop"

function Write-Step($message) {
    Write-Host "`n==> $message" -ForegroundColor Cyan
}

function Write-Ok($message) {
    Write-Host "  [OK] $message" -ForegroundColor Green
}

function Write-Warn($message) {
    Write-Host "  [!] $message" -ForegroundColor Yellow
}

function Write-Err($message) {
    Write-Host "  [X] $message" -ForegroundColor Red
}

function Refresh-Path {
    $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($machinePath -and $userPath) {
        $env:Path = "$machinePath;$userPath"
    } elseif ($machinePath) {
        $env:Path = $machinePath
    } elseif ($userPath) {
        $env:Path = $userPath
    }
}

function Test-IsAdmin {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Install-WingetPackage($id, $name) {
    Write-Host "  Installing $name via winget..."
    winget install --id $id -e --source winget --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "winget returned $LASTEXITCODE for $name"
    }
    Start-Sleep -Seconds 2
    Refresh-Path
}

function Ensure-Command($command, $wingetId, $name, $manualUrl) {
    if (Get-Command $command -ErrorAction SilentlyContinue) {
        Write-Ok "$name is installed"
        return $true
    }
    if ($SkipPrereqs) {
        Write-Warn "$name is missing. Install manually: $manualUrl"
        return $false
    }
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        Write-Warn "winget is not available. Install $name manually: $manualUrl"
        return $false
    }
    try {
        Install-WingetPackage $wingetId $name
    } catch {
        Write-Warn "winget failed for $name : $_"
    }
    return [bool](Get-Command $command -ErrorAction SilentlyContinue)
}

if (-not (Test-IsAdmin)) {
    Write-Warn "Not running as Administrator. winget may ask for UAC or fail for machine-wide installs."
}

Write-Step "Checking prerequisites"
$gitOk = Ensure-Command "git" "Git.Git" "Git" "https://git-scm.com/download/win"
$javaOk = Ensure-Command "java" "EclipseAdoptium.Temurin.21.JDK" "Temurin JDK 21" "https://adoptium.net/temurin/releases/?version=21"
$nodeOk = Ensure-Command "node" "OpenJS.NodeJS.LTS" "Node.js LTS" "https://nodejs.org/en/download"
$npmOk = Ensure-Command "npm" "OpenJS.NodeJS.LTS" "npm" "https://nodejs.org/en/download"

if (-not $gitOk) {
    Write-Err "Git is required. Install it and rerun this script."
    exit 1
}
if (-not $javaOk) {
    Write-Err "Java is required. Install JDK 17 or newer and rerun this script."
    exit 1
}
if (-not $nodeOk -or -not $npmOk) {
    Write-Err "Node.js/npm is required. Install Node.js LTS and rerun this script."
    exit 1
}

# Locate JDK home for the backend and generated .bat files.
$jdkHome = $env:JAVA_HOME
if (-not $jdkHome -or -not (Test-Path (Join-Path $jdkHome "bin\java.exe"))) {
    $jdkHome = $null
    $javaCmd = Get-Command java -ErrorAction SilentlyContinue
    if ($javaCmd) {
        $jdkHome = Split-Path (Split-Path $javaCmd.Source -Parent) -Parent
    }
    if (-not $jdkHome -or -not (Test-Path (Join-Path $jdkHome "bin\java.exe"))) {
        $adoptium = Get-ChildItem "C:\Program Files\Eclipse Adoptium" -Directory -ErrorAction SilentlyContinue |
            Sort-Object Name -Descending |
            Select-Object -First 1
        if ($adoptium) {
            $jdkHome = $adoptium.FullName
        }
    }
}
if (-not $jdkHome) {
    Write-Err "Could not locate JDK home. Set JAVA_HOME manually and rerun."
    exit 1
}
$env:JAVA_HOME = $jdkHome
if (-not (Test-Path (Join-Path $jdkHome "bin\javac.exe"))) {
    Write-Err "A JRE was found at $jdkHome, but a JDK is required. Install JDK 17 or newer and rerun."
    exit 1
}
Write-Ok "JAVA_HOME = $jdkHome"
[Environment]::SetEnvironmentVariable("JAVA_HOME", $jdkHome, "User")

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
$jdkBin = Join-Path $jdkHome "bin"
if ([string]::IsNullOrWhiteSpace($userPath)) {
    [Environment]::SetEnvironmentVariable("Path", $jdkBin, "User")
} elseif ($userPath -notlike "*$jdkBin*") {
    [Environment]::SetEnvironmentVariable("Path", "$userPath;$jdkBin", "User")
}

# Line endings and long paths are important on Windows.
git config --global core.longpaths true
git config --global core.autocrlf true

Write-Step "Preparing project directory"
if ($InstallRoot -match " ") {
    Write-Warn "Install path contains a space: $InstallRoot"
    Write-Warn "DevEco Studio may reject paths with spaces. Prefer a path like C:\ContractRadar."
}
$repoPath = $InstallRoot
$parent = Split-Path $repoPath -Parent
if (-not (Test-Path $parent)) {
    try {
        New-Item -ItemType Directory -Force -Path $parent | Out-Null
    } catch {
        Write-Warn "Cannot create $parent. Falling back to $env:USERPROFILE\ContractRadar"
        $repoPath = Join-Path $env:USERPROFILE "ContractRadar"
    }
}
Write-Ok "Project target: $repoPath"

Write-Step "Cloning or updating repository"
if (Test-Path (Join-Path $repoPath ".git")) {
    Push-Location $repoPath
    try {
        git pull --ff-only
        if ($LASTEXITCODE -ne 0) {
            Write-Warn "git pull failed. Resolve local changes or merge manually."
        }
    } finally {
        Pop-Location
    }
} elseif (Test-Path $repoPath) {
    $hasFiles = (Get-ChildItem $repoPath -Force | Measure-Object).Count -gt 0
    if ($hasFiles) {
        Write-Err "$repoPath exists but is not a git repository. Move it away and rerun."
        exit 1
    }
    git clone $RepoUrl $repoPath
    if ($LASTEXITCODE -ne 0) {
        Write-Err "git clone failed. Check network access to GitHub."
        exit 1
    }
} else {
    git clone $RepoUrl $repoPath
    if ($LASTEXITCODE -ne 0) {
        Write-Err "git clone failed. Check network access to GitHub."
        exit 1
    }
}

Write-Step "Building backend (first run downloads Maven dependencies)"
Push-Location (Join-Path $repoPath "backend")
try {
    & .\mvnw.cmd -DskipTests package
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "Backend build failed. Check the output above."
    } else {
        Write-Ok "Backend build completed"
    }
} finally {
    Pop-Location
}

Write-Step "Installing admin dependencies"
Push-Location (Join-Path $repoPath "admin-web")
try {
    if (Test-Path "package-lock.json") {
        npm ci
        if ($LASTEXITCODE -ne 0) {
            Write-Warn "npm ci failed, trying npm install"
            npm install
        }
    } else {
        npm install
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "Admin dependency installation failed. Check Node.js/npm and network."
    } else {
        Write-Ok "Admin dependencies installed"
    }
} finally {
    Pop-Location
}

Write-Step "Creating run scripts"
$runBackend = @"
@echo off
cd /d "%~dp0backend"
if not defined JAVA_HOME set "JAVA_HOME=$jdkHome"
call mvnw.cmd spring-boot:run
pause
"@
Set-Content -Path (Join-Path $repoPath "run-backend.bat") -Value $runBackend -Encoding Default

$runAdmin = @"
@echo off
cd /d "%~dp0admin-web"
npm run dev
pause
"@
Set-Content -Path (Join-Path $repoPath "run-admin.bat") -Value $runAdmin -Encoding Default

$runMysql = @"
@echo off
cd /d "%~dp0"
docker compose up -d
pause
"@
Set-Content -Path (Join-Path $repoPath "run-mysql.bat") -Value $runMysql -Encoding Default

if ($WithDocker) {
    Write-Step "Starting MySQL via Docker"
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        Push-Location $repoPath
        try {
            docker compose up -d
            if ($LASTEXITCODE -ne 0) {
                Write-Warn "docker compose failed. Is Docker Desktop running?"
            }
        } finally {
            Pop-Location
        }
    } else {
        Write-Warn "Docker is not installed. MySQL profile will not be available."
    }
}

if ($StartServices) {
    Write-Step "Starting backend and admin in new windows"
    Start-Process -FilePath "cmd.exe" -ArgumentList @("/k", "`"$repoPath\run-backend.bat`"")
    Start-Process -FilePath "cmd.exe" -ArgumentList @("/k", "`"$repoPath\run-admin.bat`"")
}

Write-Step "Setup complete"
Write-Host "Project: $repoPath"
Write-Host "Backend: http://localhost:8080"
Write-Host "Admin:   http://localhost:5173  (admin / admin123)"
Write-Host ""
Write-Host "Manual steps still required:" -ForegroundColor Yellow
Write-Host "1. Install DevEco Studio: https://developer.huawei.com/consumer/cn/deveco-studio/"
Write-Host "2. In DevEco Studio, install the HarmonyOS SDK and create a Phone emulator."
Write-Host "3. Open $repoPath in DevEco Studio."
Write-Host "4. Project Structure > Signing Configs > Automatically generate signature (Huawei account required)."
Write-Host "5. Edit entry\src\main\ets\config\AiConfig.ets and set your ModelScope API key."
Write-Host "6. Run the HarmonyOS app on the emulator."
Write-Host ""
Write-Host "Not automated / currently missing:" -ForegroundColor Yellow
Write-Host "- DevEco Studio, HarmonyOS SDK, emulator image and signing profile."
Write-Host "- ModelScope API key (manual; do not commit it)."
Write-Host "- MySQL 8.0 if you do not use the default H2 database."
Write-Host "- Docker Desktop/WSL2 if you want MySQL through docker-compose."
Write-Host "- Windows Firewall may ask to allow ports 8080 and 5173."
Write-Host ""
Write-Host "Run scripts:" -ForegroundColor Yellow
Write-Host "  $repoPath\run-backend.bat"
Write-Host "  $repoPath\run-admin.bat"
Write-Host "  $repoPath\run-mysql.bat  (optional)"
Write-Host ""
Write-Host "MySQL profile:"
Write-Host "  1. Run run-mysql.bat (Docker Desktop must be running)"
Write-Host "  2. cd backend"
Write-Host "  3. .\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mysql"