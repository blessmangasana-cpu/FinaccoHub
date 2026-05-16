import fs from 'fs';
import path from 'path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const ignoredDirs = new Set(['node_modules', '.git', 'data', 'logs']);
const files = [];

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        walk(path.join(dir, entry.name));
      }
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(path.join(dir, entry.name));
    }
  }
};

walk(root);

let failed = false;
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    failed = true;
    console.error(result.stderr || result.stdout);
  }
}

if (failed) {
  process.exit(1);
}

console.log(`Syntax check passed for ${files.length} JavaScript files.`);
