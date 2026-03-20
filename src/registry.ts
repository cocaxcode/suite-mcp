// ── Registry de MCPs de cocaxcode ──

import type { McpDefinition } from './types.js'

/**
 * Catalogo de MCPs disponibles.
 * Para agregar un nuevo MCP: añadir un objeto al array.
 * No requiere cambios en ningun otro archivo.
 */
export const MCP_REGISTRY: McpDefinition[] = [
  {
    name: 'api-testing',
    package: '@cocaxcode/api-testing-mcp',
    description: 'Testing de APIs con collections, assertions y flows',
    command: 'npx',
    args: ['-y', '@cocaxcode/api-testing-mcp@latest'],
  },
  {
    name: 'database',
    package: '@cocaxcode/database-mcp',
    description: 'Gestión de PostgreSQL, MySQL y SQLite',
    command: 'npx',
    args: ['-y', '@cocaxcode/database-mcp@latest'],
  },
  {
    name: 'devflow',
    package: '@cocaxcode/devflow-mcp',
    description: 'Jira + GitHub/GitLab workflow automation',
    command: 'npx',
    args: ['-y', '@cocaxcode/devflow-mcp@latest'],
  },
  {
    name: 'logbook',
    package: '@cocaxcode/logbook-mcp',
    description: 'Logbook de desarrollo con notas y TODOs',
    command: 'npx',
    args: ['-y', '@cocaxcode/logbook-mcp@latest', '--mcp'],
  },
  {
    name: 'ai-context-inspector',
    package: '@cocaxcode/ai-context-inspector',
    description: 'Scanner y migrador de ecosistema AI',
    command: 'npx',
    args: ['-y', '@cocaxcode/ai-context-inspector@latest', '--mcp'],
  },
]
