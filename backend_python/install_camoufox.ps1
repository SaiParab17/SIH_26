$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$CacheDir = "C:\Users\sai shankar parab\AppData\Local\camoufox\camoufox\Cache"
$BrowsersDir = "$CacheDir\browsers\official\152.0.4-beta.30"
$ZipPath = "d:\3rd year\SIH\SIH 152 Frontend\backend_python\camoufox.zip"
$Url = "https://github.com/daijro/camoufox/releases/download/v152.0.4-beta.30/camoufox-152.0.4-beta.30-win.x86_64.zip"

Write-Host "Downloading Camoufox zip..."
Invoke-WebRequest -Uri $Url -OutFile $ZipPath -UserAgent "Mozilla/5.0"

Write-Host "Extracting archive to $BrowsersDir..."
if (Test-Path $BrowsersDir) { Remove-Item -Recurse -Force $BrowsersDir }
New-Item -ItemType Directory -Force -Path $BrowsersDir | Out-Null
Expand-Archive -Path $ZipPath -DestinationPath $BrowsersDir -Force
Remove-Item -Force $ZipPath

Write-Host "Writing configuration files..."
$VersionJson = '{"version": "152.0.4", "build": "beta.30", "prerelease": true, "created_at": "2026-09-01T00:00:00Z"}'
Set-Content -Path "$BrowsersDir\version.json" -Value $VersionJson -Encoding UTF8

$ConfigJson = '{"active_version": "browsers/official/152.0.4-beta.30"}'
Set-Content -Path "$CacheDir\config.json" -Value $ConfigJson -Encoding UTF8

New-Item -ItemType File -Force -Path "$CacheDir\.0.5_FLAG" | Out-Null

Write-Host "Camoufox installation complete!"
