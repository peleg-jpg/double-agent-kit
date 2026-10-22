# Double Agent kit installer for Windows 10/11.
#   powershell -ExecutionPolicy Bypass -File install\install-windows.ps1            install everything + a 2-second Remotion test render
#   powershell -ExecutionPolicy Bypass -File install\install-windows.ps1 -NoTest    skip the test render
# Safe to run again: it adds what is missing and updates the kit's skills. No admin rights needed.

param([switch]$NoTest)

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"   # Invoke-WebRequest is 10x slower with the progress bar
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:NPM_CONFIG_UPDATE_NOTIFIER = "false"

$Kit = Split-Path -Parent $PSScriptRoot
$Tools = Join-Path $HOME ".double-agent"      # Node and ffmpeg land here when the computer has none
$Work = Join-Path $HOME "double-agent"        # the student's workspace: prompts, guides, reels
$Skills = Join-Path $HOME ".claude\skills"
$NodeVersion = "24.21.0"
$FfmpegStatic = "5.3.0"
$FfprobeStatic = "3.1.0"
$SkillsCli = "1.7.4"
$script:Failed = @()

function Ok($msg)   { Write-Host "  [OK]      $msg" }
function Miss($msg) { Write-Host "  [MISSING] $msg"; $script:Failed += $msg }
function Step($msg) { Write-Host ""; Write-Host "== $msg" }

# Keep a folder on the user's PATH for every new window, and for the rest of this run.
function Add-UserPath($dir) {
  $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  if (-not $userPath) { $userPath = "" }
  if (($userPath -split ";") -notcontains $dir) {
    [Environment]::SetEnvironmentVariable("Path", ($dir + ";" + $userPath).TrimEnd(";"), "User")
  }
  $env:Path = "$dir;$env:Path"
}

$Arch = if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "arm64" } else { "x64" }
if (Test-Path "$Tools\node") { $env:Path = "$Tools\node;$env:Path" }
if (Test-Path "$Tools\bin") { $env:Path = "$Tools\bin;$env:Path" }

Write-Host "Double Agent kit: installing from $Kit"

Step "1/6 Developer tools"
Ok "not needed on Windows (the speech-to-text tool comes ready-made)"

Step "2/6 Node.js (runs Remotion, the video editor)"
$nodeMajor = 0
try { $nodeMajor = [int]((node -v) -replace '^v(\d+).*', '$1') } catch {}
if ($nodeMajor -ge 20) {
  Ok "Node $(node -v) already installed"
} else {
  Write-Host "  downloading Node $NodeVersion (about 35 MB)..."
  $pkg = "node-v$NodeVersion-win-$Arch"
  try {
    New-Item -ItemType Directory -Force $Tools | Out-Null
    Remove-Item -Recurse -Force "$Tools\node", "$Tools\$pkg" -ErrorAction SilentlyContinue
    Invoke-WebRequest "https://nodejs.org/dist/v$NodeVersion/$pkg.zip" -OutFile "$Tools\node.zip" -UseBasicParsing
    Expand-Archive "$Tools\node.zip" -DestinationPath $Tools -Force
    Rename-Item "$Tools\$pkg" "node"
    Remove-Item "$Tools\node.zip"
    Add-UserPath "$Tools\node"
    Ok "Node $(node -v) installed in $Tools\node"
  } catch {
    Miss "Node.js: the download failed. Check the internet connection and run the installer again"
  }
}

