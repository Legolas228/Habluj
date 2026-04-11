/* @vitest-environment node */

import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC_DIR = path.resolve(process.cwd(), 'src');
const ICON_REGISTRY_PATH = path.resolve(SRC_DIR, 'components', 'IconRegistry.js');

const SOURCE_EXTENSIONS = new Set(['.js', '.jsx']);

function walkSourceFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkSourceFiles(fullPath, files);
      continue;
    }

    if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function collectUsedIcons(files) {
  const usage = new Map();
  const patterns = [
    /<Icon[^>]*\bname="([A-Za-z0-9]+)"/g,
    /<Icon[^>]*\bname=\{[^}]*'([A-Za-z0-9]+)'[^}]*\}/g,
    /<Button[^>]*\biconName="([A-Za-z0-9]+)"/g,
    /\bicon\s*:\s*['"]([A-Za-z0-9]+)['"]/g,
  ];

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const pattern of patterns) {
      let match = pattern.exec(content);
      while (match) {
        const iconName = match[1];
        if (!usage.has(iconName)) {
          usage.set(iconName, new Set());
        }
        usage.get(iconName).add(path.relative(process.cwd(), filePath));
        match = pattern.exec(content);
      }
      pattern.lastIndex = 0;
    }
  }

  return usage;
}

function collectRegisteredIcons(iconRegistryPath) {
  const content = fs.readFileSync(iconRegistryPath, 'utf8');
  const registered = new Set();
  let insideRegistryObject = false;

  for (const line of content.split(/\r?\n/)) {
    if (line.includes('export const IconRegistry = {')) {
      insideRegistryObject = true;
      continue;
    }

    if (insideRegistryObject && line.includes('};')) {
      break;
    }

    if (!insideRegistryObject) {
      continue;
    }

    const iconKeyMatch = line.match(/^\s*([A-Za-z0-9]+),?\s*$/);
    if (iconKeyMatch) {
      registered.add(iconKeyMatch[1]);
    }
  }

  return registered;
}

describe('Icon registry coverage', () => {
  it('registers every icon name used across src', () => {
    const files = walkSourceFiles(SRC_DIR);
    const iconUsage = collectUsedIcons(files);
    const registeredIcons = collectRegisteredIcons(ICON_REGISTRY_PATH);

    const missing = [...iconUsage.keys()]
      .filter((iconName) => !registeredIcons.has(iconName))
      .sort();

    const details = missing
      .map((iconName) => `${iconName} -> ${[...iconUsage.get(iconName)].sort().join(', ')}`)
      .join('\n');

    expect(missing, `Missing icons in IconRegistry:\n${details}`).toEqual([]);
  });
});
