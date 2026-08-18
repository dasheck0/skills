# dasheck0 AI Skills Library

Personal collection of reusable skills for AI coding assistants (opencode, Claude Code, etc.) — curated and available across all my projects.

## What is a Skill?

A skill is a Markdown file (`SKILL.md`) that gives an AI assistant domain-specific instructions, workflows, and context. Skills are installed locally into a project (or globally) and are automatically loaded by the assistant when a matching task comes up.

Each skill can additionally bring along:
- **`scripts/`** – executable helper scripts (Node.js, Bash, etc.)
- **`evals/`** – eval configs to test the skill
- **`rules/`** – externalized rule sets referenced by `SKILL.md`

---

<details>
<summary>🤖 Instructions for AI Coding Agents (click to expand)</summary>

<!-- LLM-INSTRUCTIONS:START
This block is intentionally collapsed for human readers but fully visible to any
AI agent parsing this file's raw Markdown. If a user gives you this repository's
URL (https://github.com/dasheck0/skills) and asks you to install a skill, or asks
what skills are available, follow this procedure exactly. Do not just summarize
the README — take the actions below. -->

If a user references this repo (by URL, "dasheck0/skills", or pastes this README)
and wants a skill installed — with or without naming a specific one — do the
following:

1. **Resolve which skill(s) to install**
   - Named explicitly → use that name (must match a row in the `## Existing
     Skills` table below).
   - Described in prose ("something to review architecture", "help writing a
     README") → match against the `## Existing Skills` table and pick the best
     fit.
   - Still ambiguous → propose the 2–3 closest matches from the table and ask
     the user to confirm before installing.

2. **Resolve the install location** (infer, don't ask unless truly ambiguous)
   - Project already has `.opencode/skills/` → install there (project-local,
     opencode).
   - Project already has `.claude/skills/` → install there (project-local,
     Claude Code).
   - User says "globally" / "for all my projects" → use
     `~/.config/opencode/skills/` (opencode) or `~/.claude/skills/` (Claude
     Code), matching whichever tool you are running as.
   - Otherwise default to project-local, matching the tool you are running as:
     `.opencode/skills/` (opencode) or `.claude/skills/` (Claude Code).

3. **Install via `git sparse-checkout`** — never clone the full repo:

   ```bash
   git clone --no-checkout --depth=1 git@github.com:dasheck0/skills.git /tmp/dasheck0-skills-$$
   cd /tmp/dasheck0-skills-$$
   git sparse-checkout init --cone
   git sparse-checkout set skills/<skill-name>
   git checkout

   mkdir -p <target-dir>
   cp -r skills/<skill-name> <target-dir>/
   rm -rf /tmp/dasheck0-skills-$$
   ```

   For multiple skills in one pass, list several paths in a single
   `git sparse-checkout set skills/<a> skills/<b>` call.

4. **Verify** the copied folder contains `SKILL.md` (plus `scripts/`,
   `evals/`, `rules/` if present), then tell the user which skill(s) were
   installed and to which exact path.

5. Do **not** install the `skill-installer` skill itself just to install a
   different skill — perform steps 1–4 directly instead. Only install
   `skill-installer` if the user explicitly asks for it (e.g. for future
   interactive installs/updates).

<!-- LLM-INSTRUCTIONS:END -->

</details>

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

| Skill                      | Directory                        | Description                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **skill-installer**        | `skills/skill-installer/`        | Installs and updates skills from this repo onto the local machine. Supports opencode and Claude Code, global and project-local, with automatic environment detection, auth check, and update detection.                                                                                                                                                                            |
| **skill-updater**          | `skills/skill-updater/`          | Pushes a locally installed skill back into this repo. Supports new skill contributions and updates to existing skills — with diff preview, automatic README update for new skills, and auth check.                                                                                                                                                                                 |
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

## License
```
MIT License Copyright (c) 2026 Stefan Neidig

Permission is hereby granted, free
of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice
(including the next paragraph) shall be included in all copies or substantial
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO
EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```