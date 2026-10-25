import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CLI = fileURLToPath(new URL('../bin/cli.js', import.meta.url));
let cwd;

const run = (...args) =>
  spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: 'utf8' });
const exists = (p) => fs.existsSync(path.join(cwd, p));
const read = (p) => fs.readFileSync(path.join(cwd, p), 'utf8');

beforeEach(() => {
  cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'reactsmith-'));
});
afterEach(() => {
  fs.rmSync(cwd, { recursive: true, force: true });
});

test('creates JSX component, test and index by default', () => {
  const r = run('Button');
  assert.equal(r.status, 0, r.stderr);
  assert.ok(exists('src/components/Button/Button.jsx'));
  assert.ok(exists('src/components/Button/Button.test.jsx'));
  assert.ok(exists('src/components/Button/index.js'));
  assert.doesNotMatch(read('src/components/Button/Button.jsx'), /import React/);
});

test('converts names to PascalCase and accepts several names', () => {
  assert.equal(run('user-card', 'nav_bar').status, 0);
  assert.ok(exists('src/components/UserCard/UserCard.jsx'));
  assert.ok(exists('src/components/NavBar/NavBar.jsx'));
});

test('auto-detects TypeScript from tsconfig.json', () => {
  fs.writeFileSync(path.join(cwd, 'tsconfig.json'), '{}');
  assert.equal(run('Card').status, 0);
  assert.ok(exists('src/components/Card/Card.tsx'));
  assert.ok(exists('src/components/Card/index.ts'));
  assert.match(read('src/components/Card/Card.tsx'), /type CardProps/);
});

test('--css adds a CSS module and imports it', () => {
  assert.equal(run('Box', '--css').status, 0);
  assert.ok(exists('src/components/Box/Box.module.css'));
  assert.match(read('src/components/Box/Box.jsx'), /import styles from '\.\/Box\.module\.css'/);
});

test('--path and --no-index are respected', () => {
  assert.equal(run('Modal', '--path', 'src/ui', '--no-index').status, 0);
  assert.ok(exists('src/ui/Modal/Modal.jsx'));
  assert.ok(!exists('src/ui/Modal/index.js'));
});

test('uses Jest imports when the project depends on jest', () => {
  fs.writeFileSync(
    path.join(cwd, 'package.json'),
    JSON.stringify({ devDependencies: { jest: '^30.0.0' } })
  );
  assert.equal(run('Alert').status, 0);
  assert.doesNotMatch(read('src/components/Alert/Alert.test.jsx'), /from 'vitest'/);
});

test('refuses to overwrite without --force', () => {
  run('Button');
  const r = run('Button');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /already exists/);
  assert.equal(run('Button', '--force').status, 0);
});

test('rejects invalid names', () => {
  assert.equal(run('123abc').status, 1);
});

test('--version prints the package version', () => {
  const { version } = JSON.parse(
    fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')
  );
  assert.equal(run('--version').stdout.trim(), version);
});
