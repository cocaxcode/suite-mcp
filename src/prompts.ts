// ── Prompts interactivos con readline nativo ──

import * as readline from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import type { TargetTool } from './types.js'
import { ALL_TARGETS } from './config.js'

// ── Helpers ──

export function createPromptInterface(): readline.Interface {
  return readline.createInterface({ input: stdin, output: stdout })
}

/**
 * Parsea una lista de numeros separados por coma.
 * Retorna null si hay numeros fuera de rango o entrada invalida.
 * Retorna [] si la entrada es vacia (Enter).
 */
export function parseNumberList(
  input: string,
  min: number,
  max: number,
): number[] | null {
  const trimmed = input.trim()
  if (trimmed === '') return []
  const parts = trimmed.split(',').map((s) => s.trim())
  const nums: number[] = []
  for (const part of parts) {
    const num = parseInt(part, 10)
    if (isNaN(num) || num < min || num > max) return null
    nums.push(num)
  }
  return nums
}

/**
 * Pregunta repetidamente hasta obtener un numero valido en rango.
 */
async function askNumber(
  rl: readline.Interface,
  prompt: string,
  min: number,
  max: number,
): Promise<number> {
  while (true) {
    const answer = await rl.question(prompt)
    const num = parseInt(answer.trim(), 10)
    if (!isNaN(num) && num >= min && num <= max) return num
    console.error(`  Entrada inválida. Ingresa un número entre ${min} y ${max}.`)
  }
}

// ── Prompts principales ──

/**
 * Muestra checklist numerada con estado y retorna indices seleccionados.
 * Enter sin input = todos los no instalados.
 */
export async function promptChecklist(
  rl: readline.Interface,
  items: { label: string; description: string; installed: boolean }[],
  message: string,
): Promise<number[]> {
  console.error(`\n${message}\n`)

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const status = item.installed ? '✓' : '○'
    const suffix = item.installed ? ' (ya instalado)' : ''
    console.error(`  [${i + 1}] ${status} ${item.label} — ${item.description}${suffix}`)
  }

  const notInstalled = items
    .map((item, i) => (!item.installed ? i : -1))
    .filter((i) => i !== -1)

  if (notInstalled.length === 0) {
    return []
  }

  while (true) {
    const answer = await rl.question(
      '\nSelecciona (números separados por coma, Enter = todos los pendientes): ',
    )
    const nums = parseNumberList(answer, 1, items.length)

    if (nums === null) {
      console.error('  Entrada inválida. Usa números separados por coma.')
      continue
    }

    if (nums.length === 0) {
      // Enter = todos los no instalados
      return notInstalled
    }

    // Convertir de 1-based a 0-based
    return nums.map((n) => n - 1)
  }
}

/**
 * Pregunta que herramienta AI usar como destino.
 * Si solo hay 1 detectada, la retorna directamente.
 * Si hay multiples, muestra lista. Si ninguna, muestra todas.
 */
export async function promptTarget(
  rl: readline.Interface,
  detected: TargetTool[],
): Promise<TargetTool> {
  if (detected.length === 1) {
    return detected[0]
  }

  if (detected.length > 1) {
    console.error('\nSe detectaron múltiples herramientas AI:')
    for (let i = 0; i < detected.length; i++) {
      console.error(`  [${i + 1}] ${detected[i]}`)
    }
    const option = await askNumber(rl, '¿Cuál usar? ', 1, detected.length)
    return detected[option - 1]
  }

  // Ninguna detectada
  console.error('\nNo se detectó ninguna herramienta AI configurada.')
  console.error('¿Cuál configurar?')
  for (let i = 0; i < ALL_TARGETS.length; i++) {
    console.error(`  [${i + 1}] ${ALL_TARGETS[i]}`)
  }
  const option = await askNumber(rl, 'Opción: ', 1, ALL_TARGETS.length)
  return ALL_TARGETS[option - 1]
}
