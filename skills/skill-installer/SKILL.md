---
name: skill-installer
description: >
  Installs or updates AI skills from the private GitHub repository dasheck0/skills
  onto the local machine. Use this skill whenever the user wants to install, update, add, or sync
  skills from their personal skills library — also triggered by phrases like "installier mir meine skills",
  "install my skills", "welche skills gibt es in meinem repo", "update my skills",
  "hol mir den architecture-interview skill", "install all skills globally", or any mention of
  installing/updating skills from the personal skills repository.
  Trigger proactively when the user mentions their skills repo, personal skill library, or dasheck0/skills.
license: MIT
metadata:
  author: dasheck0
  version: '1.0.0'
---

# Skill Installer

Installs and updates skills from the private `dasheck0/skills` repository.

**Hardcoded constants — never ask the user for these:**
- **Repo HTTPS**: `https://github.com/dasheck0/skills.git`
- **Repo SSH**: `git@github.com:dasheck0/skills.git`
- **Branch**: `master`
- **Skill path prefix in repo**: `skills/<skill-name>/`
- **README URL**: `https://raw.githubusercontent.com/dasheck0/skills/master/README.md`

**Preferred install command:**

```bash
npx skills@latest add dasheck0/skills --skill=<skill-name>
```

When the Vercel Skills CLI is available, prefer it because it discovers target
agents and supports `--agent`, `--global`, `--copy`, and `--yes`. Continue with
the repository-specific workflow below when the user needs its interactive
update comparison or the CLI is unavailable.

---

## Phase 1: Detect Environment

Before showing the skill menu, silently detect which AI tool(s) are installed on this machine. Do this by checking for config files and directories — never ask the user.

### Detection Logic

Run these checks mentally (or via bash if needed):

```bash
# opencode global config
ls ~/.config/opencode/ 2>/dev/null

# opencode project-local config
ls .opencode/ 2>/dev/null

# Claude Code global config
ls ~/.claude/settings.json 2>/dev/null

# Claude Code project-local
ls .claude/ 2>/dev/null
```

### Environment Matrix

| Detected | Global install path | Project-local install path |
|----------|--------------------|-----------------------------|
| **opencode** | `~/.config/opencode/skills/<name>/` | `.opencode/skills/<name>/` |
| **Claude Code** | `~/.claude/skills/<name>/` | `.claude/skills/<name>/` |
| **Both** | Ask user which tool to install to | Ask user which tool to install to |
| **Neither** | Warn user — no supported AI tool detected | — |

> **Note on path overlap**: opencode also reads `~/.claude/skills/` and `.claude/skills/`, so installing to Claude Code paths makes skills available in opencode too. Mention this to the user if both tools are detected.

### Scope Question

After detecting the environment, ask exactly this:

> **Install scope: global or project-local?**
> - **Global** → available in all your projects (recommended)
> - **Project-local** → only available in this project

Default to **global** if the user doesn't specify.

---

## Phase 2: Fetch Available Skills

Read the `README.md` from the repo to get the authoritative list of skills. This is the single source of truth — do NOT hardcode skill names.

### Fetch via gh CLI (preferred)

```bash
gh api repos/dasheck0/skills/contents/README.md \
  --jq '.content' | base64 --decode
```

### Fetch via curl + SSH (fallback)

```bash
curl -s https://raw.githubusercontent.com/dasheck0/skills/master/README.md
```

> If both fail → proceed to Phase 3 (GitHub auth check) first, then retry.

### Parse the Skill Table

Find the `## Existing Skills` section in the README. Parse the Markdown table to extract:
- Skill name (e.g. `architecture-interview`)
- Directory (e.g. `skills/architecture-interview/`)
- Description (one-liner)

### Show Selection Menu

Present the parsed skills as a numbered menu. Always append an "all" option:

```
Available skills:

1. skill-installer          — Install/update skills from this repo
2. skill-updater             — Push local skill changes back to this repo
3. architecture-interview    — Interview-driven project guidelines generator

4. Install all skills

Which skill(s) do you want to install? (enter number or numbers separated by comma)
```

---

## Phase 3: GitHub Authentication Check

Before downloading, verify GitHub access to the private repo.

### Check 1: gh CLI

