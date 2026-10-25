#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import * as t from '../templates/index.js';

const { version } = createRequire(import.meta.url)('../package.json');

const HELP = `
reactsmith v${version}

Usage:
  reactsmith <ComponentName...> [options]
  rcc <ComponentName...> [options]

Options:
  --path <dir>      Where to create components   (default: src/components)
  --ts              Generate .tsx files           (auto-detected from tsconfig.json)
  --js              Force .jsx files
  --css             Add a CSS module (Name.module.css)
  --no-index        Skip the index barrel file
  --runner <name>   vitest | jest                 (auto-detected from package.json)
  --force           Overwrite existing folder
  -v, --version     Show version
  -h, --help        Show this help

Examples:
  rcc Button
  rcc Header Footer --css
  rcc user-card --path src/features/profile
`;

function parseArgs(argv) {
  const opts = { names: [], path: 'src/components', index: true, css: false, force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') opts.help = true;
    else if (a === '-v' || a === '--version') opts.version = true;
    else if (a === '--path') opts.path = argv[++i];
    else if (a === '--ts') opts.ts = true;
    else if (a === '--js') opts.ts = false;
    else if (a === '--css') opts.css = true;
    else if (a === '--no-index') opts.index = false;
    else if (a === '--runner') opts.testRunner = argv[++i];
    else if (a === '--force') opts.force = true;
    else if (a.startsWith('-')) fail(`Unknown option: ${a}`);
    else opts.names.push(a);
  }
  return opts;
}

// "user-card" | "user_card" | "userCard" -> "UserCard"
function toPascal(str) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^./, (c) => c.toUpperCase());
}

function detectRunner(cwd) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps.vitest) return 'vitest';
    if (deps.jest) return 'jest';
  } catch {}
  return 'vitest';
}

function fail(msg) {
  console.error(`\x1b[31m✖ ${msg}\x1b[0m`);
  process.exit(1);
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.version) {
    console.log(version);
    process.exit(0);
  }
  if (opts.help || opts.names.length === 0) {
    console.log(HELP);
    process.exit(opts.help ? 0 : 1);
  }

  const cwd = process.cwd();
  const ts = opts.ts ?? fs.existsSync(path.join(cwd, 'tsconfig.json'));
  const testRunner = opts.testRunner ?? detectRunner(cwd);
  const ext = ts ? 'tsx' : 'jsx';

  for (const raw of opts.names) {
    const name = toPascal(raw);
    if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) fail(`Invalid component name: "${raw}"`);

    const dir = path.resolve(cwd, opts.path, name);
    if (fs.existsSync(dir) && !opts.force) {
      fail(`${path.relative(cwd, dir)} already exists (use --force to overwrite)`);
    }
    fs.mkdirSync(dir, { recursive: true });

    const ctx = { name, ts, css: opts.css, testRunner };
    const files = {
      [`${name}.${ext}`]: t.component(ctx),
      [`${name}.test.${ext}`]: t.test(ctx),
    };
    if (opts.index) files[`index.${ts ? 'ts' : 'js'}`] = t.index(ctx);
    if (opts.css) files[`${name}.module.css`] = t.style(ctx);

    for (const [file, content] of Object.entries(files)) {
      fs.writeFileSync(path.join(dir, file), content);
      console.log(`\x1b[32m✔\x1b[0m ${path.relative(cwd, path.join(dir, file))}`);
    }
  }
}

main();
