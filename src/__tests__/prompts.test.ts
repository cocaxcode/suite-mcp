import { describe, it, expect } from 'vitest'
import { parseNumberList } from '../prompts.js'

describe('parseNumberList', () => {
  it('retorna [] para entrada vacía (Enter)', () => {
    expect(parseNumberList('', 1, 4)).toEqual([])
  })

  it('retorna [] para entrada solo espacios', () => {
    expect(parseNumberList('   ', 1, 4)).toEqual([])
  })

  it('parsea un solo número', () => {
    expect(parseNumberList('2', 1, 4)).toEqual([2])
  })

  it('parsea múltiples números separados por coma', () => {
    expect(parseNumberList('1,3', 1, 4)).toEqual([1, 3])
  })

  it('parsea con espacios alrededor de comas', () => {
    expect(parseNumberList('1 , 3 , 4', 1, 4)).toEqual([1, 3, 4])
  })

  it('retorna null para valor fuera de rango (mayor)', () => {
    expect(parseNumberList('5', 1, 4)).toBeNull()
  })

  it('retorna null para valor fuera de rango (menor)', () => {
    expect(parseNumberList('0', 1, 4)).toBeNull()
  })

  it('retorna null para input no numérico', () => {
    expect(parseNumberList('abc', 1, 4)).toBeNull()
  })

  it('retorna null si cualquier elemento es inválido', () => {
    expect(parseNumberList('1,abc,3', 1, 4)).toBeNull()
  })

  it('retorna null si cualquier elemento está fuera de rango', () => {
    expect(parseNumberList('1,5', 1, 4)).toBeNull()
  })

  it('acepta el valor mínimo exacto', () => {
    expect(parseNumberList('1', 1, 4)).toEqual([1])
  })

  it('acepta el valor máximo exacto', () => {
    expect(parseNumberList('4', 1, 4)).toEqual([4])
  })
})
