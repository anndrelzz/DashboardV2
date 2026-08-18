import { describe, it, expect } from 'vitest'
import { toISODateLocal, getDiaFechamento, getMes, normalizarBusca, compararConferencia, fmt } from './utils'

describe('toISODateLocal', () => {
  it('formata com zero à esquerda', () => {
    expect(toISODateLocal(new Date(2026, 0, 5, 10, 0, 0))).toBe('2026-01-05')
    expect(toISODateLocal(new Date(2026, 10, 3, 10, 0, 0))).toBe('2026-11-03')
  })
})

describe('getDiaFechamento', () => {
  it('não vira o dia à noite (bug original: 21h não pode virar amanhã)', () => {
    expect(getDiaFechamento(new Date(2026, 7, 18, 21, 0, 0))).toBe('2026-08-18')
    expect(getDiaFechamento(new Date(2026, 7, 18, 23, 59, 59))).toBe('2026-08-18')
    expect(getDiaFechamento(new Date(2026, 7, 18, 12, 0, 0))).toBe('2026-08-18')
  })

  it('conta madrugada (antes das 4h) como o dia anterior', () => {
    expect(getDiaFechamento(new Date(2026, 7, 18, 0, 0, 0))).toBe('2026-08-17')
    expect(getDiaFechamento(new Date(2026, 7, 18, 3, 59, 59))).toBe('2026-08-17')
  })

  it('vira o dia atual exatamente às 4h', () => {
    expect(getDiaFechamento(new Date(2026, 7, 18, 4, 0, 0))).toBe('2026-08-18')
    expect(getDiaFechamento(new Date(2026, 7, 18, 4, 0, 1))).toBe('2026-08-18')
  })

  it('lida com virada de mês (madrugada do dia 1)', () => {
    expect(getDiaFechamento(new Date(2026, 2, 1, 2, 0, 0))).toBe('2026-02-28') // 2026 não é bissexto
    expect(getDiaFechamento(new Date(2026, 2, 1, 5, 0, 0))).toBe('2026-03-01')
    expect(getDiaFechamento(new Date(2024, 2, 1, 2, 0, 0))).toBe('2024-02-29') // 2024 é bissexto
  })

  it('lida com virada de ano (madrugada de 1º de janeiro)', () => {
    expect(getDiaFechamento(new Date(2026, 0, 1, 2, 0, 0))).toBe('2025-12-31')
    expect(getDiaFechamento(new Date(2026, 0, 1, 5, 0, 0))).toBe('2026-01-01')
  })
})

describe('getMes', () => {
  it('usa componentes de data locais, não toISOString/UTC', () => {
    expect(getMes.toString()).not.toContain('toISOString')
  })
})

describe('normalizarBusca', () => {
  it('remove acentos e ignora maiúsculas', () => {
    expect(normalizarBusca('José Ademir')).toBe('jose ademir')
    expect(normalizarBusca('André')).toBe('andre')
    expect(normalizarBusca('ANDERSON')).toBe('anderson')
  })

  it('trata valores vazios/indefinidos sem quebrar', () => {
    expect(normalizarBusca('')).toBe('')
    expect(normalizarBusca(undefined)).toBe('')
    expect(normalizarBusca(null)).toBe('')
  })

  it('"andre" não deveria casar com "Anderson" (ordem das letras é diferente)', () => {
    expect(normalizarBusca('Anderson').includes('andre')).toBe(false)
    expect(normalizarBusca('Alexandre').includes('andre')).toBe(true)
  })
})

describe('compararConferencia', () => {
  it('sem valor informado: aguardando', () => {
    expect(compararConferencia(100000, '')).toEqual({ temInformado: false, valorInformado: null, diff: null, bate: false })
    expect(compararConferencia(100000, undefined)).toEqual({ temInformado: false, valorInformado: null, diff: null, bate: false })
  })

  it('valores iguais: bate', () => {
    const r = compararConferencia(100000, '100000')
    expect(r.temInformado).toBe(true)
    expect(r.bate).toBe(true)
    expect(r.diff).toBe(0)
  })

  it('informado maior que o dashboard: falta lançar (diff positivo)', () => {
    const r = compararConferencia(100000, '150000')
    expect(r.bate).toBe(false)
    expect(r.diff).toBe(50000)
  })

  it('informado menor que o dashboard: lançado a mais (diff negativo)', () => {
    const r = compararConferencia(150000, '100000')
    expect(r.bate).toBe(false)
    expect(r.diff).toBe(-50000)
  })

  it('tolera diferença de arredondamento de ponto flutuante', () => {
    const r = compararConferencia(100000.1, '100000.1000001')
    expect(r.bate).toBe(true)
  })

  it('texto inválido não trava, só não bate', () => {
    const r = compararConferencia(100000, 'abc')
    expect(r.temInformado).toBe(false)
    expect(r.bate).toBe(false)
  })
})

describe('fmt', () => {
  it('formata em reais sem casas decimais', () => {
    expect(fmt(1000)).toBe('R$ 1.000')
    expect(fmt(0)).toBe('R$ 0')
  })
})
