import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { detectTargetTools } from '../detect.js'

describe('detectTargetTools', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'suite-mcp-detect-'))
  })

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true })
  })

  it('detecta Claude por markers', async () => {
    await writeFile(join(tmpDir, 'CLAUDE.md'), '', 'utf-8')
    await mkdir(join(tmpDir, '.claude'), { recursive: true })

    const detected = await detectTargetTools(tmpDir)
    expect(detected[0]).toBe('claude')
  })

  it('detecta Cursor por markers', async () => {
    await mkdir(join(tmpDir, '.cursor'), { recursive: true })
    await writeFile(join(tmpDir, '.cursorrules'), '', 'utf-8')

    const detected = await detectTargetTools(tmpDir)
    expect(detected[0]).toBe('cursor')
  })

  it('retorna vacio si no hay markers', async () => {
    const detected = await detectTargetTools(tmpDir)
    expect(detected).toHaveLength(0)
  })

  it('detecta multiples herramientas ordenadas por confianza', async () => {
    // Claude: 2 markers
    await writeFile(join(tmpDir, 'CLAUDE.md'), '', 'utf-8')
    await mkdir(join(tmpDir, '.claude'), { recursive: true })

    // Cursor: 1 marker
    await writeFile(join(tmpDir, '.cursorrules'), '', 'utf-8')

    const detected = await detectTargetTools(tmpDir)
    expect(detected.length).toBeGreaterThanOrEqual(2)
    expect(detected[0]).toBe('claude') // Mas markers = primero
    expect(detected).toContain('cursor')
  })

  it('detecta Gemini por markers', async () => {
    await writeFile(join(tmpDir, 'GEMINI.md'), '', 'utf-8')
    await mkdir(join(tmpDir, '.gemini'), { recursive: true })

    const detected = await detectTargetTools(tmpDir)
    expect(detected[0]).toBe('gemini')
  })
})
