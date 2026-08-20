import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const skillsDirectory = join(process.cwd(), 'skills');
const namePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function getFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return match?.[1];
}

function getField(frontmatter, field) {
  return frontmatter.match(new RegExp(`^${field}:\\s*(.*)$`, 'm'))?.[1].trim();
}

function getDescription(frontmatter) {
  const match = frontmatter.match(/^description:\s*(.*)$/m);
  if (!match) {
    return undefined;
  }

  const initialValue = match[1].trim();
  if (!/^[>|][+-]?$/.test(initialValue)) {
    return initialValue;
  }

  const block = frontmatter.slice(match.index + match[0].length)
    .match(/^(?:\r?\n[ \t]+.*)*/)?.[0] ?? '';

  return block
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ');
}

async function validateSkill(directoryName) {
  const skillPath = join(skillsDirectory, directoryName, 'SKILL.md');
  const content = await readFile(skillPath, 'utf8');
  const frontmatter = getFrontmatter(content);

  if (!frontmatter) {
    throw new Error(`${directoryName}: SKILL.md must start with YAML frontmatter.`);
  }

  const name = getField(frontmatter, 'name');
  if (!name) {
    throw new Error(`${directoryName}: frontmatter must include name.`);
  }
  if (name !== directoryName) {
    throw new Error(`${directoryName}: name must match its directory (found ${name}).`);
  }
  if (name.length > 64 || !namePattern.test(name)) {
    throw new Error(`${directoryName}: name must use lowercase letters, numbers, and single hyphens (max 64 characters).`);
  }

  const description = getDescription(frontmatter);
  if (!description) {
    throw new Error(`${directoryName}: frontmatter must include a non-empty description.`);
  }
  if (description.length > 1024) {
    throw new Error(`${directoryName}: description must not exceed 1024 characters.`);
  }
}

const entries = await readdir(skillsDirectory, { withFileTypes: true });
const skillDirectories = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();

if (skillDirectories.length === 0) {
  throw new Error('No skill directories found in skills/.');
}

const validationResults = await Promise.allSettled(skillDirectories.map(validateSkill));
const errors = validationResults
  .filter((result) => result.status === 'rejected')
  .map((result) => result.reason.message);

if (errors.length > 0) {
  throw new Error(`Skill validation failed:\n- ${errors.join('\n- ')}`);
}

console.log(`Validated ${skillDirectories.length} skill(s) in skills/.`);
