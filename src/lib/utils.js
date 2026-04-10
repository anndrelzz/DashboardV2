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
