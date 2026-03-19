// ── Configuracion de herramientas AI y lectura/escritura de config MCP ──

import { readFile, writeFile, mkdir, rename, unlink } from 'node:fs/promises'
import { dirname, resolve, join } from 'node:path'
import { randomBytes } from 'node:crypto'
import { homedir, platform } from 'node:os'
import type { TargetTool, TargetConfig } from './types.js'

// ── Mapa de configuracion por herramienta ──

export const TARGET_CONFIGS: Record<TargetTool, TargetConfig> = {
  claude: {
    mcpConfigPath: '.mcp.json',
    mcpConfigFormat: 'flat',
  },
  cursor: {
    mcpConfigPath: '.cursor/mcp.json',
    mcpConfigFormat: 'flat',
  },
  windsurf: {
    mcpConfigPath: '.mcp.json',
    mcpConfigFormat: 'flat',
  },
  copilot: {
    mcpConfigPath: '.vscode/mcp.json',
    mcpConfigFormat: 'flat',
  },
  gemini: {
    mcpConfigPath: '.gemini/settings.json',
    mcpConfigFormat: 'nested',
  },
  codex: {
    mcpConfigPath: '.mcp.json',
    mcpConfigFormat: 'flat',
  },
  opencode: {
    mcpConfigPath: 'opencode.json',
    mcpConfigFormat: 'nested',
  },
}

/** Markers de archivos/directorios para auto-detectar la herramienta AI */
export const TOOL_MARKERS: Record<TargetTool, string[]> = {
  claude: ['CLAUDE.md', '.claude', '.mcp.json'],
  cursor: ['.cursorrules', '.cursor'],
  windsurf: ['.windsurfrules', '.windsurf'],
  copilot: ['.github/copilot-instructions.md', '.github/agents', '.vscode/mcp.json'],
  gemini: ['GEMINI.md', '.gemini'],
  codex: ['AGENTS.md', '.codex'],
  opencode: ['OPENCODE.md', '.opencode', 'opencode.json'],
}

/** Lista de todas las herramientas soportadas (derivada de TARGET_CONFIGS) */
export const ALL_TARGETS = Object.keys(TARGET_CONFIGS) as TargetTool[]

// ── Helpers internos ──

/**
 * Lee y parsea un archivo JSON de config.
 * Valida que el resultado sea un objeto (no null, array, string, etc.).
 * Retorna objeto vacio si el archivo no existe, es JSON invalido, o no es un objeto.
 */
async function readParsedConfig(configPath: string): Promise<Record<string, unknown>> {
  try {
    const raw = await readFile(configPath, 'utf-8')
    const maybeObj = JSON.parse(raw) as unknown
    if (typeof maybeObj !== 'object' || maybeObj === null || Array.isArray(maybeObj)) {
      console.error(`  Advertencia: ${configPath} no contiene un objeto JSON válido, se tratará como vacío.`)
      return {}
    }
    return maybeObj as Record<string, unknown>
  } catch {
    return {}
  }
}

/**
 * Valida que configPath este contenido dentro de baseDir.
 * Previene path traversal.
 */
function assertSafePath(configPath: string, baseDir: string): void {
  const resolved = resolve(configPath)
  const resolvedBase = resolve(baseDir)
  if (!resolved.startsWith(resolvedBase + '/') && !resolved.startsWith(resolvedBase + '\\') && resolved !== resolvedBase) {
    throw new Error(`Ruta fuera del directorio de trabajo: ${configPath}`)
  }
}

/**
 * Escritura atomica: escribe a temporal y luego renombra.
 * Si falla, el archivo original no se corrompe.
 */
async function writeFileAtomic(filePath: string, content: string): Promise<void> {
  const tmpPath = `${filePath}.tmp-${randomBytes(6).toString('hex')}`
  try {
    await writeFile(tmpPath, content, 'utf-8')
    await rename(tmpPath, filePath)
  } catch (err) {
    try { await unlink(tmpPath) } catch { /* ignorar limpieza fallida */ }
    throw err
  }
}

/** Asegura que el container de mcpServers exista en el JSON */
function ensureServersContainer(
  parsed: Record<string, unknown>,
  format: 'flat' | 'nested',
): Record<string, unknown> {
  if (format === 'nested') {
    if (!parsed.settings || typeof parsed.settings !== 'object') {
      parsed.settings = {}
    }
    const settings = parsed.settings as Record<string, unknown>
    if (!settings.mcpServers || typeof settings.mcpServers !== 'object') {
      settings.mcpServers = {}
    }
    return settings.mcpServers as Record<string, unknown>
  }

  if (!parsed.mcpServers || typeof parsed.mcpServers !== 'object') {
    parsed.mcpServers = {}
  }
  return parsed.mcpServers as Record<string, unknown>
}

// ── Rutas alternativas donde cada herramienta guarda MCPs ──

