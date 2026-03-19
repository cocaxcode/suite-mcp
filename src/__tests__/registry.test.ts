import { describe, it, expect } from 'vitest'
import { MCP_REGISTRY } from '../registry.js'

describe('MCP_REGISTRY', () => {
  it('contiene exactamente 4 MCPs', () => {
    expect(MCP_REGISTRY).toHaveLength(4)
  })

  it('cada entry tiene todos los campos requeridos', () => {
    for (const mcp of MCP_REGISTRY) {
      expect(mcp.name).toBeTruthy()
      expect(mcp.package).toMatch(/^@cocaxcode\//)
      expect(mcp.description).toBeTruthy()
      expect(mcp.command).toBe('npx')
      expect(mcp.args).toBeInstanceOf(Array)
      expect(mcp.args.length).toBeGreaterThan(0)
    }
  })

  it('todos los args contienen @latest', () => {
    for (const mcp of MCP_REGISTRY) {
      const hasLatest = mcp.args.some((arg) => arg.includes('@latest'))
      expect(hasLatest, `${mcp.name} debería tener @latest en args`).toBe(true)
    }
  })

  it('logbook y ai-context-inspector incluyen --mcp', () => {
    const logbook = MCP_REGISTRY.find((m) => m.name === 'logbook')
    const aci = MCP_REGISTRY.find((m) => m.name === 'ai-context-inspector')

    expect(logbook?.args).toContain('--mcp')
    expect(aci?.args).toContain('--mcp')
  })

  it('api-testing y database NO incluyen --mcp', () => {
    const apiTesting = MCP_REGISTRY.find((m) => m.name === 'api-testing')
    const database = MCP_REGISTRY.find((m) => m.name === 'database')

    expect(apiTesting?.args).not.toContain('--mcp')
    expect(database?.args).not.toContain('--mcp')
  })

  it('contiene los 4 MCPs esperados', () => {
    const names = MCP_REGISTRY.map((m) => m.name)
    expect(names).toContain('api-testing')
    expect(names).toContain('database')
    expect(names).toContain('logbook')
    expect(names).toContain('ai-context-inspector')
  })
})
