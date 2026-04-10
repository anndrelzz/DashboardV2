import { fmt } from '../../lib/utils'

export default function SecResumo({ meta, vendedores, equipes, vendas }) {
  const total  = vendas.reduce((a, b) => a + Number(b.valor), 0)
  const pct    = meta > 0 ? Math.min(100, Math.round((total / meta) * 100)) : 0
  const faltam = Math.max(0, meta - total)

  const getVend = id => vendedores.find(x => x.id === id)
  const getEq   = id => equipes.find(x => x.id === id)

  return (
    <div className="p-8 flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="font-bebas text-3xl tracking-[2px]">Resumo</h1>
        <p className="text-sm text-muted mt-1">Visão geral do mês atual</p>
      </div>

      {/* Meta grande */}
      <div className="flex items-center gap-8 rounded-xl border p-6"
        style={{ background:'#1F1F1F', borderColor:'rgba(232,0,13,0.25)' }}>
        <div className="flex-shrink-0">
          <p className="text-[11px] font-bold tracking-[2px] uppercase text-muted mb-1">Meta do Mês</p>
          <p className="font-bebas text-5xl text-red leading-none">{fmt(meta)}</p>
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-bold tracking-[2px] uppercase text-muted mb-2">Progresso</p>
          <div className="h-3.5 rounded-full overflow-hidden mb-2" style={{ background:'#282828' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width:`${pct}%`, background:'linear-gradient(90deg,#9B0009,#E8000D)' }} />
          </div>
          <div className="flex justify-between text-[12px] text-muted">
            <span>Realizado: <strong className="text-white">{fmt(total)}</strong></span>
            <span>Faltam: <strong className="text-white">{fmt(faltam)}</strong></span>
            <strong className="text-red">{pct}%</strong>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label:'Vendedores', value:vendedores.length },
          { label:'Equipes',    value:equipes.length },
          { label:'Vendas no Mês', value:vendas.length },
          { label:'Total do Mês', value:fmt(total), red:true },
        ].map(s => (
          <div key={s.label} className="rounded-xl border p-4"
            style={{ background:'#161616', borderColor:'rgba(255,255,255,0.08)' }}>
            <p className="text-[10px] font-bold tracking-[2px] uppercase text-muted mb-1.5">{s.label}</p>
            <p className={`font-bebas text-3xl leading-none ${s.red ? 'text-red' : 'text-white'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Últimas vendas */}
      <div className="rounded-xl border overflow-hidden"
        style={{ background:'#161616', borderColor:'rgba(255,255,255,0.08)' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor:'rgba(255,255,255,0.08)' }}>
          <span className="font-cond font-bold text-sm tracking-[2px] uppercase">Últimas Vendas</span>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ background:'#1F1F1F' }}>
              {['Vendedor','Equipe','Valor','Data'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-bold tracking-[2px] uppercase text-muted border-b"
                  style={{ borderColor:'rgba(255,255,255,0.08)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vendas.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-muted text-[13px] tracking-wider uppercase">Nenhuma venda lançada ainda</td></tr>
            ) : vendas.slice(0, 8).map(v => {
              const vend = getVend(v.vendedor_id)
              const eq   = vend ? getEq(vend.equipe_id) : null
              return (
                <tr key={v.id} className="border-b last:border-0 hover:bg-white/[0.02] transition-colors"
                  style={{ borderColor:'rgba(255,255,255,0.06)' }}>
                  <td className="px-5 py-3 text-[13px] font-semibold">{vend?.nome || '—'}</td>
                  <td className="px-5 py-3">
                    {eq ? <span className="px-2 py-1 rounded text-[11px] font-bold tracking-wide text-red border border-red/30" style={{ background:'rgba(232,0,13,0.08)' }}>{eq.nome}</span>
                       : <span className="text-dim text-[12px]">Sem equipe</span>}
                  </td>
                  <td className="px-5 py-3 font-bebas text-[16px] text-red">{fmt(v.valor)}</td>
                  <td className="px-5 py-3 text-[13px] text-muted">{v.data || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
