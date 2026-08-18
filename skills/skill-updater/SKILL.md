---
name: skill-updater
description: Pushes a locally installed skill back to the private GitHub repository https://github.com/dasheck0/skills. Use this skill whenever the user wants to publish, upload, sync, update, or push a local skill to their personal skills repo — also triggered by phrases like "push skill to repo", "skill hochladen", "skill ins repo pushen", "änderungen am skill veröffentlichen", "skill updaten im repo", "sync skill with remote", "update my skill in github", "meine skill-änderungen pushen", "skill contribution einreichen", or anything that involves writing a skill back to the dasheck0/skills repository. Trigger proactively when the user has modified a locally installed skill and wants to share or persist the changes.
license: MIT
metadata:
  author: dasheck0
  version: '1.0.0'
---

# Skill Updater

Pushes a locally installed skill back to the private `https://github.com/dasheck0/skills` repository.

**Hardcoded constants — never ask the user for these:**
- **Repo HTTPS**: `https://github.com/dasheck0/skills`
- **Repo SSH**: `git@github.com:dasheck0/skills.git`
- **Branch**: `master`
- **Skill path prefix in repo**: `skills/<skill-name>/`

---

## Phase 1: Detect Installed Skills

Silently scan all known install locations for locally installed skills. Do this via bash — never ask the user where their skills are.

### Scan these paths (in this order):

```bash
# opencode — project-local
ls .opencode/skills/ 2>/dev/null

# opencode — global
ls ~/.config/opencode/skills/ 2>/dev/null

# Claude Code — project-local
ls .claude/skills/ 2>/dev/null

# Claude Code — global
ls ~/.claude/skills/ 2>/dev/null
```

### Build a unified skill inventory

Collect every directory that contains a `SKILL.md` file. Deduplicate by skill name — if the same skill exists in multiple locations, list each location separately so the user can choose which copy to push.

### Show the selection menu

Present all found skills as a numbered list, showing both skill name and install location:

```
Locally installed skills:

1. architecture-interview  → ~/.config/opencode/skills/architecture-interview/  [global / opencode]
2. skill-installer          → .opencode/skills/skill-installer/                  [project-local / opencode]
3. skill-updater            → ~/.config/opencode/skills/skill-updater/           [global / opencode]

Which skill(s) do you want to push? (enter number, numbers separated by comma, or "all")
```

If **no skills are found** in any location:
```
❌ No skills found on this machine.

Expected locations:
  • ~/.config/opencode/skills/   (opencode global)
  • .opencode/skills/            (opencode project-local)
  • ~/.claude/skills/            (Claude Code global)
  • .claude/skills/              (Claude Code project-local)

Install skills first with the skill-installer skill.
```

---

## Phase 2: GitHub Authentication Check

Before doing anything with the remote repo, verify access. Use the same logic as the installer.

### Check 1: gh CLI

```bash
gh auth status
```

- Authenticated with repo access → **use gh CLI** for all git operations. Done.
- Not authenticated → attempt `gh auth login` (walk user through it — see below).
- Not installed → check SSH.

### Check 2: SSH

```bash
ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"
```

- SSH auth succeeds → **use SSH** for git operations. Done.

### Check 3: Install gh CLI (if nothing works)

If neither works, walk the user through installing and authenticating `gh`:

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

After successful auth, retry from Phase 2.

---

## Phase 3: Fetch Remote Version & Diff

For each selected skill, fetch the current version from the remote repo and compute a diff before pushing.

### Step 1: Clone with sparse-checkout into a temp directory

```bash
TMPDIR="/tmp/skills-update-$(date +%s)"
mkdir -p "$TMPDIR"
cd "$TMPDIR"
git init
```

**via gh CLI (preferred):**
```bash
git remote add origin https://github.com/dasheck0/skills.git
gh auth setup-git
git sparse-checkout init --cone
git sparse-checkout set skills/<skill-name>
git pull origin master --depth=1
```

**via SSH (fallback):**
```bash
git remote add origin git@github.com:dasheck0/skills.git
git sparse-checkout init --cone
git sparse-checkout set skills/<skill-name>
git pull origin master --depth=1
```

After pull, remote skill files are at: `$TMPDIR/skills/<skill-name>/`

### Step 2: Compare local vs. remote

```bash
diff -rq "<local-skill-path>/" "$TMPDIR/skills/<skill-name>/"
```

### Three possible outcomes:

**A) Skill does NOT exist in remote repo yet → new skill contribution**

```
🆕  <skill-name> does not exist yet in the remote repo.

This will create a new skill at: skills/<skill-name>/

Files to be pushed:
  • SKILL.md
  • scripts/   (if present)
  • evals/     (if present)

Push this new skill? (y/n)
```

**B) Skill exists but has NO changes**

```
✓ <skill-name> is already up to date with the remote. Nothing to push.
```

Skip this skill and continue with next.

**C) Skill exists and HAS changes → show diff and ask for confirmation**

Compute a human-readable diff summary:

```bash
diff -u "$TMPDIR/skills/<skill-name>/SKILL.md" "<local-skill-path>/SKILL.md"
```

Present it like this:

```
📝  Changes in <skill-name> (local vs. remote):

  SKILL.md: +8 lines, -2 lines
  ──────────────────────────────────────────
  [show first 30 lines of diff output]
  ──────────────────────────────────────────

  Additional changed files: scripts/fetch.js (+15 lines)

Push these changes to https://github.com/dasheck0/skills? (y/n/force)
```

