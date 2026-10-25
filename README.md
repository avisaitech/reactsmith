# reactsmith

[![npm version](https://img.shields.io/npm/v/@avistech/reactsmith.svg)](https://www.npmjs.com/package/@avistech/reactsmith)
[![CI](https://github.com/avistech/reactsmith/actions/workflows/ci.yml/badge.svg)](https://github.com/avistech/reactsmith/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@avistech/reactsmith.svg)](./LICENSE)
[![node](https://img.shields.io/node/v/@avistech/reactsmith.svg)](https://nodejs.org)

> Forge React 19 components with tests from your terminal. Zero dependencies.

```bash
npx @avistech/reactsmith Button
```

```
src/components/Button/
├── Button.jsx
├── Button.test.jsx
└── index.js
```

## Features

- **One command, one folder** with the component, its test and an index barrel
- **React 19 ready**: no `import React`, plain function components, `ref` as a normal prop
- **Auto-detects TypeScript** (`tsconfig.json`) and your test runner (Vitest or Jest)
- **React Testing Library** tests that pass out of the box
- **Several components at once**: `rcc Header Footer Sidebar`
- **Safe by default**: never overwrites an existing folder unless you pass `--force`
- **Zero dependencies**, Node 18+

## Installation

Run without installing:

```bash
npx @avistech/reactsmith Button
```

Or install as a dev dependency so the whole team gets the same version:

```bash
npm install --save-dev @avistech/reactsmith
npx rcc Button
```

Or install globally:

```bash
npm install -g @avistech/reactsmith
rcc Button        # short alias
reactsmith Button # full name
```

## Usage

```bash
rcc <ComponentName...> [options]
```

| Option | Description | Default |
|---|---|---|
| `--path <dir>` | Folder to create components in | `src/components` |
| `--ts` / `--js` | Force TSX or JSX output | auto (looks for `tsconfig.json`) |
| `--css` | Add a CSS module (`Name.module.css`) | off |
| `--no-index` | Skip the `index` barrel file | off |
| `--runner <vitest\|jest>` | Test runner to write imports for | auto (reads `package.json`) |
| `--force` | Overwrite an existing component folder | off |
| `-v, --version` | Print the version | |
| `-h, --help` | Show help | |

### Examples

```bash
rcc Button                                  # src/components/Button
rcc user-card                               # names become PascalCase: UserCard
rcc Header Footer --css                     # two components, each with a CSS module
rcc ProfileCard --path src/features/profile # custom location
rcc Modal --ts                              # force TypeScript
```

Tip: add a script to your app's `package.json`:

```json
{
  "scripts": {
    "g": "rcc"
  }
}
```

Then run `npm run g Button`.

## Generated output

`Button.jsx`

```jsx
export default function Button({ children }) {
  return (
    <div data-testid="button">
      {children ?? 'Button component'}
    </div>
  );
}
```

`Button.test.jsx` (Vitest)

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders without crashing', () => {
    render(<Button />);
    expect(screen.getByTestId('button')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<Button>Hello</Button>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Test setup in your app (one time)

The generated tests use React Testing Library. With Vite + Vitest:

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

`vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
  },
});
```

`src/setupTests.js`

```js
import '@testing-library/jest-dom/vitest';
```

## Contributing

Issues and pull requests are welcome.

```bash
git clone https://github.com/avistech/reactsmith.git
cd reactsmith
npm test
npm link   # try your local copy as `rcc` in any project
```

Templates live in `templates/index.js`. Each export is a function that returns one file's contents.

## License

[MIT](./LICENSE) © avistech
