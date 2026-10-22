#!/bin/bash
# Double Agent kit installer for Mac (works on Linux too).
#   bash install/install-mac.sh            install everything + a 2-second Remotion test render
#   bash install/install-mac.sh --no-test  skip the test render (the editing engine is still installed)
# Safe to run again: it adds what is missing, repairs a half-finished install and updates the kit's skills.
# No password, no Homebrew needed. Details of every npm step go to ~/.double-agent/install.log.

set -u
export NPM_CONFIG_UPDATE_NOTIFIER=false
KIT="$(cd "$(dirname "$0")/.." && pwd)"
TOOLS="$HOME/.double-agent"           # Node, ffmpeg and the editing engine land here
WORK="$HOME/double-agent"             # the student's workspace: prompts, guides, reels
SKILLS="$HOME/.claude/skills"
LOG="$TOOLS/install.log"
NODE_VERSION="24.21.0"
FFMPEG_STATIC="5.3.0"
FFPROBE_STATIC="3.1.0"
SKILLS_CLI="1.7.4"
RUN_TEST=1
[ "${1:-}" = "--no-test" ] && RUN_TEST=0

FAILED=""
ok()   { printf '  [OK]      %s\n' "$1"; }
miss() { printf '  [MISSING] %s\n' "$1"; FAILED="$FAILED\n  - $1"; }
step() { printf '\n== %s\n' "$1"; }

# Show why an npm step failed: a full disk gets its own message, anything else the end of the log.
npm_failed() {
  if grep -q 'ENOSPC' "$LOG" 2>/dev/null; then
    miss "$1: the disk is full. Free at least 3 GB (Trash, Downloads, old videos), then run the installer again"
  else
    miss "$1: npm failed. Last lines of $LOG:"
    tail -15 "$LOG" | sed 's/^/      /'
  fi
}

# Keep a folder on PATH for every new terminal, and for the rest of this run.
add_path() {
  local line="export PATH=\"$1:\$PATH\""
  for rc in "$HOME/.zshrc" "$HOME/.zprofile" "$HOME/.bash_profile" "$HOME/.bashrc"; do
    case "$rc" in *.zshrc|*.zprofile) ;; *) [ -f "$rc" ] || continue ;; esac
    grep -qsF "$line" "$rc" || printf '\n# double-agent-kit\n%s\n' "$line" >> "$rc"
  done
  export PATH="$1:$PATH"
}

OS="$(uname -s)"
case "$(uname -m)" in arm64|aarch64) ARCH=arm64 ;; *) ARCH=x64 ;; esac
[ -d "$TOOLS/node/bin" ] && export PATH="$TOOLS/node/bin:$PATH"
[ -d "$TOOLS/bin" ] && export PATH="$TOOLS/bin:$PATH"
mkdir -p "$TOOLS" && : > "$LOG"
FIX_PATH="export PATH=\"$TOOLS/node/bin:$TOOLS/bin:\$PATH\";"   # for commands Claude runs before a restart

echo "Double Agent kit: installing from $KIT"
FREE_GB=$(( $(df -Pk "$HOME" | awk 'NR==2{print $4}') / 1048576 ))
if [ "$FREE_GB" -lt 3 ]; then
  echo "  WARNING: only $FREE_GB GB free on the disk. The kit needs about 3 GB. Free some space first if anything fails."
fi

step "1/6 Developer tools (Mac only, needed for the speech-to-text step)"
if [ "$OS" = "Darwin" ]; then
  if xcode-select -p >/dev/null 2>&1; then
    ok "Xcode Command Line Tools"
  else
    xcode-select --install >/dev/null 2>&1
    miss "Xcode Command Line Tools: a window opened, click Install (5-10 minutes), then run this installer again"
  fi
else
  ok "not a Mac, skipped"
fi

step "2/6 Node.js (runs Remotion, the video editor)"
NODE_MAJOR="$(node -v 2>/dev/null | sed -E 's/^v([0-9]+).*/\1/')"
if [ -n "$NODE_MAJOR" ] && [ "$NODE_MAJOR" -ge 20 ]; then
  ok "Node $(node -v) already installed"
else
  if [ "$OS" = "Darwin" ]; then PKG="node-v$NODE_VERSION-darwin-$ARCH"; EXT="tar.gz"; else PKG="node-v$NODE_VERSION-linux-$ARCH"; EXT="tar.xz"; fi
  echo "  downloading Node $NODE_VERSION (about 50 MB)..."
  rm -rf "$TOOLS/node" "$TOOLS/$PKG"
  if curl -fsSL "https://nodejs.org/dist/v$NODE_VERSION/$PKG.$EXT" -o "$TOOLS/node.$EXT" \
     && tar -xf "$TOOLS/node.$EXT" -C "$TOOLS" && mv "$TOOLS/$PKG" "$TOOLS/node"; then
    rm -f "$TOOLS/node.$EXT"
    add_path "$TOOLS/node/bin"
    ok "Node $(node -v) installed in $TOOLS/node"
  else
    miss "Node.js: the download failed. Check the internet connection and run the installer again"
  fi
