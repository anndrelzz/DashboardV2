import { fmtMesLabel, somarMes } from '../../lib/utils'

// ‹ Novembro/2026 ›  — não deixa avançar além do mês atual
export default function MesSelector({ mes, mesAtual, onChange, loading }) {
  const podeAvancar = mes < mesAtual
  const btn = "w-8 h-8 flex items-center justify-center rounded-lg border text-muted hover:text-white hover:border-white/25 transition-colors disabled:opacity-30 disabled:pointer-events-none"
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <button onClick={() => onChange(somarMes(mes, -1))} className={btn}
        style={{ background:'#1F1F1F', borderColor:'rgba(255,255,255,0.1)' }} title="Mês anterior">‹</button>
      <div className="min-w-[150px] text-center px-3 py-1.5 rounded-lg border text-[13px] font-semibold"
        style={{ background:'#1F1F1F', borderColor: mes === mesAtual ? 'rgba(255,255,255,0.1)' : 'rgba(255,184,0,0.4)', color: mes === mesAtual ? '#fff' : '#FFB800' }}>
        {loading ? 'Carregando...' : fmtMesLabel(mes)}
      </div>
      <button onClick={() => onChange(somarMes(mes, 1))} disabled={!podeAvancar} className={btn}
        style={{ background:'#1F1F1F', borderColor:'rgba(255,255,255,0.1)' }} title="Próximo mês">›</button>
      {mes !== mesAtual && (
        <button onClick={() => onChange(mesAtual)}
          className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wide uppercase border text-muted border-white/15 hover:text-white hover:border-white/30 transition-colors">
          Mês atual
        </button>
      )}
    </div>
  )
}