Options:
- **`y`** → confirm and push
- **`n`** → skip this skill, continue with next
- **`force`** → push without further confirmation (useful when pushing multiple skills)

> **Tip**: If the user passes `--force` upfront (e.g., "push all skills --force"), skip the confirmation prompt entirely for all skills and push immediately.

---

## Phase 4: Push to Remote

For each confirmed skill, copy the local files into the cloned temp repo and push.

### Step 1: Prepare the temp repo working tree

```bash
# Remove old remote version (if exists) and replace with local
rm -rf "$TMPDIR/skills/<skill-name>"
cp -r "<local-skill-path>/" "$TMPDIR/skills/<skill-name>/"
```

### Step 2: Stage and commit

```bash
cd "$TMPDIR"
git add skills/<skill-name>/
```

Generate a commit message automatically based on context:
- **New skill**: `feat(skills): add <skill-name>`
- **Update existing**: `feat(skills): update <skill-name>`
- **Multiple skills**: `feat(skills): update <skill-a>, <skill-b>`

```bash
git commit -m "<generated-commit-message>"
```

### Step 3: Push

**via gh CLI:**
```bash
gh auth setup-git
git push origin master
```

**via SSH:**
```bash
git push origin master
```

### Step 4: Verify push succeeded

```bash
# Check the last commit on remote matches what we just pushed
gh api repos/dasheck0/skills/commits/master --jq '.sha' 2>/dev/null
```

If the push fails (e.g., remote has diverged), show the error clearly:

```
❌ Push failed: remote contains commits that are not in your local copy.

This usually means you pushed from another machine since you last synced.

Options:
  1. Pull the latest changes first, then re-run this skill
  2. Force-push (⚠️ overwrites remote — only do this if you know what you're doing)

What would you like to do? (pull / force / cancel)
```

If the user chooses **force**:
```bash
git push origin master --force
```

Always warn explicitly before force-pushing: "⚠️ This will overwrite the remote branch. Any commits on the remote that are not in your local copy will be lost."

---

## Phase 5: Update README (new skills only)

After a successful push, check if any of the pushed skills were **new** (i.e., did not exist in the remote repo before — outcome A from Phase 3). If yes, automatically update the `README.md` in the repo to add the new skill(s) to the `## Vorhandene Skills` table.

### Step 1: Fetch current README from remote

```bash
gh api repos/dasheck0/skills/contents/README.md --jq '.content' | base64 --decode > "$TMPDIR/README.md"
README_SHA=$(gh api repos/dasheck0/skills/contents/README.md --jq '.sha')
```

### Step 2: Extract description from new skill's SKILL.md

Parse the `description` field from the SKILL.md frontmatter of the new skill:

```bash
# Extract the description value from the YAML frontmatter
# Handle both single-line and multi-line (>) descriptions
```

Use the description as the table entry text. If it is longer than ~200 characters, truncate it to a meaningful one-liner.

### Step 3: Add new row to the skill table

Find the `## Vorhandene Skills` section in the README and append a new row to the Markdown table:

```
| **<skill-name>** | `skills/<skill-name>/` | <description from SKILL.md frontmatter> |
```

Insert the new row **at the end of the table**, before the next `---` or section heading.

### Step 4: Commit and push the updated README

Use the GitHub API to update the file directly (avoids needing a separate git commit):

```bash
NEW_CONTENT=$(base64 -i "$TMPDIR/README.md")

gh api --method PUT repos/dasheck0/skills/contents/README.md \
  --field message="docs(readme): add <skill-name> to skill table" \
  --field content="$NEW_CONTENT" \
  --field sha="$README_SHA" \
  --field branch="master"
```

### Step 5: Confirm to user

```
📄  README.md updated: added <skill-name> to the "Vorhandene Skills" table.
    → https://github.com/dasheck0/skills/blob/master/README.md
```

> **Skip this phase entirely** if no new skills were pushed (only updates to existing skills). Existing skill updates do not require README changes.

---

## Phase 6: Cleanup & Summary

After all skills are processed:

```bash
rm -rf "$TMPDIR"
```

Show a final summary:

```
✅ Push complete

Pushed:
  • architecture-interview  → https://github.com/dasheck0/skills/tree/master/skills/architecture-interview
  • skill-installer          → https://github.com/dasheck0/skills/tree/master/skills/skill-installer

Skipped (no changes):
  • skill-updater

Skipped (user declined):
  • (none)

🔗 View on GitHub: https://github.com/dasheck0/skills
```

---

## Error Handling

| Situation | Action |
|-----------|--------|
| No skills found locally | Show install instructions and suggest `skill-installer` |
| Repo not accessible after auth | "Cannot access https://github.com/dasheck0/skills — check your GitHub account has write access to this private repo" |
| Push rejected (non-fast-forward) | Show clear error with pull/force options (see Phase 4) |
| `git` not installed | "git is required. Install it with `brew install git` (macOS) or `sudo apt install git` (Linux)" |
| Local skill path not readable | Show exact path and suggest checking permissions |
| Commit fails (nothing staged) | "No changes detected between local and remote — nothing to commit." |
| User cancels all skills | "No skills were pushed. Run this skill again whenever you're ready." |
| README update fails (API error) | Warn the user: "Skill was pushed successfully, but README.md could not be updated automatically. Please add the skill manually to the ## Vorhandene Skills table." |
| README SHA mismatch on update | Fetch the latest SHA and retry the PUT request once before showing an error. |
