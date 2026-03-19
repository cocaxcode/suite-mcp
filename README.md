<p align="center">
  <h1 align="center">@cocaxcode/suite-mcp</h1>
  <p align="center">
    <strong>All cocaxcode MCP servers. One command.</strong><br/>
    4 MCPs · 70+ tools · Zero config · Any AI tool.
  </p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@cocaxcode/suite-mcp"><img src="https://img.shields.io/npm/v/@cocaxcode/suite-mcp.svg?color=cb3837" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@cocaxcode/suite-mcp"><img src="https://img.shields.io/npm/dm/@cocaxcode/suite-mcp.svg" alt="npm downloads" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D20-green?logo=node.js" alt="Node >= 20" />
  <img src="https://img.shields.io/badge/MCPs-4-blueviolet" alt="4 MCPs" />
  <img src="https://img.shields.io/badge/tests-52-brightgreen" alt="52 tests" />
</p>

<p align="center">
  <a href="#what-is-this">What is this</a> ·
  <a href="#whats-included">What's included</a> ·
  <a href="#installation">Installation</a> ·
  <a href="#usage">Usage</a> ·
  <a href="#supported-ai-tools">Supported AI tools</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#contributing">Contributing</a>
</p>

---

## What is this?

Installing MCP servers one by one is tedious. Each tool has its own npm package, its own config format, and some need special flags. You end up copy-pasting JSON configs or running 4+ separate commands.

**suite-mcp** fixes that. One command installs all cocaxcode MCP servers in your AI tool. It detects your tool, asks which MCPs you want, and writes the correct config.

```bash
npx @cocaxcode/suite-mcp install
```

That's it. All 4 MCPs configured and ready.

## What's included

suite-mcp bundles **4 production-ready MCP servers** with **70+ tools** total:

| MCP | Tools | What it does |
|-----|:-----:|-------------|
| [**api-testing**](https://www.npmjs.com/package/@cocaxcode/api-testing-mcp) | 35 | HTTP testing, assertions, flows, OpenAPI import, mock data, load testing, Postman import/export |
| [**database**](https://www.npmjs.com/package/@cocaxcode/database-mcp) | 26 | PostgreSQL, MySQL, SQLite management with rollback snapshots, schema introspection, dump/restore |
| [**logbook**](https://www.npmjs.com/package/@cocaxcode/logbook-mcp) | 9 | Developer logbook with notes, TODOs, code TODO scanning, full-text search |
| [**ai-context-inspector**](https://www.npmjs.com/package/@cocaxcode/ai-context-inspector) | 5 | Scan, export, and import your AI ecosystem across 7 tools |

Each MCP is independently published on npm and can be installed separately. suite-mcp just makes installing all of them effortless.

## Installation

### Quick start (recommended)

```bash
npx @cocaxcode/suite-mcp install
```

The CLI will:
1. Detect your AI tool (Claude, Cursor, Windsurf, etc.)
2. Show which MCPs are available
3. Ask which ones to install
4. Write the correct config

### Install all without prompts

```bash
npx @cocaxcode/suite-mcp install --all
```

### Force a specific AI tool

```bash
npx @cocaxcode/suite-mcp install --target cursor
npx @cocaxcode/suite-mcp install --target gemini --all
```

## Usage

### Install MCPs

```bash
# Interactive — choose which MCPs to install
npx @cocaxcode/suite-mcp install

# Install all at once
npx @cocaxcode/suite-mcp install --all

# Force target tool
npx @cocaxcode/suite-mcp install --target cursor --all
```

If an MCP is already installed, it gets skipped automatically. Only missing MCPs are added.

### Check status

```bash
npx @cocaxcode/suite-mcp list
```

```
@cocaxcode/suite-mcp — MCPs disponibles (claude)

  Estado  MCP                   Descripcion
  ✓       api-testing           Testing de APIs con collections, assertions y flows
  ✓       database              Gestion de PostgreSQL, MySQL y SQLite
  ✗       logbook               Logbook de desarrollo con notas y TODOs
  ✗       ai-context-inspector  Scanner y migrador de ecosistema AI

  2/4 instalados
```

### Remove MCPs

```bash
npx @cocaxcode/suite-mcp remove
```

Shows only installed MCPs and asks which to remove. Enter without selection cancels.

### All commands

| Command | Description |
|---------|-------------|
| `install` | Install MCPs in your AI tool config |
| `remove` | Remove installed MCPs |
| `list` | Show installation status |

| Flag | Description |
|------|-------------|
| `--target <tool>` | Force AI tool (claude, cursor, windsurf, copilot, gemini, codex, opencode) |
| `--all` | Install all MCPs without prompting |
| `--version` | Show version |

## Supported AI tools

suite-mcp auto-detects your AI tool by scanning for marker files in the current directory. All 7 major tools are supported:

| Tool | Config file | Format |
|------|------------|--------|
| **Claude Code** | `.mcp.json` | flat |
| **Cursor** | `.cursor/mcp.json` | flat |
| **Windsurf** | `.mcp.json` | flat |
| **GitHub Copilot** | `.vscode/mcp.json` | flat |
| **Gemini CLI** | `.gemini/settings.json` | nested |
| **Codex CLI** | `.mcp.json` | flat |
| **OpenCode** | `opencode.json` | nested |

If no tool is detected, the CLI asks which one to configure. Use `--target` to skip detection.

## What it does NOT do

- **It doesn't run MCP servers.** It only writes config files. Each MCP runs independently via npx.
- **It doesn't manage versions.** All MCPs install with `@latest`. To update, just re-run install.
- **It doesn't bundle MCPs.** Each MCP stays independent with its own lifecycle and storage.
- **It doesn't touch non-cocaxcode MCPs.** Your existing MCP configs are preserved (merge, never overwrite).

## Architecture

Built for safety and simplicity:

- **Zero runtime dependencies** — only Node.js built-ins (readline, fs, crypto)
- **Atomic writes** — write-to-temp-then-rename prevents config corruption
- **Path traversal protection** — validates all file paths stay inside the working directory
- **JSON type validation** — handles malformed config files gracefully
- **Merge, never overwrite** — preserves existing MCP configs from other sources
- **52 tests** — covering config I/O, detection, parsing, and security edge cases

```
src/
├── index.ts       # CLI entry point and arg parsing
├── types.ts       # TypeScript interfaces
├── registry.ts    # MCP catalog
├── config.ts      # Config read/write with atomic operations
├── detect.ts      # AI tool auto-detection
├── prompts.ts     # Interactive readline prompts
├── install.ts     # Install subcommand
├── remove.ts      # Remove subcommand
├── list.ts        # List subcommand
└── __tests__/     # 52 tests across 5 files
```

**Stack:** TypeScript · ESM · tsup · Vitest · Node >= 20

## Contributing

```bash
git clone https://github.com/cocaxcode/suite-mcp.git
cd suite-mcp
npm install
npm test            # 52 tests
npm run build       # ESM bundle
npm run typecheck   # TypeScript check
```

### How to contribute

1. **Bug reports** — open an issue with steps to reproduce
2. **Feature requests** — describe your use case
3. **Pull requests** — fork, add tests, ensure all tests pass

## License

[MIT](./LICENSE) — built by [cocaxcode](https://github.com/cocaxcode)
