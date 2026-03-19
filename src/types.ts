// ── Tipos de @cocaxcode/suite-mcp ──

/** Herramientas AI soportadas */
export type TargetTool =
  | 'claude'
  | 'cursor'
  | 'windsurf'
  | 'copilot'
  | 'gemini'
  | 'codex'
  | 'opencode'

/** Config de ruta y formato por herramienta */
export interface TargetConfig {
  /** Ruta relativa al archivo de configuracion MCP */
  mcpConfigPath: string
  /** Formato del JSON: 'flat' = { mcpServers: {} }, 'nested' = { settings: { mcpServers: {} } } */
  mcpConfigFormat: 'flat' | 'nested'
}

/** Definicion de un MCP en el registry */
export interface McpDefinition {
  /** Identificador corto (e.g. 'api-testing') */
  name: string
  /** Nombre npm completo (e.g. '@cocaxcode/api-testing-mcp') */
  package: string
  /** Descripcion corta en español */
  description: string
  /** Comando para ejecutar (siempre 'npx') */
  command: string
  /** Args para npx (e.g. ['-y', '@cocaxcode/api-testing-mcp@latest']) */
  args: string[]
}

/** Opciones parseadas del CLI */
export interface CliOptions {
  command: 'install' | 'remove' | 'list' | 'help'
  target?: TargetTool
  all?: boolean
  version?: boolean
}

/** Version inyectada en build time por tsup */
declare global {
  const __PKG_VERSION__: string
}
