import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import Icon from '../components/AppIcon';
import { IconRegistry } from '../components/IconRegistry';

const SRC_DIR = path.resolve(process.cwd(), 'src');
const SOURCE_EXTENSIONS = new Set(['.js', '.jsx']);

function walkSourceFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'test') continue;
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
  const usage = new Set();
  const patterns = [
    /<Icon[^>]*\bname="([A-Za-z0-9]+)"/g,
    /<Icon[^>]*\bname=\{[^}]*'([A-Za-z0-9]+)'[^}]*\}/g,
    /<Button[^>]*\biconName="([A-Za-z0-9]+)"/g,
    /\bicon\s*:\s*['"]([A-Za-z0-9]+)['"]/g,
  ];

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8');
    patterns.forEach((pattern) => {
      let match = pattern.exec(content);
      while (match) {
        usage.add(match[1]);
        match = pattern.exec(content);
      }
      pattern.lastIndex = 0;
    });
  }

  return [...usage].sort();
}

describe('Icon rendering guardrails', () => {
  it('renders every used icon with its expected lucide class', () => {
    const sourceFiles = walkSourceFiles(SRC_DIR);
    const usedIcons = collectUsedIcons(sourceFiles);

    const missingFromRegistry = usedIcons.filter((iconName) => !IconRegistry[iconName]);
    expect(missingFromRegistry, `Missing icons in IconRegistry: ${missingFromRegistry.join(', ')}`).toEqual([]);

    usedIcons.forEach((iconName) => {
      const RegistryIcon = IconRegistry[iconName];
      const renderedFromAppIcon = render(<Icon name={iconName} size={18} />);
      const renderedFromRegistry = render(<RegistryIcon size={18} />);

      const appIconSvg = renderedFromAppIcon.container.querySelector('svg');
      const registrySvg = renderedFromRegistry.container.querySelector('svg');

      expect(appIconSvg, `Icon ${iconName} did not render an svg element`).toBeTruthy();
      expect(registrySvg, `Registry icon ${iconName} did not render an svg element`).toBeTruthy();

      const appIconClass = appIconSvg?.className?.baseVal || appIconSvg?.className || '';
      const registryClass = registrySvg?.className?.baseVal || registrySvg?.className || '';

      expect(appIconClass).toContain('lucide');
      expect(appIconClass).toContain(registryClass.replace('lucide ', ''));

      renderedFromAppIcon.unmount();
      renderedFromRegistry.unmount();
    });
  });
});
