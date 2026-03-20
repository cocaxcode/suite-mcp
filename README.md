<p align="center">
  <h1 align="center">@cocaxcode/suite-mcp</h1>
  <p align="center">
    <strong>One command. Five MCP servers. Any AI tool.</strong><br/>
    Install 100+ tools into your AI coding assistant in under 10 seconds.
  </p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@cocaxcode/suite-mcp"><img src="https://img.shields.io/npm/v/@cocaxcode/suite-mcp.svg?style=flat-square&color=cb3837" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@cocaxcode/suite-mcp"><img src="https://img.shields.io/npm/dm/@cocaxcode/suite-mcp.svg?style=flat-square" alt="npm downloads" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D20-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node >= 20" />
  <img src="https://img.shields.io/badge/MCPs-5-blueviolet?style=flat-square" alt="5 MCPs" />
  <img src="https://img.shields.io/badge/tools-107-blue?style=flat-square" alt="107 tools" />
  <img src="https://img.shields.io/badge/tests-52-brightgreen?style=flat-square" alt="52 tests" />
</p>

<p align="center">
  <a href="#whats-included">What's included</a> &middot;
  <a href="#quick-start">Quick start</a> &middot;
  <a href="#usage">Usage</a> &middot;
  <a href="#supported-ai-tools">Supported AI tools</a> &middot;
  <a href="#what-it-does-not-do">Boundaries</a> &middot;
  <a href="#architecture">Architecture</a>
</p>

---

An interactive CLI installer that configures all five cocaxcode MCP servers in your AI tool of choice. It auto-detects your tool, lets you pick which MCPs to add, and writes directly to your **user-level global config** — merging with your existing setup, never overwriting it.

```bash
npx @cocaxcode/suite-mcp install
```

## What's included

| MCP | Tools | Description |
|-----|:-----:|-------------|
| [**api-testing**](https://www.npmjs.com/package/@cocaxcode/api-testing-mcp) | 35 | HTTP testing, collections, assertions, flows, OpenAPI import, mock data, load testing, Postman import/export |
| [**database**](https://www.npmjs.com/package/@cocaxcode/database-mcp) | 26 | PostgreSQL, MySQL, SQLite management with rollback snapshots, schema search, dump/restore |
| [**devflow**](https://www.npmjs.com/package/@cocaxcode/devflow-mcp) | 32 | Jira (Cloud + Server) + GitHub/GitLab integration, custom flows, configurable rules, multi-project |
| [**logbook**](https://www.npmjs.com/package/@cocaxcode/logbook-mcp) | 9 | Developer logbook with structured notes, TODOs, code scanning, full-text search |
| [**ai-context-inspector**](https://www.npmjs.com/package/@cocaxcode/ai-context-inspector) | 5 | Scan, export, and import your AI ecosystem config across 7 tools |

Each MCP is independently published on npm and works standalone. suite-mcp simply wires them all up at once.

## Quick start

```bash
npx @cocaxcode/suite-mcp install
```

The CLI detects your AI tool, shows available MCPs, and writes the config. Done.

To install everything without prompts:

```bash
npx @cocaxcode/suite-mcp install --all
```

## Usage

### Install

```bash
# Interactive — pick which MCPs to add
npx @cocaxcode/suite-mcp install

# All MCPs, no prompts
npx @cocaxcode/suite-mcp install --all

# Target a specific AI tool
npx @cocaxcode/suite-mcp install --target cursor
npx @cocaxcode/suite-mcp install --target gemini --all
```

> **Note:** Already-installed MCPs are skipped automatically. Only missing ones get added.

### List status

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

### Remove

```bash
npx @cocaxcode/suite-mcp remove
```

Shows only installed MCPs and lets you choose which to remove. Empty selection cancels.

### Command reference

| Command | Description |
|---------|-------------|
| `install` | Add MCPs to your AI tool config |
| `remove` | Remove installed MCPs |
| `list` | Show installation status |

| Flag | Description |
|------|-------------|
| `--target <tool>` | Force AI tool: `claude`, `cursor`, `windsurf`, `copilot`, `gemini`, `codex`, `opencode` |
| `--all` | Install all MCPs without prompting |
| `--version` | Show version |

## Supported AI tools

suite-mcp auto-detects your tool by scanning for marker files in the working directory, then installs MCPs into your **user-level global config** so they are available in every project.

| Tool | Global config file | Format |
|------|-------------------|--------|
| **Claude Code** | `~/.claude/settings.json` | nested |
| **Cursor** | `~/.cursor/mcp.json` | flat |
| **Windsurf** | `~/.codeium/windsurf/mcp_config.json` | nested |
| **Gemini CLI** | `~/.gemini/settings.json` | nested |
| **GitHub Copilot** | `.vscode/mcp.json` *(project-local)* | flat |
| **Codex CLI** | `.mcp.json` *(project-local)* | flat |
| **OpenCode** | `opencode.json` *(project-local)* | nested |

> **Tip:** If no tool is detected, the CLI prompts you to choose one. Use `--target` to skip detection entirely.

## What it does NOT do

- **Does not run MCP servers.** It only writes config files. Each MCP runs via `npx` at invocation time.
- **Does not manage versions.** MCPs install with `@latest`. Re-run `install` to pick up updates.
- **Does not bundle MCPs together.** Each server stays independent with its own lifecycle and data.
- **Does not touch non-cocaxcode entries.** Your existing MCP configs are preserved — merge, never overwrite.

## Architecture

<details>
<summary>Project structure</summary>

```
src/
├── index.ts       # CLI entry point and arg parsing
├── types.ts       # TypeScript interfaces
├── registry.ts    # MCP catalog (add new MCPs here)
├── config.ts      # Config read/write with atomic operations
├── detect.ts      # AI tool auto-detection via marker files
├── prompts.ts     # Interactive readline prompts
├── install.ts     # Install subcommand
├── remove.ts      # Remove subcommand
├── list.ts        # List subcommand
└── __tests__/     # 52 tests across 5 suites
```

</details>

- **Zero runtime dependencies** — uses only Node.js built-ins (`readline`, `fs`, `crypto`, `path`, `os`)
- **Atomic writes** — write to temp file, then rename, preventing config corruption on crash
- **Path traversal protection** — all file paths are validated to stay within the user's home directory or working directory
- **Merge, never overwrite** — existing MCP entries from other sources are always preserved
- **52 tests** — config I/O, detection logic, parsing, and security edge cases

**Stack:** TypeScript &middot; ESM &middot; tsup &middot; Vitest &middot; Node >= 20

---

[MIT](./LICENSE) &middot; Built by [cocaxcode](https://github.com/cocaxcode)
