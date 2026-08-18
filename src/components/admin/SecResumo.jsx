import { fmt } from '../../lib/utils'
import SectionHeader from './SectionHeader'
import { IconResumo } from './icons'

export default function SecResumo({ meta, vendedores, equipes, vendas }) {
  const total  = vendas.reduce((a, b) => a + Number(b.valor), 0)
  const pct    = meta > 0 ? Math.min(100, Math.round((total / meta) * 100)) : 0
  const faltam = Math.max(0, meta - total)

  const getVend = id => vendedores.find(x => x.id === id)
  const getEq   = id => equipes.find(x => x.id === id)

  return (
    <div className="p-10 flex flex-col gap-8">
      <SectionHeader icon={<IconResumo size={20} />} title="Resumo" subtitle="Visão geral do mês atual" />

      {/* Meta grande */}
      <div className="flex items-center gap-10 rounded-2xl border p-7"
        style={{ background:'#171717', borderColor:'rgba(232,0,13,0.22)' }}>
        <div className="flex-shrink-0">
          <p className="text-[11px] font-bold tracking-[2px] uppercase text-muted mb-1.5">Meta do Mês</p>
          <p className="font-bebas text-[52px] text-red leading-none">{fmt(meta)}</p>
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-bold tracking-[2px] uppercase text-muted mb-2.5">Progresso</p>
          <div className="h-3.5 rounded-full overflow-hidden mb-2.5" style={{ background:'#262626' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width:`${pct}%`, background:'linear-gradient(90deg,#9B0009,#E8000D)' }} />
          </div>
          <div className="flex justify-between text-[12.5px] text-muted">
            <span>Realizado: <strong className="text-white">{fmt(total)}</strong></span>
            <span>Faltam: <strong className="text-white">{fmt(faltam)}</strong></span>
            <strong className="text-red">{pct}%</strong>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:'Vendedores', value:vendedores.length },
          { label:'Equipes',    value:equipes.length },
          { label:'Vendas no Mês', value:vendas.length },
          { label:'Total do Mês', value:fmt(total), red:true },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border p-5"
            style={{ background:'#161616', borderColor:'rgba(255,255,255,0.07)' }}>
            <p className="text-[10.5px] font-bold tracking-[2px] uppercase text-muted mb-2">{s.label}</p>
            <p className={`font-bebas text-4xl leading-none ${s.red ? 'text-red' : 'text-white'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Últimas vendas */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ background:'#161616', borderColor:'rgba(255,255,255,0.07)' }}>
        <div className="px-6 py-4.5 border-b" style={{ borderColor:'rgba(255,255,255,0.07)' }}>
          <span className="font-cond font-bold text-sm tracking-[2px] uppercase">Últimas Vendas</span>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ background:'#1c1c1c' }}>
              {['Vendedor','Equipe','Valor','Data'].map(h => (
                <th key={h} className="text-left px-6 py-3.5 text-[10.5px] font-bold tracking-[2px] uppercase text-muted border-b"
                  style={{ borderColor:'rgba(255,255,255,0.07)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vendas.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-14 text-muted text-[13px] tracking-wider uppercase">Nenhuma venda lançada ainda</td></tr>
            ) : vendas.slice(0, 8).map(v => {
              const vend = getVend(v.vendedor_id)
              const eq   = vend ? getEq(vend.equipe_id) : null
              return (
                <tr key={v.id} className="border-b last:border-0 hover:bg-white/[0.02] transition-colors"
                  style={{ borderColor:'rgba(255,255,255,0.05)' }}>
                  <td className="px-6 py-3.5 text-[13.5px] font-semibold">{vend?.nome || '—'}</td>
                  <td className="px-6 py-3.5">
                    {eq ? <span className="px-2.5 py-1 rounded text-[11px] font-bold tracking-wide text-red border border-red/30" style={{ background:'rgba(232,0,13,0.08)' }}>{eq.nome}</span>
                       : <span className="text-dim text-[12px]">Sem equipe</span>}
                  </td>
                  <td className="px-6 py-3.5 font-bebas text-[17px] text-red">{fmt(v.valor)}</td>
                  <td className="px-6 py-3.5 text-[13px] text-muted">{v.data || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
