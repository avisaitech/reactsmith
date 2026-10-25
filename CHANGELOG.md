# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0] - 2026-10-24

### Added

- `reactsmith` / `rcc` command to scaffold a component folder with a component, a React Testing Library test and an index barrel.
- React 19 templates: automatic JSX runtime, plain function components.
- TypeScript output, auto-detected from `tsconfig.json` (`--ts` / `--js` to force).
- Vitest or Jest test imports, auto-detected from `package.json` (`--runner` to force).
- Options: `--path`, `--css`, `--no-index`, `--force`, `--version`, `--help`.
- PascalCase conversion of names (`user-card` becomes `UserCard`) and multiple names per command.

[Unreleased]: https://github.com/avistech/reactsmith/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/avistech/reactsmith/releases/tag/v1.0.0
