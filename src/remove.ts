// ── Subcomando remove ──

import { join } from 'node:path'
import { homedir } from 'node:os'
import type { TargetTool } from './types.js'
import { MCP_REGISTRY } from './registry.js'
import { TARGET_CONFIGS, getGlobalConfigPath, getInstalledMcpNames, removeMcpEntries } from './config.js'
import { detectTargetTools } from './detect.js'
import { createPromptInterface, promptTarget } from './prompts.js'
import { parseNumberList } from './prompts.js'

/**
 * Ejecuta el flujo de eliminacion de MCPs.
 * Pide seleccion explicita — Enter sin input cancela (no elimina todo).
 */
export async function runRemove(targetFlag?: TargetTool): Promise<void> {
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
    const globalConfig = getGlobalConfigPath(target)
    const configPath = globalConfig ? globalConfig.path : join(cwd, config.mcpConfigPath)
    const configFormat = globalConfig ? globalConfig.format : config.mcpConfigFormat

    // 2. Leer TODAS las ubicaciones y filtrar MCPs del registry
    const installedNames = await getInstalledMcpNames(configPath, configFormat, target)

    const installedMcps = MCP_REGISTRY.filter((mcp) =>
      installedNames.has(mcp.name),
    )

    if (installedMcps.length === 0) {
      console.error('\nNo hay MCPs de cocaxcode instalados.')
      return
    }

    // 3. Checklist con seleccion explicita (Enter = cancelar, no "todos")
    console.error('\nMCPs instalados:\n')
    for (let i = 0; i < installedMcps.length; i++) {
      console.error(`  [${i + 1}] ${installedMcps[i].name} — ${installedMcps[i].description}`)
    }

    let selectedIndices: number[]
    while (true) {
      const answer = await rl.question(
        '\nSelecciona cuáles eliminar (números separados por coma, Enter = cancelar): ',
      )
      const trimmed = answer.trim()

      if (trimmed === '') {
        console.error('\nOperación cancelada.')
        return
      }

      const nums = parseNumberList(trimmed, 1, installedMcps.length)
      if (nums === null || nums.length === 0) {
        console.error('  Entrada inválida. Usa números separados por coma.')
        continue
      }

      selectedIndices = nums.map((n) => n - 1)
      break
    }

    const toRemove = selectedIndices.map((i) => installedMcps[i])

    // 4. Eliminar entries
    await removeMcpEntries(
      configPath,
      configFormat,
      toRemove.map((mcp) => mcp.name),
      globalConfig ? homedir() : cwd,
    )

    // 5. Resumen
    console.error(`\n✓ ${toRemove.length} MCP${toRemove.length > 1 ? 's' : ''} eliminado${toRemove.length > 1 ? 's' : ''} de ${configPath} (${target})`)
    for (const mcp of toRemove) {
      console.error(`  - ${mcp.name}`)
    }
  } finally {
    rl.close()
  }
}
