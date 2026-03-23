# CLAUDE.md — @cocaxcode/suite-mcp

## Project Overview

Interactive CLI installer for all cocaxcode MCP servers. Installs api-testing, database, logbook, devflow, and ai-context-inspector into any AI tool. Supports 7 targets. NOT an MCP server itself.

## Stack

- TypeScript 5.x (ESM)
- Zero runtime dependencies
- tsup for building (ESM output with shebang, `__PKG_VERSION__` define)
- Vitest for testing

## Architecture

```
src/
├── index.ts      # CLI entry point + arg parsing (install/remove/list subcommands)
├── types.ts      # Shared TypeScript interfaces
├── registry.ts   # MCP catalog: all 5 installable servers with npx commands
├── config.ts     # TARGET_CONFIGS: path mappings for 7 AI tools
├── detect.ts     # Auto-detect which AI tool is in use
├── install.ts    # Install MCP server into target tool config
├── remove.ts     # Remove MCP server from target tool config
├── list.ts       # List installed MCP servers
└── prompts.ts    # Interactive CLI prompts (readline)
```

## Key Patterns

- **Pure CLI**: No MCP SDK dependency, no server mode
- **Registry-driven**: `MCP_REGISTRY` defines all installable servers with their npx args
- **Target configs**: Path mappings for claude, cursor, windsurf, copilot, gemini, codex, opencode
- **Auto-detection**: Detects which AI tool is in use by checking config file existence
- **Atomic writes**: JSON config files written atomically
- **Path traversal protection**: Sanitizes server names to prevent directory escape
- **Dual-mode MCPs**: logbook-mcp and ai-context-inspector need `--mcp` flag in their args

## 7 Supported Targets

`claude` | `cursor` | `windsurf` | `copilot` | `gemini` | `codex` | `opencode`

## 5 Installable MCPs

| MCP | Command |
|-----|---------|
| api-testing-mcp | `npx -y @cocaxcode/api-testing-mcp@latest` |
| database-mcp | `npx -y @cocaxcode/database-mcp@latest` |
| logbook-mcp | `npx -y @cocaxcode/logbook-mcp@latest --mcp` |
| devflow-mcp | `npx -y @cocaxcode/devflow-mcp@latest` |
| ai-context-inspector | `npx -y @cocaxcode/ai-context-inspector@latest --mcp` |

## Commands

```bash
npm test          # Run all tests
npm run build     # Build with tsup
npm run typecheck # TypeScript check
```

## CLI Usage

```bash
npx @cocaxcode/suite-mcp install     # Interactive install
npx @cocaxcode/suite-mcp remove      # Interactive remove
npx @cocaxcode/suite-mcp list        # List installed MCPs
```

## Conventions

- Spanish for user-facing strings (CLI prompts, messages)
- English for code (variable names, comments)
- No semi, single quotes, trailing commas (Prettier)