Step "3/6 FFmpeg (sound and video files)"
if (Get-Command ffmpeg -ErrorAction SilentlyContinue) {
  Ok "FFmpeg already installed ($((Get-Command ffmpeg).Source))"
} elseif (Get-Command npm.cmd -ErrorAction SilentlyContinue) {
  Write-Host "  downloading FFmpeg (about 80 MB)..."
  New-Item -ItemType Directory -Force "$Tools\bin" | Out-Null
  & npm.cmd install --prefix "$Tools\ffmpeg" --no-audit --no-fund --loglevel=error "ffmpeg-static@$FfmpegStatic" "ffprobe-static@$FfprobeStatic" | Out-Null
  $ff = "$Tools\ffmpeg\node_modules\ffmpeg-static\ffmpeg.exe"
  $fp = "$Tools\ffmpeg\node_modules\ffprobe-static\bin\win32\$Arch\ffprobe.exe"
  if (-not (Test-Path $fp)) { $fp = "$Tools\ffmpeg\node_modules\ffprobe-static\bin\win32\x64\ffprobe.exe" }
  if (Test-Path $ff) {
    Copy-Item -Force $ff "$Tools\bin\ffmpeg.exe"
    if (Test-Path $fp) { Copy-Item -Force $fp "$Tools\bin\ffprobe.exe" }
    Add-UserPath "$Tools\bin"
    Ok "FFmpeg installed in $Tools\bin"
  } else {
    Miss "FFmpeg: the download failed. Run the installer again"
  }
} else {
  Miss "FFmpeg: needs Node.js first (step 2)"
}

Step "4/6 The kit's skills (into $Skills)"
New-Item -ItemType Directory -Force $Skills | Out-Null
Get-ChildItem -Directory (Join-Path $Kit "skills") | ForEach-Object {
  $dest = Join-Path $Skills $_.Name
  New-Item -ItemType Directory -Force $dest | Out-Null
  Copy-Item -Recurse -Force (Join-Path $_.FullName "*") $dest
  if (Test-Path (Join-Path $dest "SKILL.md")) { Ok $_.Name } else { Miss "skill $($_.Name)" }
}

Step "5/6 Remotion's official skills (how Claude writes video code)"
if (Get-Command npx.cmd -ErrorAction SilentlyContinue) {
  & npx.cmd -y "skills@$SkillsCli" add remotion-dev/skills -g -a claude-code -s '*' -y --copy *> $null
}
if (Get-ChildItem $Skills -Directory | Where-Object { $_.Name -like "*remotion*" }) {
  Ok "remotion-dev/skills"
} else {
  Miss "Remotion skills: run this installer again (needs Node.js)"
}

Step "6/6 Your workspace ($Work)"
New-Item -ItemType Directory -Force "$Work\reels" | Out-Null
Copy-Item -Recurse -Force (Join-Path $Kit "prompts"), (Join-Path $Kit "guides") $Work
Ok "prompts, guides and a reels folder in $Work"

if (-not $NoTest -and (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
  Step "Test: rendering 2 seconds with Remotion (first time about 2 minutes)"
  $t = Join-Path $env:TEMP ("double-agent-test-" + [guid]::NewGuid().ToString("N").Substring(0, 8))
  New-Item -ItemType Directory -Force $t | Out-Null
  Copy-Item -Recurse -Force "$Skills\motion-reel-pop\template\*" $t
  Push-Location $t
  & npm.cmd i --no-audit --no-fund --loglevel=error *> $null
  & npx.cmd remotion render src/index.ts DemoSpeaker out/test.mp4 --frames=0-59 --log=error *> $null
  $rendered = (Test-Path "out\test.mp4") -and ((Get-Item "out\test.mp4").Length -gt 0)
  Pop-Location
  if ($rendered) {
    Ok "Remotion rendered a test video, the editor works"
    Remove-Item -Recurse -Force $t -ErrorAction SilentlyContinue
  } else {
    Miss "Remotion test render failed. Ask Claude to run: cd $t; npx remotion render src/index.ts DemoSpeaker out/test.mp4 --frames=0-59"
  }
}

Write-Host ""
if ($script:Failed.Count -eq 0) {
  Write-Host "DONE: everything is installed."
} else {
  Write-Host "DONE WITH GAPS:"
  $script:Failed | ForEach-Object { Write-Host "  - $_" }
}
Write-Host "Next: connect ElevenLabs, HeyGen and Apify (the connectors guide is in $Work\guides),"
Write-Host "then quit Claude completely and open it again, so the new skills load."
if ($script:Failed.Count -gt 0) { exit 1 }
