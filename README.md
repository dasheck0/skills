# dasheck0 AI Skills Library

Persönliche Sammlung wiederverwendbarer Skills für AI-Coding-Assistenten (opencode, Claude Code, etc.) – kuratiert und für alle meine Projekte zugänglich.

## Was ist ein Skill?

Ein Skill ist eine Markdown-Datei (`SKILL.md`), die einem AI-Assistenten domänenspezifische Anweisungen, Workflows und Kontext gibt. Skills werden lokal in ein Projekt (oder global) eingespielt und vom Assistenten bei passenden Aufgaben automatisch geladen.

Jeder Skill kann zusätzlich mitbringen:
- **`scripts/`** – ausführbare Hilfsskripte (Node.js, Bash, etc.)
- **`evals/`** – Eval-Konfigurationen zum Testen des Skills
- **`rules/`** – ausgelagerte Regelwerke, die `SKILL.md` referenziert

---

## Skills verwenden

### Einen Skill installieren

Am einfachsten über den mitgelieferten `skill-installer` Skill (interviewt dich nach Environment + Scope und installiert automatisch).

Manuell per `git sparse-checkout` (holt nur den gewünschten Ordner):

```bash
# Temporäres Verzeichnis anlegen
git clone --no-checkout --depth=1 git@github.com:dasheck0/skills.git /tmp/dasheck0-skills
cd /tmp/dasheck0-skills

# Nur den gewünschten Skill auschecken
git sparse-checkout init --cone
git sparse-checkout set skills/<skill-name>
git checkout

# Skill ins Projekt kopieren (oder global)
cp -r skills/<skill-name> ~/.config/opencode/skills/
# oder projekt-lokal:
cp -r skills/<skill-name> /pfad/zu/deinem/projekt/.opencode/skills/
```

Alternativ einfach den Ordner `skills/<skill-name>/` aus diesem Repo manuell kopieren:

```
~/.config/opencode/skills/
└── <skill-name>/
    ├── SKILL.md
    └── scripts/   # falls vorhanden
```

### Einen Skill aktivieren

Nach dem Kopieren muss der Skill in der jeweiligen AI-Tool-Konfiguration registriert sein. In der Regel reicht es, die `SKILL.md` im Skills-Verzeichnis (`~/.config/opencode/skills/` bzw. `~/.claude/skills/`) zu haben.

---

## Skills beisteuern

### Neuen Skill anlegen

```
skills/
└── dein-skill-name/       # kebab-case
    ├── SKILL.md            # Pflicht
    ├── scripts/            # Optional: Hilfsskripte
    ├── evals/              # Optional: Eval-Configs
    ├── rules/              # Optional: ausgelagerte Regeln
    └── LICENSE.txt         # Optional
```

**Naming:** Skill-Verzeichnisse immer in `kebab-case`, ohne Präfix.

### SKILL.md Aufbau

Jede `SKILL.md` beginnt mit einem YAML-Frontmatter-Block:

```yaml
---
name: dein-skill-name
description: >
  Text, der beschreibt wann dieser Skill ausgelöst werden soll. Dieser Text wird
  vom AI-Assistenten genutzt, um den Skill automatisch zu erkennen und zu laden.
  Trigger-Phrasen (deutsch + englisch) hier mit aufführen.
license: MIT
metadata:
  author: dasheck0
  version: '1.0.0'
---
```

Danach folgt der eigentliche Skill-Inhalt in Markdown: Anweisungen, Workflows, Beispiele, Referenzen.

#### Frontmatter-Felder

| Feld | Pflicht | Beschreibung |
|------|---------|--------------|
| `name` | ✅ | Eindeutiger Bezeichner, muss dem Verzeichnisnamen entsprechen |
| `description` | ✅ | Wann soll der Skill ausgelöst werden? Je konkreter, desto besser |
| `license` | – | Lizenz (z.B. `MIT`) |
| `metadata.author` | – | Ersteller des Skills |
| `metadata.version` | – | Semver-Version |

### Was macht einen guten Skill aus?

- **Klare `description`**: Der Assistent entscheidet anhand der Description, ob der Skill relevant ist. Konkrete Trigger-Phrasen (auch umgangssprachlich, deutsch + englisch) erhöhen die Trefferquote erheblich.
- **Fokus**: Ein Skill löst genau ein Problem. Lieber zwei kleine als einen großen.
- **Reproduzierbar**: Der Skill sollte deterministisch sein – gleicher Input, gleicher Output.
- **Eigenständig**: Keine Abhängigkeiten zu anderen Skills voraussetzen, die nicht im Repo liegen.

### Skill einreichen / aktualisieren

Am einfachsten über den mitgelieferten `skill-updater` Skill (erkennt lokal installierte Skills, zeigt Diff zum Remote, pusht nach Bestätigung und aktualisiert diese README automatisch bei neuen Skills).

Manuell:
1. Feature-Branch anlegen: `git checkout -b skill/dein-skill-name`
2. Skill unter `skills/dein-skill-name/` anlegen
3. Lokal testen
4. Pull Request gegen `master` öffnen

---

## Vorhandene Skills

| Skill | Verzeichnis | Beschreibung |
|-------|-------------|-------------|
| **skill-installer** | `skills/skill-installer/` | Installiert und aktualisiert Skills aus diesem Repo auf die lokale Maschine. Unterstützt opencode und Claude Code, global und project-local, mit automatischer Umgebungserkennung, Auth-Check und Update-Detection. |
| **skill-updater** | `skills/skill-updater/` | Pusht einen lokal installierten Skill zurück in dieses Repo. Unterstützt neue Skill-Beiträge und Updates bestehender Skills – mit Diff-Vorschau, automatischer README-Aktualisierung bei neuen Skills und Auth-Check. |
| **architecture-interview** | `skills/architecture-interview/` | Interviewt Schritt für Schritt (mit nummerierten Fragen + lettered Antwortoptionen + plain-language Erklärung für Nicht-Techniker) und leitet daraus ein projektspezifisches Architektur-Guidelines-Dokument ab. Erkennt den Tech-Stack automatisch und überspringt irrelevante Fragen-Domänen. Fragt in Batches ("Passes") mit Empfehlung, ob der nächste Pass sinnvoll ist. |

---

## Verzeichnisstruktur

```
skills/
├── skills/                  # Alle Skills
│   └── <skill-name>/
│       ├── SKILL.md         # Skill-Definition (Pflicht)
│       ├── scripts/         # Hilfsskripte (optional)
│       ├── evals/           # Eval-Configs (optional)
│       └── rules/           # Ausgelagerte Regeln (optional)
└── README.md
```
