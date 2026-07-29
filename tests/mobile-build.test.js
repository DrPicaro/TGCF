import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

 test('builds a self-contained mobile web bundle', () => {
  execFileSync(process.execPath, ['scripts/build-web.js'], { cwd: root, stdio: 'pipe' });

  for (const relativePath of [
    'index.html',
    'styles/main.css',
    'src/app.js',
    'src/calculator.js',
    'src/data/annex-ii.json',
    'assets/logo-mcf.png',
  ]) {
    assert.equal(existsSync(path.join(dist, relativePath)), true, relativePath);
  }

  const html = readFileSync(path.join(dist, 'index.html'), 'utf8');
  assert.match(html, /src\/app\.js\?v=8/);
  assert.match(html, /assets\/logo-mcf\.png/);
});
