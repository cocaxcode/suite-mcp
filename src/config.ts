// ── Configuracion de herramientas AI y lectura/escritura de config MCP ──

import { readFile, writeFile, mkdir, rename, unlink } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { randomBytes } from 'node:crypto'
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

// ── API publica ──

/**
 * Lee la config MCP existente.
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
