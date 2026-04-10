import { useState } from 'react'
import { fmt } from '../../lib/utils'

const NIVEL_CORES = { 'Prévia':'#A855F7','AUT.':'#3B82F6','Pleno':'#22C55E','Sênior':'#FFB800' }

export default function SecPerformance({ equipes, vendedores, vendas }) {
  const [eqId, setEqId] = useState('')

  const membros = eqId ? vendedores.filter(v => v.equipe_id === eqId) : []
  const ranking = membros.map(v => {
    const mins = vendas.filter(s => s.vendedor_id === v.id)
    return { ...v, total: mins.reduce((a, b) => a + Number(b.valor), 0), qtd: mins.length }
  }).sort((a, b) => b.total - a.total)

  const totalEq  = ranking.reduce((a, b) => a + b.total, 0)
  const totalQtd = ranking.reduce((a, b) => a + b.qtd,   0)

  return (
    <div className="p-8 max-w-4xl flex flex-col gap-6">
      <div>
        <h1 className="font-bebas text-3xl tracking-[2px]">Desempenho por Equipe</h1>
        <p className="text-sm text-muted mt-1">Ranking e produtividade dos membros</p>
      </div>

      {/* Seletor */}
      <div className="rounded-xl border overflow-hidden" style={{ background:'#161616', borderColor:'rgba(255,255,255,0.08)' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor:'rgba(255,255,255,0.08)' }}>
          <span className="font-cond font-bold text-sm tracking-[2px] uppercase">Selecionar Equipe</span>
        </div>
        <div className="p-5">
          <select value={eqId} onChange={e => setEqId(e.target.value)}
            className="rounded-lg px-4 py-2.5 text-white text-sm outline-none border border-white/10 focus:border-red/40 w-72"
            style={{ background:'#1F1F1F' }}>
            <option value="">Escolha uma equipe...</option>
            {equipes.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
        </div>
      </div>

      {eqId && (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label:'Total Produzido',   value:fmt(totalEq),       red:true },
              { label:'Membros Ativos',    value:membros.length },
              { label:'Volume de Vendas',  value:totalQtd },
            ].map(s => (
              <div key={s.label} className="rounded-xl border p-4"
                style={{ background:'#161616', borderColor:'rgba(255,255,255,0.08)' }}>
                <p className="text-[10px] font-bold tracking-[2px] uppercase text-muted mb-1.5">{s.label}</p>
                <p className={`font-bebas text-3xl leading-none ${s.red ? 'text-red' : 'text-white'}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ background:'#161616', borderColor:'rgba(255,255,255,0.08)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor:'rgba(255,255,255,0.08)' }}>
              <span className="font-cond font-bold text-sm tracking-[2px] uppercase">Ranking de Vendedores</span>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ background:'#1F1F1F' }}>
                  {['Pos.','Vendedor','Nível','Vendas','Total do Mês'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-bold tracking-[2px] uppercase text-muted border-b"
                      style={{ borderColor:'rgba(255,255,255,0.08)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ranking.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-muted text-[13px] tracking-wider uppercase">Nenhum membro nesta equipe</td></tr>
                ) : ranking.map((v, i) => (
                  <tr key={v.id} className="border-b last:border-0 hover:bg-white/[0.02] transition-colors"
                    style={{ borderColor:'rgba(255,255,255,0.06)' }}>
                    <td className="px-5 py-3 text-[13px] font-bold text-muted">{i+1}º</td>
                    <td className="px-5 py-3 text-[13px] font-semibold">{v.nome}</td>
                    <td className="px-5 py-3">
                      {v.nivel ? <span className="text-[12px] font-bold" style={{ color:NIVEL_CORES[v.nivel]||'#fff' }}>{v.nivel}</span> : '—'}
                    </td>
                    <td className="px-5 py-3 text-[13px] text-muted">{v.qtd}</td>
                    <td className="px-5 py-3 font-bebas text-lg text-red">{fmt(v.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