```bash
gh auth status
```

- If `gh` is authenticated and has repo access → **use gh CLI** for all downloads. Done.
- If `gh` is not authenticated → attempt `gh auth login` (walk user through it, see below)
- If `gh` is not installed → check SSH

### Check 2: SSH

```bash
ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"
```

- If SSH auth succeeds → **use SSH** for downloads. Done.

### Check 3: Install gh CLI (if nothing works)

If neither `gh` CLI nor SSH work, walk the user through installing and authenticating the `gh` CLI:

**macOS:**
```bash
brew install gh
gh auth login
```

**Linux:**
```bash
(type -p wget >/dev/null || (sudo apt update && sudo apt-get install wget -y)) \
  && sudo mkdir -p -m 755 /etc/apt/keyrings \
  && out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg \
  && cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
  && sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && sudo apt update && sudo apt install gh -y
gh auth login
```

During `gh auth login`, instruct the user to:
1. Select **GitHub.com**
2. Select **HTTPS**
3. Select **Login with a web browser**
4. Copy the one-time code and open the shown URL

After successful auth, retry the download.

---

## Phase 4: Download Skills

For each selected skill, download only that skill's subdirectory using `git sparse-checkout`.

### Temp Directory

```bash
TMPDIR="/tmp/skills-install-$(date +%s)"
mkdir -p "$TMPDIR"
```

### Download via gh CLI (preferred)

```bash
cd "$TMPDIR"
git init
git remote add origin https://github.com/dasheck0/skills.git
gh auth setup-git  # ensures git uses gh credentials
git sparse-checkout init --cone
git sparse-checkout set skills/<skill-name>
git pull origin master --depth=1
```

### Download via SSH (fallback)

```bash
cd "$TMPDIR"
git init
git remote add origin git@github.com:dasheck0/skills.git
git sparse-checkout init --cone
git sparse-checkout set skills/<skill-name>
git pull origin master --depth=1
```

After pull, skill files are at: `$TMPDIR/skills/<skill-name>/`

---

## Phase 5: Update Detection

Before copying, check if a version of this skill already exists at the destination.

### If skill does NOT exist → install directly (no diff needed)

```bash
cp -r "$TMPDIR/skills/<skill-name>/" "<destination>/<skill-name>/"
```

### If skill ALREADY EXISTS → show diff and ask for confirmation

Compute a compact diff of the `SKILL.md` files:

```bash
diff -u "<destination>/<skill-name>/SKILL.md" "$TMPDIR/skills/<skill-name>/SKILL.md"
```

Show the user a compact summary:

```
⚠️  architecture-interview already exists at <destination>

Changes detected:
  • SKILL.md: +12 lines, -3 lines
  [show first 20 lines of diff]

Update this skill? (y/n)
```

- If **yes** → overwrite with `cp -r`
- If **no** → skip this skill, continue with next

If there are **no changes** (diff is empty):

```
✓ architecture-interview is already up to date. Skipping.
```

---

## Phase 6: Cleanup & Summary

After all skills are processed:

```bash
rm -rf "$TMPDIR"
```

Show a final summary:

```
✅ Installation complete

Installed:
  • architecture-interview → ~/.config/opencode/skills/architecture-interview/
  • skill-updater          → ~/.config/opencode/skills/skill-updater/

Skipped (already up to date):
  • skill-installer

⚡ You may need to restart your AI assistant session for new skills to become available.
```

---

## Error Handling

| Situation | Action |
|-----------|--------|
| README fetch fails | Fall back to SSH fetch; if both fail → run Phase 3 auth check |
| Repo not accessible after auth | Show clear error: "Cannot access dasheck0/skills — check your GitHub account has access to this private repo" |
| Skill directory missing in repo | Warn: "Skill `<name>` not found in repo. It may have been renamed or removed." |
| Destination directory not writable | Show error with the exact path and suggest `sudo` or checking permissions |
| git not installed | "git is required. Install it with `brew install git` (macOS) or `sudo apt install git` (Linux)" |
| No supported AI tool detected | "No supported AI tool detected on this machine. Expected one of: opencode (`~/.config/opencode/`), Claude Code (`~/.claude/settings.json`). Install one first, then re-run." |