/**
 * Retorna rutas adicionales donde la herramienta puede tener MCPs configurados.
 * Por ejemplo, Claude Desktop guarda en %APPDATA%/Claude/claude_desktop_config.json
 * ademas del .mcp.json del proyecto.
 */
function getAlternativeConfigPaths(target: TargetTool): { path: string; format: 'flat' | 'nested' }[] {
  const paths: { path: string; format: 'flat' | 'nested' }[] = []

  if (target === 'claude') {
    // Claude Desktop config (Windows: %APPDATA%/Claude/, macOS: ~/Library/Application Support/Claude/)
    const appData = platform() === 'win32'
      ? process.env.APPDATA
      : platform() === 'darwin'
        ? join(homedir(), 'Library', 'Application Support')
        : join(homedir(), '.config')

    if (appData) {
      paths.push({
        path: join(appData, 'Claude', 'claude_desktop_config.json'),
        format: 'flat',
      })
    }

    // Claude Code user-level config (~/.claude/settings.json) — nested format
    paths.push({
      path: join(homedir(), '.claude', 'settings.json'),
      format: 'nested',
    })
  }

  return paths
}

// ── API publica ──

/**
 * Lee la config MCP existente del archivo principal.
 * Si el archivo no existe o es JSON invalido, retorna vacio.
 */
export async function readMcpConfig(
  configPath: string,
  format: 'flat' | 'nested',
): Promise<{ parsed: Record<string, unknown>; servers: Record<string, unknown> }> {
  const parsed = await readParsedConfig(configPath)
  const servers = ensureServersContainer({ ...parsed }, format)
  return { parsed, servers }
}

/**
 * Obtiene todos los nombres de MCPs instalados en TODAS las ubicaciones posibles
 * para una herramienta AI. Busca en el archivo principal del proyecto Y en las
 * ubicaciones alternativas (Claude Desktop, etc.).
 *
 * Esto permite detectar MCPs instalados via `claude mcp add` o manualmente.
 */
export async function getInstalledMcpNames(
  configPath: string,
  format: 'flat' | 'nested',
  target: TargetTool,
): Promise<Set<string>> {
  const names = new Set<string>()

  // 1. Buscar en el archivo principal del proyecto
  const { servers } = await readMcpConfig(configPath, format)
  for (const name of Object.keys(servers)) {
    names.add(name)
  }

  // 2. Buscar en ubicaciones alternativas
  const altPaths = getAlternativeConfigPaths(target)
  for (const alt of altPaths) {
    const parsed = await readParsedConfig(alt.path)
    const altServers = ensureServersContainer({ ...parsed }, alt.format)
    for (const name of Object.keys(altServers)) {
      names.add(name)
    }
  }

  return names
}

/**
 * Escribe entries MCP al archivo de config (merge atomico).
 * Preserva todo el contenido existente.
 * Crea directorios intermedios si no existen.
 * Valida que configPath este dentro de baseDir (default: cwd).
 */
export async function writeMcpEntries(
  configPath: string,
  format: 'flat' | 'nested',
  entries: { name: string; command: string; args: string[] }[],
  baseDir?: string,
): Promise<void> {
  assertSafePath(configPath, baseDir ?? process.cwd())

  const parsed = await readParsedConfig(configPath)
  const container = ensureServersContainer(parsed, format)

  for (const entry of entries) {
    container[entry.name] = {
      command: entry.command,
      args: entry.args,
    }
  }

  try {
    await mkdir(dirname(configPath), { recursive: true })
  } catch (err) {
    throw new Error(
      `No se pudo crear el directorio para ${configPath}: ${(err as NodeJS.ErrnoException).message}`,
    )
  }

  await writeFileAtomic(configPath, JSON.stringify(parsed, null, 2) + '\n')
}

/**
 * Elimina entries MCP del archivo de config (escritura atomica).
 * Si queda vacio, mantiene el objeto mcpServers vacio (no borra archivo).
 */
export async function removeMcpEntries(
  configPath: string,
  format: 'flat' | 'nested',
  names: string[],
  baseDir?: string,
): Promise<void> {
  assertSafePath(configPath, baseDir ?? process.cwd())

  let parsed: Record<string, unknown>
  try {
    const raw = await readFile(configPath, 'utf-8')
    const maybeObj = JSON.parse(raw) as unknown
    if (typeof maybeObj !== 'object' || maybeObj === null || Array.isArray(maybeObj)) {
      return // Nada que eliminar de un archivo no-objeto
    }
    parsed = maybeObj as Record<string, unknown>
  } catch {
    return // Archivo no existe o JSON invalido — nada que eliminar
  }

  const container = ensureServersContainer(parsed, format)

  for (const name of names) {
    delete container[name]
  }

  await writeFileAtomic(configPath, JSON.stringify(parsed, null, 2) + '\n')
}