fi

step "3/6 FFmpeg (sound and video files)"
if command -v ffmpeg >/dev/null 2>&1; then
  ok "FFmpeg already installed ($(command -v ffmpeg))"
elif command -v npm >/dev/null 2>&1; then
  echo "  downloading FFmpeg (about 80 MB)..."
  mkdir -p "$TOOLS/bin"
  PLAT="$( [ "$OS" = "Darwin" ] && echo darwin || echo linux )"
  if (cd "$TOOLS" && npm install --prefix "$TOOLS/ffmpeg-dl" --no-audit --no-fund \
       "ffmpeg-static@$FFMPEG_STATIC" "ffprobe-static@$FFPROBE_STATIC" >>"$LOG" 2>&1) && \
     cp "$TOOLS/ffmpeg-dl/node_modules/ffmpeg-static/ffmpeg" "$TOOLS/bin/ffmpeg" && \
     cp "$TOOLS/ffmpeg-dl/node_modules/ffprobe-static/bin/$PLAT/$ARCH/ffprobe" "$TOOLS/bin/ffprobe"; then
    rm -rf "$TOOLS/ffmpeg-dl"     # it holds ffprobe for every platform (300 MB); we keep only ours
    chmod +x "$TOOLS/bin/ffmpeg" "$TOOLS/bin/ffprobe"
    add_path "$TOOLS/bin"
    ffmpeg -version >/dev/null 2>&1 && ok "FFmpeg installed in $TOOLS/bin" || miss "FFmpeg: installed but does not run"
  else
    rm -rf "$TOOLS/ffmpeg-dl"
    npm_failed "FFmpeg"
  fi
else
  miss "FFmpeg: needs Node.js first (step 2)"
fi

step "4/6 The kit's skills (into $SKILLS)"
mkdir -p "$SKILLS"
for dir in "$KIT"/skills/*/; do
  name="$(basename "$dir")"
  mkdir -p "$SKILLS/$name" && cp -R "$dir". "$SKILLS/$name/"
  [ -f "$SKILLS/$name/SKILL.md" ] && ok "$name" || miss "skill $name"
done

step "5/6 Remotion's official skills (how Claude writes video code)"
if command -v npx >/dev/null 2>&1 && \
   npx -y "skills@$SKILLS_CLI" add remotion-dev/skills -g -a claude-code -s '*' -y --copy >>"$LOG" 2>&1 && \
   ls "$SKILLS" | grep -qi remotion; then
  ok "remotion-dev/skills"
else
  miss "Remotion skills: run this installer again (needs Node.js and the developer tools)"
fi

step "6/6 Your workspace ($WORK)"
mkdir -p "$WORK/reels"
cp -R "$KIT/prompts" "$KIT/guides" "$WORK/"
ok "prompts, guides and a reels folder in $WORK"

# The editing engine: Remotion + its Chrome (about 1 GB), installed once here and linked into every reel folder.
if command -v npm >/dev/null 2>&1; then
  step "Remotion editing engine (first time 5-10 minutes, it downloads about 1 GB)"
  E="$TOOLS/engine"
  engine_ok() { [ -f "$E/node_modules/@remotion/renderer/dist/index.js" ] && [ -x "$E/node_modules/.bin/remotion" ]; }
  mkdir -p "$E" && cp -R "$SKILLS/motion-reel-pop/template/." "$E/"
  # A normal run is a quick npm i. A broken or half-finished engine is wiped and installed clean from the lockfile.
  if ! { (cd "$E" && npm i --no-audit --no-fund >>"$LOG" 2>&1) && engine_ok; }; then
    echo "  repairing the engine with a clean install..."
    rm -rf "$E/node_modules"
    (cd "$E" && npm ci --no-audit --no-fund >>"$LOG" 2>&1)
  fi
  if engine_ok; then
    ok "Remotion installed in $E"
    if [ "$RUN_TEST" = 1 ]; then
      if (cd "$E" && rm -f out/test.mp4 && \
          npx remotion render src/index.ts DemoSpeaker out/test.mp4 --frames=0-59 --log=error >>"$LOG" 2>&1 && \
          [ -s out/test.mp4 ]); then
        ok "Remotion rendered a test video, the editor works"
      elif grep -q 'ENOSPC' "$LOG"; then
        npm_failed "Remotion test render"
      else
        miss "Remotion test render failed. Ask Claude to run: $FIX_PATH cd \"$E\" && npx remotion render src/index.ts DemoSpeaker out/test.mp4 --frames=0-59"
      fi
    fi
  else
    npm_failed "Remotion engine"
  fi
fi

echo
if [ -z "$FAILED" ]; then
  echo "DONE: everything is installed."
else
  printf "DONE WITH GAPS:%b\n" "$FAILED"
fi
echo "Until Claude is restarted, start follow-up commands with: $FIX_PATH"
echo "Next: connect ElevenLabs, HeyGen and Apify (guide: $WORK/guides/חיבור-הכלים.md),"
echo "then quit Claude completely and open it again, so the new skills load."
[ -z "$FAILED" ]
