export const fmt = (v) =>
  'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

export const getMes = () => {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`
}

export const fmtBarra = (v) => {
  if (v >= 1000000) return (v / 1000000).toFixed(1).replace('.', ',') + 'MM'
  if (v >= 1000) return Math.round(v / 1000) + 'K'
  return v.toLocaleString('pt-BR')
}

export const NIVEIS = ['Prévia', 'AUT.', 'Pleno', 'Sênior']

export const NIVEL_CORES = {
  'Prévia': '#A855F7',
  'AUT.':   '#3B82F6',
  'Pleno':  '#22C55E',
  'Sênior': '#FFB800',
}

export const MEDALS = ['🥇', '🥈', '🥉', '4', '5', '6', '7', '8', '9', '10']

export const TOP_BG = [
  'rgba(255,184,0,0.10)',
  'rgba(192,192,192,0.08)',
  'rgba(205,127,50,0.10)',
]

export const TOP_BORDER = [
  'rgba(255,184,0,0.35)',
  'rgba(192,192,192,0.28)',
  'rgba(205,127,50,0.35)',
]

// Data local no formato YYYY-MM-DD.
// Não use toISOString() para isso: ele converte para UTC e, em Joinville (UTC-3),
// a partir das 21h já devolve o dia seguinte.
export const toISODateLocal = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// Até que horas a madrugada ainda conta como o dia anterior no modo Fechamento
export const HORA_CORTE_FECHAMENTO = 4

// Dia do fechamento: é o dia de hoje, mas antes das 4h da manhã ainda conta como
// o dia anterior — a equipe costuma lançar vendas até depois da meia-noite.
export const getDiaFechamento = (agora = new Date()) => {
  const d = new Date(agora)
  if (d.getHours() < HORA_CORTE_FECHAMENTO) d.setDate(d.getDate() - 1)
  return toISODateLocal(d)
}

// Normaliza texto pra busca: minúsculo e sem acento (ex: "José" -> "jose")
export const normalizarBusca = (s) =>
  (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Compara o valor informado pelo vendedor com o total já lançado no dashboard.
// margem evita falso "diverge" por erro de arredondamento de ponto flutuante.
export const compararConferencia = (dashboard, bruto, margem = 0.005) => {
  const temInformado = bruto !== undefined && bruto !== null && bruto !== ''
  if (!temInformado) return { temInformado: false, valorInformado: null, diff: null, bate: false }
  const valorInformado = parseFloat(bruto)
  if (Number.isNaN(valorInformado)) return { temInformado: false, valorInformado: null, diff: null, bate: false }
  const diff = valorInformado - dashboard
  return { temInformado: true, valorInformado, diff, bate: Math.abs(diff) < margem }
}
