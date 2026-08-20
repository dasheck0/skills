---
name: skill-installer
description: >
  Installs or updates AI skills from dasheck0/skills through the Vercel Skills CLI.
  Use this skill whenever the user wants to install, update, add, or sync skills from
  their personal skills library — including "installier mir meine skills", "install my
  skills", "welche skills gibt es in meinem repo", "update my skills", "hol mir den
  architecture-interview skill", or "install all skills globally". Trigger proactively
  when the user mentions their skills repo, personal skill library, or dasheck0/skills.
license: MIT
metadata:
  author: dasheck0
  version: '1.1.0'
---

# Skill Installer

Install and manage skills from `dasheck0/skills` exclusively through the Vercel
Skills CLI. Do not use `git clone`, `git sparse-checkout`, SSH, `gh`, or manual
file copying for installation.

## Source

Always use this source identifier:

```bash
dasheck0/skills
```

## Install a skill

If the user names one or more skills, install those names directly:

```bash
npx skills@latest add dasheck0/skills --skill=<skill-name>
```

If the user requests all skills, use:

```bash
npx skills@latest add dasheck0/skills --all
```

If no skill is named, list the available skills first and present the relevant
choices to the user:

```bash
npx skills@latest add dasheck0/skills --list
```

## Installation options

Add options only when they match the user's request:

| Request | Option |
| --- | --- |
| Install globally | `--global` |
| Target one or more agents | `--agent <agent>` |
| Install without prompts | `--yes` |
| Copy files instead of symlinking | `--copy` |
| Install every skill for every agent | `--all` |

Examples:

```bash
npx skills@latest add dasheck0/skills --skill=architecture-interview --agent=opencode
npx skills@latest add dasheck0/skills --skill=architecture-interview --global --yes
```

## Update and manage installed skills

Use the Skills CLI lifecycle commands after installation:

```bash
npx skills@latest list
npx skills@latest update
npx skills@latest remove <skill-name>
npx skills@latest find <query>
```

## Verification

Read the CLI result. Report the installed skill names, selected agents or scope,
and any skipped or failed items. Do not claim an installation succeeded unless the
CLI completed successfully.

## Error handling

| Situation | Action |
| --- | --- |
| CLI is unavailable | Ask the user to install or make `npx` available; do not fall back to manual installation. |
| Repository or skill is inaccessible | Show the CLI error and verify the repository name and skill name. |
| User did not specify a skill | Run `--list`, then ask which available skill to install. |
| User needs a local-only preview | Use `npx skills@latest use dasheck0/skills@<skill-name> --agent <agent>`. |
