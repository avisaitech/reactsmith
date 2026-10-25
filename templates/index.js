// Each template receives { name, ts, css, testRunner } and returns file contents.

export const component = ({ name, ts, css }) => {
  const styleImport = css ? `import styles from './${name}.module.css';\n\n` : '';
  const props = ts
    ? `type ${name}Props = {
  children?: React.ReactNode;
};

export default function ${name}({ children }: ${name}Props) {`
    : `export default function ${name}({ children }) {`;
  const className = css ? ` className={styles.root}` : '';

  const typeImport = ts ? `import type React from 'react';\n${css ? '' : '\n'}` : '';

  return `${typeImport}${styleImport}${props}
  return (
    <div${className} data-testid="${kebab(name)}">
      {children ?? '${name} component'}
    </div>
  );
}
`;
};

export const test = ({ name, testRunner }) => {
  const runnerImport =
    testRunner === 'vitest'
      ? "import { describe, it, expect } from 'vitest';\n"
      : '';

  return `${runnerImport}import { render, screen } from '@testing-library/react';
import ${name} from './${name}';

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name} />);
    expect(screen.getByTestId('${kebab(name)}')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<${name}>Hello</${name}>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
`;
};

export const index = ({ name }) => `export { default } from './${name}';\n`;

export const style = () => `.root {\n}\n`;

export function kebab(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}
