# dasheck0 AI Skills Library

Personal collection of reusable skills for AI coding assistants (opencode, Claude Code, etc.) — curated and available across all my projects.

## What is a Skill?

A skill is a Markdown file (`SKILL.md`) that gives an AI assistant domain-specific instructions, workflows, and context. Skills are installed locally into a project (or globally) and are automatically loaded by the assistant when a matching task comes up.

Each skill can additionally bring along:
- **`scripts/`** – executable helper scripts (Node.js, Bash, etc.)
- **`evals/`** – eval configs to test the skill
- **`rules/`** – externalized rule sets referenced by `SKILL.md`

---

## Using Skills

### Installing a skill

The easiest way is via the bundled `skill-installer` skill (interviews you on environment + scope and installs automatically).

Manually via `git sparse-checkout` (fetches only the requested folder):

```bash
# Create a temp directory
git clone --no-checkout --depth=1 git@github.com:dasheck0/skills.git /tmp/dasheck0-skills
cd /tmp/dasheck0-skills

# Checkout only the desired skill
git sparse-checkout init --cone
git sparse-checkout set skills/<skill-name>
git checkout

# Copy the skill into your project (or globally)
cp -r skills/<skill-name> ~/.config/opencode/skills/
# or project-local:
cp -r skills/<skill-name> /path/to/your/project/.opencode/skills/
```

Alternatively, just copy the `skills/<skill-name>/` folder from this repo manually:

```
~/.config/opencode/skills/
└── <skill-name>/
    ├── SKILL.md
    └── scripts/   # if present
```

### Activating a skill

After copying, the skill must be registered in the respective AI tool's configuration. In most cases it's enough to have the `SKILL.md` in the skills directory (`~/.config/opencode/skills/` or `~/.claude/skills/`).

---

## Contributing Skills

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contribution workflow, skill structure conventions, and commit message rules.

**Quick summary:**
- Contribute via the bundled `skill-updater` skill (detects locally installed skills, shows a diff against remote, pushes on confirmation, and auto-updates this README for new skills).
- Or manually: branch, add `skills/<skill-name>/`, test locally, open a PR against `master`.
- **All commits must follow [Conventional Commits](https://www.conventionalcommits.org/)** (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, etc.) — no exceptions, including for AI-generated commits.

---

## Existing Skills

| Skill | Directory | Description |
|-------|-----------|-------------|
| **skill-installer** | `skills/skill-installer/` | Installs and updates skills from this repo onto the local machine. Supports opencode and Claude Code, global and project-local, with automatic environment detection, auth check, and update detection. |
| **skill-updater** | `skills/skill-updater/` | Pushes a locally installed skill back into this repo. Supports new skill contributions and updates to existing skills — with diff preview, automatic README update for new skills, and auth check. |
| **architecture-interview** | `skills/architecture-interview/` | Conducts a step-by-step interview (numbered questions + lettered answer options + plain-language explanations for non-technical stakeholders) and derives a project-specific architecture guidelines document from it. Auto-detects the tech stack and skips irrelevant question domains. Asks in batches ("passes") with a recommendation on whether the next pass is worthwhile. |

---

## Repository Structure

```
skills/
├── skills/                  # All skills
│   └── <skill-name>/
│       ├── SKILL.md         # Skill definition (required)
│       ├── scripts/         # Helper scripts (optional)
│       ├── evals/           # Eval configs (optional)
│       └── rules/           # Externalized rules (optional)
├── README.md
└── CONTRIBUTING.md
```
