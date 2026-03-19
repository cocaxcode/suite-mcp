// ── Subcomando list ──

import { join } from 'node:path'
import type { TargetTool } from './types.js'
import { MCP_REGISTRY } from './registry.js'
import { TARGET_CONFIGS, getInstalledMcpNames } from './config.js'
import { detectTargetTools } from './detect.js'
import { createPromptInterface, promptTarget } from './prompts.js'

/**
 * Muestra tabla con el estado de instalacion de cada MCP del registry.
 */
export async function runList(targetFlag?: TargetTool): Promise<void> {
  const cwd = process.cwd()

  // Resolver target
  let target: TargetTool
  if (targetFlag) {
    target = targetFlag
  } else {
    const detected = await detectTargetTools(cwd)
    if (detected.length === 1) {
      target = detected[0]
    } else {
      const rl = createPromptInterface()
      try {
        target = await promptTarget(rl, detected)
      } finally {
        rl.close()
      }
    }
  }

  const config = TARGET_CONFIGS[target]
  const configPath = join(cwd, config.mcpConfigPath)

  // Leer TODAS las ubicaciones
  const installedNames = await getInstalledMcpNames(configPath, config.mcpConfigFormat, target)

  // Calcular anchos para alinear columnas
  const maxNameLen = Math.max(...MCP_REGISTRY.map((m) => m.name.length))

  // Mostrar tabla
  console.error(`\n@cocaxcode/suite-mcp — MCPs disponibles (${target})\n`)
  console.error(`  Estado  ${'MCP'.padEnd(maxNameLen)}  Descripción`)

  let installedCount = 0
  for (const mcp of MCP_REGISTRY) {
    const installed = installedNames.has(mcp.name)
    if (installed) installedCount++
    const status = installed ? '✓' : '✗'
    console.error(`  ${status}       ${mcp.name.padEnd(maxNameLen)}  ${mcp.description}`)
  }

  console.error(`\n  ${installedCount}/${MCP_REGISTRY.length} instalados`)
}
