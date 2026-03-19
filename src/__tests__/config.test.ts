import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { readMcpConfig, writeMcpEntries, removeMcpEntries, TARGET_CONFIGS, ALL_TARGETS } from '../config.js'

describe('TARGET_CONFIGS', () => {
  it('tiene configuracion para las 7 herramientas', () => {
    expect(Object.keys(TARGET_CONFIGS)).toHaveLength(7)
    for (const target of ALL_TARGETS) {
      expect(TARGET_CONFIGS[target]).toBeDefined()
      expect(TARGET_CONFIGS[target].mcpConfigPath).toBeTruthy()
      expect(['flat', 'nested']).toContain(TARGET_CONFIGS[target].mcpConfigFormat)
    }
  })

  it('gemini y opencode usan formato nested', () => {
    expect(TARGET_CONFIGS.gemini.mcpConfigFormat).toBe('nested')
    expect(TARGET_CONFIGS.opencode.mcpConfigFormat).toBe('nested')
  })

  it('claude, cursor, windsurf, copilot, codex usan formato flat', () => {
    expect(TARGET_CONFIGS.claude.mcpConfigFormat).toBe('flat')
    expect(TARGET_CONFIGS.cursor.mcpConfigFormat).toBe('flat')
    expect(TARGET_CONFIGS.windsurf.mcpConfigFormat).toBe('flat')
    expect(TARGET_CONFIGS.copilot.mcpConfigFormat).toBe('flat')
    expect(TARGET_CONFIGS.codex.mcpConfigFormat).toBe('flat')
  })
})

describe('readMcpConfig', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'suite-mcp-test-'))
  })

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true })
  })

  it('retorna vacio si el archivo no existe', async () => {
    const result = await readMcpConfig(join(tmpDir, '.mcp.json'), 'flat')
    expect(result.servers).toEqual({})
  })

  it('retorna vacio si el JSON es invalido', async () => {
    await writeFile(join(tmpDir, '.mcp.json'), 'not json', 'utf-8')
    const result = await readMcpConfig(join(tmpDir, '.mcp.json'), 'flat')
    expect(result.servers).toEqual({})
  })

  it('lee config flat existente', async () => {
    const config = {
      mcpServers: {
        'my-mcp': { command: 'npx', args: ['my-mcp'] },
      },
    }
    await writeFile(join(tmpDir, '.mcp.json'), JSON.stringify(config), 'utf-8')

    const result = await readMcpConfig(join(tmpDir, '.mcp.json'), 'flat')
    expect(result.servers).toHaveProperty('my-mcp')
  })

  it('lee config nested existente', async () => {
    const config = {
      settings: {
        mcpServers: {
          'my-mcp': { command: 'npx', args: ['my-mcp'] },
        },
      },
    }
    const path = join(tmpDir, 'settings.json')
    await writeFile(path, JSON.stringify(config), 'utf-8')

    const result = await readMcpConfig(path, 'nested')
    expect(result.servers).toHaveProperty('my-mcp')
  })

  it('retorna vacio si JSON es null', async () => {
    await writeFile(join(tmpDir, '.mcp.json'), 'null', 'utf-8')
    const result = await readMcpConfig(join(tmpDir, '.mcp.json'), 'flat')
    expect(result.servers).toEqual({})
  })

  it('retorna vacio si JSON es un array', async () => {
    await writeFile(join(tmpDir, '.mcp.json'), '[1,2,3]', 'utf-8')
    const result = await readMcpConfig(join(tmpDir, '.mcp.json'), 'flat')
    expect(result.servers).toEqual({})
  })
})

