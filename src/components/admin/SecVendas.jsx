import { useState } from 'react'
import { sb } from '../../lib/supabase'
import { getMes, fmt } from '../../lib/utils'
import { toast } from '../ui/Toast'

export default function SecVendas({ vendedores, equipes, vendas, onRefresh }) {
  const [vendId, setVendId]   = useState('')
  const [valor, setValor]     = useState('')
  const [data, setData]       = useState(new Date().toISOString().slice(0,10))
  const [tipo, setTipo]       = useState('')
  const [desc, setDesc]       = useState('')
  const [saving, setSaving]   = useState(false)

  const getVend = id => vendedores.find(x => x.id === id)
  const getEq   = id => equipes.find(x => x.id === id)

  const lancar = async () => {
    if (!vendId) { toast('Selecione um vendedor', false); return }
    const val = parseFloat(valor)
    if (!val || val <= 0) { toast('Informe um valor válido', false); return }
    if (!tipo) { toast('Selecione o tipo', false); return }
    setSaving(true)
    const mes = data ? data.substring(0,7) : getMes()
    const { error } = await sb.from('vendas').insert({ vendedor_id:vendId, valor:val, data, descricao:desc.trim(), tipo, mes })
    setSaving(false)
    if (error) { toast('Erro ao lançar venda', false); return }
    setValor(''); setDesc(''); setTipo('')
    await onRefresh()
    toast('Venda lançada!')
  }

  const remover = async (id) => {
    if (!confirm('Remover esta venda?')) return
    await sb.from('vendas').delete().eq('id', id)
    await onRefresh()
  }

  const limpar = async () => {
    if (!confirm('Limpar todas as vendas do mês?')) return
    await sb.from('vendas').delete().eq('mes', getMes())
    await onRefresh()
    toast('Vendas do mês removidas')
  }

  const inputCls = "rounded-lg px-4 py-2.5 text-white text-sm outline-none border border-white/10 focus:border-red/40 transition-colors w-full"
  const inputBg  = { background:'#1F1F1F' }

  return (
    <div className="p-8 max-w-5xl flex flex-col gap-6">
      <div>
        <h1 className="font-bebas text-3xl tracking-[2px]">Lançar Venda</h1>
        <p className="text-sm text-muted mt-1">Atribua uma venda a um vendedor</p>
      </div>

      {/* Formulário */}
      <div className="rounded-xl border overflow-hidden" style={{ background:'#161616', borderColor:'rgba(255,255,255,0.08)' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor:'rgba(255,255,255,0.08)' }}>
          <span className="font-cond font-bold text-sm tracking-[2px] uppercase">Nova Venda</span>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Vendedor</label>
              <select value={vendId} onChange={e=>setVendId(e.target.value)} className={inputCls} style={inputBg}>
                <option value="">Selecione...</option>
                {vendedores.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Valor (R$)</label>
              <input type="number" value={valor} onChange={e=>setValor(e.target.value)} placeholder="Ex: 15000" min={0} step={0.01} className={inputCls} style={inputBg} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Data</label>
              <input type="date" value={data} onChange={e=>setData(e.target.value)} className={inputCls} style={inputBg} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Tipo</label>
              <select value={tipo} onChange={e=>setTipo(e.target.value)} className={inputCls} style={inputBg}>
                <option value="">Selecione...</option>
                <option value="Imovel">🏠 Imóvel</option>
                <option value="Veiculo">🚗 Veículo</option>
              </select>
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Descrição (opcional)</label>
              <input type="text" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Ex: Apartamento 3 quartos" className={inputCls} style={inputBg} />
            </div>
          </div>
          <div>
            <button onClick={lancar} disabled={saving}
              className="px-6 py-2.5 rounded-lg font-cond font-bold text-[13px] tracking-[2px] uppercase text-white transition-colors disabled:opacity-60"
              style={{ background:'#E8000D' }}>
              {saving ? 'Lançando...' : 'Lançar Venda'}
            </button>
          </div>
        </div>
      </div>

      {/* Histórico */}
      <div className="rounded-xl border overflow-hidden" style={{ background:'#161616', borderColor:'rgba(255,255,255,0.08)' }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor:'rgba(255,255,255,0.08)' }}>
          <span className="font-cond font-bold text-sm tracking-[2px] uppercase">Histórico de Vendas</span>
          <button onClick={limpar}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-[1.5px] uppercase border transition-colors text-red border-red/20 hover:bg-red/10"
            style={{ background:'rgba(239,68,68,0.06)' }}>
            Limpar Mês
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ background:'#1F1F1F' }}>
              {['Vendedor','Tipo','Equipe','Valor','Descrição','Data',''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold tracking-[2px] uppercase text-muted border-b"
                  style={{ borderColor:'rgba(255,255,255,0.08)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vendas.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-muted text-[13px] tracking-wider uppercase">Nenhuma venda lançada no mês</td></tr>
            ) : vendas.map(v => {
              const vend = getVend(v.vendedor_id)
              const eq   = vend ? getEq(vend.equipe_id) : null
              return (
                <tr key={v.id} className="border-b last:border-0 hover:bg-white/[0.02] transition-colors"
                  style={{ borderColor:'rgba(255,255,255,0.06)' }}>
                  <td className="px-4 py-3 text-[13px] font-semibold">{vend?.nome || 'Removido'}</td>
                  <td className="px-4 py-3 text-[13px]">
                    {v.tipo==='Imovel' ? <span className="text-red font-bold">🏠 Imóvel</span>
                     : v.tipo==='Veiculo' ? <span style={{color:'#3B82F6'}} className="font-bold">🚗 Veículo</span>
                     : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {eq ? <span className="px-2 py-0.5 rounded text-[11px] font-bold text-red border border-red/25" style={{background:'rgba(232,0,13,0.08)'}}>{eq.nome}</span> : '—'}
                  </td>
                  <td className="px-4 py-3 font-bebas text-[16px] text-red">{fmt(v.valor)}</td>
                  <td className="px-4 py-3 text-[13px] text-muted">{v.descricao || '—'}</td>
                  <td className="px-4 py-3 text-[13px] text-muted">{v.data || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => remover(v.id)}
                      className="px-2.5 py-1 rounded text-[11px] font-bold tracking-wide border text-red border-red/20 hover:bg-red/10 transition-colors"
                      style={{background:'rgba(239,68,68,0.06)'}}>
                      Excluir
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
