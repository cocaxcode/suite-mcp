// ── Entry point: @cocaxcode/suite-mcp ──

import type { CliOptions, TargetTool } from './types.js'
import { ALL_TARGETS } from './config.js'
import { runInstall } from './install.js'
import { runRemove } from './remove.js'
import { runList } from './list.js'

// ── Arg parsing ──

const VALID_COMMANDS = ['install', 'remove', 'list'] as const

export function parseArgs(argv: string[]): CliOptions {
  // Check --version / -v first
  if (argv.includes('--version') || argv.includes('-v')) {
    return { command: 'help', version: true }
  }

  // Extract --target <value>
  let target: TargetTool | undefined
  const targetIdx = argv.indexOf('--target')
  if (targetIdx !== -1 && argv[targetIdx + 1]) {
    const val = argv[targetIdx + 1]
    if (!ALL_TARGETS.includes(val as TargetTool)) {
      throw new Error(
        `Herramienta no soportada: ${val}\nVálidas: ${ALL_TARGETS.join(', ')}`,
      )
    }
    target = val as TargetTool
  }

  // Check --all flag
  const all = argv.includes('--all')

  // Get subcommand (first positional arg that's not a flag value)
  const positionals = argv.filter((arg, i) => {
    if (arg.startsWith('--')) return false
    if (arg.startsWith('-')) return false
    // Skip value after --target
    if (i > 0 && argv[i - 1] === '--target') return false
    return true
  })

  const cmd = positionals[0]

  if (!cmd) {
    return { command: 'help', target, all }
  }

  if (VALID_COMMANDS.includes(cmd as typeof VALID_COMMANDS[number])) {
    return { command: cmd as CliOptions['command'], target, all }
  }

  // Comando desconocido
  throw new Error(`Comando desconocido: ${cmd}`)
}

// ── Help ──

function showHelp(): void {
  console.error(`
@cocaxcode/suite-mcp v${__PKG_VERSION__}

Instalador interactivo de MCPs de cocaxcode.

Uso:
  npx @cocaxcode/suite-mcp <comando> [opciones]

Comandos:
  install     Instalar MCPs en tu herramienta AI
  remove      Eliminar MCPs instalados
  list        Ver estado de instalación

Opciones:
  --target <tool>  Forzar herramienta AI (claude, cursor, windsurf, copilot, gemini, codex, opencode)
  --all            Instalar todos los MCPs sin preguntar
  --version, -v    Mostrar versión
`)
}

// ── Main ──

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))

  if (options.version) {
    // --version va a stdout (convencion estandar para CLIs)
    console.log(__PKG_VERSION__)
    return
  }

  switch (options.command) {
    case 'install':
      await runInstall(options.target, options.all)
      break
    case 'remove':
      await runRemove(options.target)
      break
    case 'list':
      await runList(options.target)
      break
    case 'help':
      showHelp()
      break
  }
}

// Solo ejecutar main() cuando es el entry point directo
const isDirectRun = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))
  || process.argv[1]?.endsWith('suite-mcp')
  || process.argv[1]?.endsWith('index.js')

if (isDirectRun) {
  main().catch((error) => {
    console.error(error.message ?? error)
    process.exit(1)
  })
}
