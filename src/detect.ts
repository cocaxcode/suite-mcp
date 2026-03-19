// ── Auto-deteccion de herramientas AI ──

import { access } from 'node:fs/promises'
import { join } from 'node:path'
import type { TargetTool } from './types.js'
import { TOOL_MARKERS } from './config.js'

/**
 * Detecta que herramientas AI estan configuradas en el directorio.
 * Comprueba markers de archivos para cada herramienta.
 * Retorna lista ordenada por cantidad de markers encontrados (mas confianza primero).
 */
export async function detectTargetTools(dir: string): Promise<TargetTool[]> {
  const results: { target: TargetTool; count: number }[] = []

  for (const [target, markers] of Object.entries(TOOL_MARKERS) as [TargetTool, string[]][]) {
    let count = 0

    for (const marker of markers) {
      try {
        await access(join(dir, marker))
        count++
      } catch {
        // Marker no encontrado, skip
      }
    }

    if (count > 0) {
      results.push({ target, count })
    }
  }

  results.sort((a, b) => b.count - a.count)

  return results.map((r) => r.target)
}