describe('writeMcpEntries', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'suite-mcp-test-'))
  })

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true })
  })

  it('crea archivo nuevo flat', async () => {
    const path = join(tmpDir, '.mcp.json')
    await writeMcpEntries(path, 'flat', [
      { name: 'api-testing', command: 'npx', args: ['-y', '@cocaxcode/api-testing-mcp@latest'] },
    ], tmpDir)

    const raw = await readFile(path, 'utf-8')
    const parsed = JSON.parse(raw)
    expect(parsed.mcpServers['api-testing'].command).toBe('npx')
    expect(parsed.mcpServers['api-testing'].args).toContain('@cocaxcode/api-testing-mcp@latest')
  })

  it('hace merge con config existente', async () => {
    const path = join(tmpDir, '.mcp.json')
    const existing = { mcpServers: { 'custom-mcp': { command: 'node', args: ['custom.js'] } } }
    await writeFile(path, JSON.stringify(existing), 'utf-8')

    await writeMcpEntries(path, 'flat', [
      { name: 'api-testing', command: 'npx', args: ['-y', '@cocaxcode/api-testing-mcp@latest'] },
    ], tmpDir)

    const raw = await readFile(path, 'utf-8')
    const parsed = JSON.parse(raw)
    expect(parsed.mcpServers['custom-mcp']).toBeDefined()
    expect(parsed.mcpServers['api-testing']).toBeDefined()
  })

  it('crea directorios intermedios', async () => {
    const path = join(tmpDir, '.cursor', 'mcp.json')
    await writeMcpEntries(path, 'flat', [
      { name: 'database', command: 'npx', args: ['-y', '@cocaxcode/database-mcp@latest'] },
    ], tmpDir)

    const raw = await readFile(path, 'utf-8')
    const parsed = JSON.parse(raw)
    expect(parsed.mcpServers['database']).toBeDefined()
  })

  it('escribe formato nested correctamente', async () => {
    const path = join(tmpDir, 'settings.json')
    await writeMcpEntries(path, 'nested', [
      { name: 'logbook', command: 'npx', args: ['-y', '@cocaxcode/logbook-mcp@latest', '--mcp'] },
    ], tmpDir)

    const raw = await readFile(path, 'utf-8')
    const parsed = JSON.parse(raw)
    expect(parsed.settings.mcpServers.logbook).toBeDefined()
    expect(parsed.settings.mcpServers.logbook.args).toContain('--mcp')
  })

  it('rechaza path fuera del directorio base', async () => {
    await expect(
      writeMcpEntries('/tmp/fuera/.mcp.json', 'flat', [
        { name: 'test', command: 'npx', args: ['test'] },
      ], tmpDir),
    ).rejects.toThrow('Ruta fuera del directorio de trabajo')
  })
})

describe('removeMcpEntries', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'suite-mcp-test-'))
  })

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true })
  })

  it('elimina un MCP manteniendo los demas', async () => {
    const path = join(tmpDir, '.mcp.json')
    const config = {
      mcpServers: {
        'api-testing': { command: 'npx', args: ['a'] },
        'database': { command: 'npx', args: ['b'] },
      },
    }
    await writeFile(path, JSON.stringify(config), 'utf-8')

    await removeMcpEntries(path, 'flat', ['api-testing'], tmpDir)

    const raw = await readFile(path, 'utf-8')
    const parsed = JSON.parse(raw)
    expect(parsed.mcpServers['api-testing']).toBeUndefined()
    expect(parsed.mcpServers['database']).toBeDefined()
  })

  it('deja objeto vacio al eliminar el ultimo', async () => {
    const path = join(tmpDir, '.mcp.json')
    const config = { mcpServers: { 'api-testing': { command: 'npx', args: ['a'] } } }
    await writeFile(path, JSON.stringify(config), 'utf-8')

    await removeMcpEntries(path, 'flat', ['api-testing'], tmpDir)

    const raw = await readFile(path, 'utf-8')
    const parsed = JSON.parse(raw)
    expect(parsed.mcpServers).toEqual({})
  })

  it('no falla si el archivo no existe', async () => {
    await expect(
      removeMcpEntries(join(tmpDir, 'no-existe.json'), 'flat', ['foo'], tmpDir),
    ).resolves.not.toThrow()
  })

  it('rechaza path fuera del directorio base', async () => {
    await expect(
      removeMcpEntries('/tmp/fuera/.mcp.json', 'flat', ['test'], tmpDir),
    ).rejects.toThrow('Ruta fuera del directorio de trabajo')
  })
})
