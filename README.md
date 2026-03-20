<p align="center">
  <h1 align="center">@cocaxcode/suite-mcp</h1>
  <p align="center">
    <strong>All cocaxcode MCP servers. One command.</strong><br/>
    5 MCPs &middot; 100+ tools &middot; Zero config &middot; Any AI tool
  </p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@cocaxcode/suite-mcp"><img src="https://img.shields.io/npm/v/@cocaxcode/suite-mcp.svg?style=flat-square&color=cb3837" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@cocaxcode/suite-mcp"><img src="https://img.shields.io/npm/dm/@cocaxcode/suite-mcp.svg?style=flat-square" alt="npm downloads" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D20-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node >= 20" />
  <img src="https://img.shields.io/badge/MCPs-5-blueviolet?style=flat-square" alt="5 MCPs" />
  <img src="https://img.shields.io/badge/tests-52-brightgreen?style=flat-square" alt="52 tests" />
</p>

<p align="center">
  <a href="#what-is-this">What is this</a> &middot;
  <a href="#whats-included">What's included</a> &middot;
  <a href="#installation">Installation</a> &middot;
  <a href="#usage">Usage</a> &middot;
  <a href="#supported-ai-tools">Supported AI tools</a> &middot;
  <a href="#architecture">Architecture</a>
</p>

---

## What is this?

Installing MCP servers one by one is tedious. Each tool has its own npm package, its own config format, and some need special flags. You end up copy-pasting JSON configs or running 5+ separate commands.

**suite-mcp** fixes that. One command installs all cocaxcode MCP servers in your AI tool. It detects your tool, asks which MCPs you want, and writes the correct config.

```bash
npx @cocaxcode/suite-mcp install
```

That's it. All 5 MCPs configured and ready.

## What's included

suite-mcp bundles **5 production-ready MCP servers** with **100+ tools** total:

| MCP | Tools | What it does |
|-----|:-----:|-------------|
| [**api-testing**](https://www.npmjs.com/package/@cocaxcode/api-testing-mcp) | 35 | HTTP testing, assertions, flows, OpenAPI import, mock data, load testing, Postman import/export |
| [**database**](https://www.npmjs.com/package/@cocaxcode/database-mcp) | 26 | PostgreSQL, MySQL, SQLite management with rollback snapshots, schema introspection, dump/restore |
| [**devflow**](https://www.npmjs.com/package/@cocaxcode/devflow-mcp) | 32 | Connect Jira (Cloud + Server) with GitHub/GitLab, custom flows, configurable rules, multi-project |
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

> [!NOTE]
> If an MCP is already installed, it gets skipped automatically. Only missing MCPs are added.

### Check status

```bash
npx @cocaxcode/suite-mcp list
```

```
@cocaxcode/suite-mcp — Available MCPs (claude)

  Status  MCP                   Description
  ✓       api-testing           API testing with collections, assertions, and flows
  ✓       database              PostgreSQL, MySQL, and SQLite management
  ✓       devflow               Jira + GitHub/GitLab workflow automation
  ✗       logbook               Developer logbook with notes and TODOs
  ✗       ai-context-inspector  AI ecosystem scanner and migrator

  3/5 installed
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

> [!TIP]
> If no tool is detected, the CLI asks which one to configure. Use `--target` to skip detection.

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

**Stack:** TypeScript &middot; ESM &middot; tsup &middot; Vitest &middot; Node >= 20

---

[MIT](./LICENSE) &middot; Built by [cocaxcode](https://github.com/cocaxcode)
