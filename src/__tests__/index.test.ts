import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubGlobal('__PKG_VERSION__', '0.1.0')

const { parseArgs } = await import('../index.js')

describe('parseArgs', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('sin argumentos retorna help', () => {
    const result = parseArgs([])
    expect(result.command).toBe('help')
  })

  it('install retorna command install', () => {
    const result = parseArgs(['install'])
    expect(result.command).toBe('install')
  })

  it('remove retorna command remove', () => {
    const result = parseArgs(['remove'])
    expect(result.command).toBe('remove')
  })

  it('list retorna command list', () => {
    const result = parseArgs(['list'])
    expect(result.command).toBe('list')
  })

  it('--version retorna version true', () => {
    const result = parseArgs(['--version'])
    expect(result.version).toBe(true)
  })

  it('-v retorna version true', () => {
    const result = parseArgs(['-v'])
    expect(result.version).toBe(true)
  })

  it('--target cursor setea target', () => {
    const result = parseArgs(['install', '--target', 'cursor'])
    expect(result.target).toBe('cursor')
    expect(result.command).toBe('install')
  })

  it('--all setea all true', () => {
    const result = parseArgs(['install', '--all'])
    expect(result.all).toBe(true)
    expect(result.command).toBe('install')
  })

  it('--target y --all juntos', () => {
    const result = parseArgs(['install', '--target', 'claude', '--all'])
    expect(result.target).toBe('claude')
    expect(result.all).toBe(true)
    expect(result.command).toBe('install')
  })

  it('--target invalido lanza error', () => {
    expect(() => parseArgs(['install', '--target', 'vim'])).toThrow('Herramienta no soportada: vim')
  })

  it('comando desconocido lanza error', () => {
    expect(() => parseArgs(['foo'])).toThrow('Comando desconocido: foo')
  })
})
