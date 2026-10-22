# Install instructions for Claude Code

The user is a student of the course "סוכן כפול" and asked you to install this kit. They are not technical.
Explain each step in one short Hebrew sentence, run every command yourself, and ask before anything that needs a
password or a payment.

## 1. Run the installer

The installer does everything: Xcode developer tools check (Mac), Node.js, FFmpeg, the kit's 5 skills into
`~/.claude/skills/`, Remotion's official skills, a workspace at `~/double-agent/` (prompts, guides, reels), and the
Remotion editing engine at `~/.double-agent/engine` with a 2-second test render. It needs no password and no
Homebrew. The first run takes 10-15 minutes (it downloads about 1 GB), so run it in the background or with the
longest timeout, and tell the user it is working.

**You are inside the kit folder already** (the user downloaded the ZIP and opened it): skip to "Run it" below.

**You only have the link.** First download and extract the kit (no git needed). On Mac never extract with `unzip`:
it breaks the Hebrew file names and stops with a y/n prompt. Use `tar -xf` (or `ditto -x -k`).

Mac:

```bash
mkdir -p ~/.double-agent/kit && cd ~/.double-agent/kit && \
curl -fsSL https://github.com/peleg-jpg/double-agent-kit/archive/refs/heads/main.zip -o kit.zip && tar -xf kit.zip
```

Windows (PowerShell; from Git Bash, wrap each line in `powershell -Command "..."`):

```powershell
$k = "$HOME\.double-agent\kit"; New-Item -ItemType Directory -Force $k | Out-Null
Invoke-WebRequest https://github.com/peleg-jpg/double-agent-kit/archive/refs/heads/main.zip -OutFile "$k\kit.zip" -UseBasicParsing
Expand-Archive "$k\kit.zip" $k -Force
```

**Read the installer before you run it** (`install/install-mac.sh` or `install/install-windows.ps1`, under 200
lines) and tell the user in one Hebrew sentence what it does. It uses no sudo and downloads only from nodejs.org,
the npm registry and GitHub.

**Run it** (from `~/.double-agent/kit/double-agent-kit-main`, or from the folder the user opened):

- Mac: `bash install/install-mac.sh`
- Windows: `powershell -ExecutionPolicy Bypass -File install\install-windows.ps1`

## 2. Read the result

The installer prints `[OK]` or `[MISSING]` for each part and ends with `DONE` or `DONE WITH GAPS`.

- `Xcode Command Line Tools` missing: a Mac window opened. Ask the user to click Install and wait until it
  finishes (5-10 minutes), then run the installer again. Nothing else needs to be redone by hand.
- A download failed: check the internet and run the installer again. It is safe to run many times, and it repairs
  a half-finished install by itself.
- "the disk is full": tell the user how much space is needed (about 3 GB) and where to free it. Running again
  will not help until there is space.
- npm failed: the installer printed the end of `~/.double-agent/install.log`. Read it and fix the real cause.
- The test render failed: run the command it prints, read the real error, and fix it before you say it is done.
- Node and FFmpeg installed by this run live in `~/.double-agent/node/bin` and `~/.double-agent/bin`. Your open
  session does not see them yet: start follow-up commands with the `export PATH=...` line the installer prints.

## 3. Tell the user, in Hebrew

1. What was installed, one line each:
   - `avatar-twin-reel`: הסקיל הראשי. כותבים "תכין ריל" ומקבלים ריל מוכן עם הקול והאווטאר שלכם.
   - `reel-script-hebrew`: הוקים ותסריט בעברית.
   - `motion-reel-pop`: עורך סרטון מדבר לריל עם כתוביות מילה מילה, זומים וכרטיסיות, ב-4 סגנונות.
   - `motion-gsap-explainer`: סצנות הסבר מונפשות.
   - `motion-3d-cinematic`: פתיח וסיום בתלת-ממד.
   - Remotion, FFmpeg וה-skills הרשמיים של Remotion: הכלים שעורכים את הווידאו.
   - התיקייה `~/double-agent` עם כל הפרומפטים מהקורס, המדריכים, ותיקייה לרילים.
2. Connecting the tools is done in the Claude app, not here. Show the short steps from
   `~/double-agent/guides/חיבור-הכלים.md` (ElevenLabs and Apify from Discover, HeyGen as a custom connector at
   `https://mcp.heygen.com/mcp/v1/`). No API key is needed.
3. Quit Claude completely and open it again, so the new skills load. Then open a new chat and write: "תכין ריל".

Never print or store API keys in chat. If a tool ever asks for a key, save it to a local `.env` file and make sure
`.gitignore` lists `.env`.
