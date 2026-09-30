import { describe, it, expect } from 'vitest'
import { toISODateLocal, getDiaFechamento, getMes, normalizarBusca, compararConferencia, fmt, diasEntre, fmtDiaMes, filtrarVendasSemana, filtrarVendasDoDia, pctMeta } from './utils'

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

describe('diasEntre', () => {
  it('inclui as duas pontas do período', () => {
    expect(diasEntre('2026-09-28', '2026-09-30')).toEqual(['2026-09-28', '2026-09-29', '2026-09-30'])
  })

  it('um único dia devolve esse dia', () => {
    expect(diasEntre('2026-09-30', '2026-09-30')).toEqual(['2026-09-30'])
  })

  it('atravessa a virada de mês sem pular dia (usa hora local, não UTC)', () => {
    expect(diasEntre('2026-09-29', '2026-10-02')).toEqual(['2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02'])
  })

  it('período invertido devolve vazio em vez de laço infinito', () => {
    expect(diasEntre('2026-09-30', '2026-09-28')).toEqual([])
  })
})

describe('fmtDiaMes', () => {
  it('converte ISO para DD/MM', () => {
    expect(fmtDiaMes('2026-09-28')).toBe('28/09')
    expect(fmtDiaMes('2026-01-05')).toBe('05/01')
  })
})

describe('filtrarVendasSemana', () => {
  const vendas = [
    { data: '2026-09-27', valor: 100 },
    { data: '2026-09-28', valor: 200 },
    { data: '2026-09-30', valor: 300 },
    { data: '2026-10-01', valor: 400 },
  ]

  it('pega só o que está dentro do período, incluindo as pontas', () => {
    const r = filtrarVendasSemana(vendas, '2026-09-28', '2026-09-30')
    expect(r.map(v => v.valor)).toEqual([200, 300])
  })

  it('ignora a parte de hora quando a data vem como timestamp', () => {
    const r = filtrarVendasSemana([{ data: '2026-09-30T23:40:00', valor: 50 }], '2026-09-28', '2026-09-30')
    expect(r).toHaveLength(1)
  })

  it('sem período configurado devolve vazio', () => {
    expect(filtrarVendasSemana(vendas, null, null)).toEqual([])
    expect(filtrarVendasSemana(undefined, '2026-09-28', '2026-09-30')).toEqual([])
  })
})

describe('pctMeta', () => {
  it('calcula o percentual batido', () => {
    expect(pctMeta(4500000, 9000000)).toEqual({ pct: 50, pctBarra: 50 })
  })

  it('deixa o texto passar de 100% mas trava a barra em 100', () => {
    expect(pctMeta(18000000, 9000000)).toEqual({ pct: 200, pctBarra: 100 })
  })

  it('sem meta definida não divide por zero', () => {
    expect(pctMeta(5000, 0)).toEqual({ pct: 0, pctBarra: 0 })
    expect(pctMeta(5000, null)).toEqual({ pct: 0, pctBarra: 0 })
  })
})

describe('filtrarVendasDoDia', () => {
  const vendas = [
    { data: '2026-09-29', valor: 100 },
    { data: '2026-09-30', valor: 200 },
    { data: '2026-09-30T22:15:00', valor: 300 },
  ]

  it('pega só as vendas do dia pedido', () => {
    expect(filtrarVendasDoDia(vendas, '2026-09-29').map(v => v.valor)).toEqual([100])
  })

  it('ignora a hora quando a data vem como timestamp', () => {
    expect(filtrarVendasDoDia(vendas, '2026-09-30').map(v => v.valor)).toEqual([200, 300])
  })

  it('dia sem venda devolve vazio, sem quebrar com lista indefinida', () => {
    expect(filtrarVendasDoDia(vendas, '2026-09-28')).toEqual([])
    expect(filtrarVendasDoDia(undefined, '2026-09-30')).toEqual([])
  })
})
