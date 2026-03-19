// ── Subcomando install ──

import { join } from 'node:path'
import type { TargetTool } from './types.js'
import { MCP_REGISTRY } from './registry.js'
import { TARGET_CONFIGS, readMcpConfig, writeMcpEntries } from './config.js'
import { detectTargetTools } from './detect.js'
import { createPromptInterface, promptChecklist, promptTarget } from './prompts.js'

/**
 * Ejecuta el flujo de instalacion de MCPs.
 * 1. Resuelve target (detectar o forzado)
 * 2. Lee config existente
 * 3. Muestra checklist o usa --all
 * 4. Escribe config
 * 5. Muestra resumen
 */
export async function runInstall(targetFlag?: TargetTool, all?: boolean): Promise<void> {
  const cwd = process.cwd()
  const rl = createPromptInterface()

  try {
    // 1. Resolver target
    let target: TargetTool
    if (targetFlag) {
      target = targetFlag
    } else {
      const detected = await detectTargetTools(cwd)
      target = await promptTarget(rl, detected)
    }

    const config = TARGET_CONFIGS[target]
    const configPath = join(cwd, config.mcpConfigPath)

    // 2. Leer config existente
    const { servers } = await readMcpConfig(configPath, config.mcpConfigFormat)
    const installedNames = Object.keys(servers)

    // 3. Determinar que instalar
    const items = MCP_REGISTRY.map((mcp) => ({
      label: mcp.name,
      description: mcp.description,
      installed: installedNames.includes(mcp.name),
    }))

    const allInstalled = items.every((item) => item.installed)
    if (allInstalled) {
      console.error('\n✓ Todos los MCPs ya están instalados.')
      return
    }

    let toInstallIndices: number[]

    if (all) {
      // --all: seleccionar todos los no instalados
      toInstallIndices = items
        .map((item, i) => (!item.installed ? i : -1))
        .filter((i) => i !== -1)
    } else {
      toInstallIndices = await promptChecklist(rl, items, 'MCPs disponibles:')
    }

    // Filtrar los ya instalados de la seleccion
    const toInstall = toInstallIndices
      .filter((i) => !items[i].installed)
      .map((i) => MCP_REGISTRY[i])

    if (toInstall.length === 0) {
      console.error('\n✓ Los MCPs seleccionados ya están instalados.')
      return
    }

    // 4. Escribir config
    await writeMcpEntries(
      configPath,
      config.mcpConfigFormat,
      toInstall.map((mcp) => ({
        name: mcp.name,
        command: mcp.command,
        args: mcp.args,
      })),
    )

    // 5. Resumen
    console.error(`\n✓ ${toInstall.length} MCP${toInstall.length > 1 ? 's' : ''} instalado${toInstall.length > 1 ? 's' : ''} en ${config.mcpConfigPath} (${target})`)
    for (const mcp of toInstall) {
      console.error(`  - ${mcp.name}`)
    }
  } finally {
    rl.close()
  }
}
