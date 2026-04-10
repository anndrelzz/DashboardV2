import { useState } from 'react'
import { sb } from '../../lib/supabase'
import { fmt } from '../../lib/utils'
import { toast } from '../ui/Toast'

export default function SecEquipes({ equipes, vendedores, vendas, onRefresh }) {
  const [nome, setNome]     = useState('')
  const [saving, setSaving] = useState(false)

  const cadastrar = async () => {
    if (!nome.trim()) { toast('Informe o nome', false); return }
    setSaving(true)
    const { error } = await sb.from('equipes').insert({ nome: nome.trim() })
    setSaving(false)
    if (error) { toast('Equipe já existe ou erro ao cadastrar', false); return }
    setNome('')
    await onRefresh()
    toast('Equipe cadastrada!')
  }

  const remover = async (id) => {
    if (!confirm('Remover equipe? Os vendedores ficarão sem equipe.')) return
    await sb.from('vendedores').update({ equipe_id: null }).eq('equipe_id', id)
    await sb.from('equipes').delete().eq('id', id)
    await onRefresh()
  }

  return (
    <div className="p-8 max-w-3xl flex flex-col gap-6">
      <div>
        <h1 className="font-bebas text-3xl tracking-[2px]">Equipes</h1>
        <p className="text-sm text-muted mt-1">Cadastre e gerencie equipes</p>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background:'#161616', borderColor:'rgba(255,255,255,0.08)' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor:'rgba(255,255,255,0.08)' }}>
          <span className="font-cond font-bold text-sm tracking-[2px] uppercase">Cadastrar Equipe</span>
        </div>
        <div className="p-6 flex gap-4 items-end">
          <div className="flex flex-col gap-1.5 flex-1 max-w-sm">
            <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Nome da Equipe</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && cadastrar()}
              placeholder="Ex: Equipe Alfa"
              className="rounded-lg px-4 py-2.5 text-white text-sm outline-none border border-white/10 focus:border-red/40 transition-colors"
              style={{ background:'#1F1F1F' }}
            />
          </div>
          <button onClick={cadastrar} disabled={saving}
            className="px-6 py-2.5 rounded-lg font-cond font-bold text-[13px] tracking-[2px] uppercase text-white disabled:opacity-60"
            style={{ background:'#E8000D' }}>
            {saving ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background:'#161616', borderColor:'rgba(255,255,255,0.08)' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor:'rgba(255,255,255,0.08)' }}>
          <span className="font-cond font-bold text-sm tracking-[2px] uppercase">Lista de Equipes</span>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ background:'#1F1F1F' }}>
              {['Nome da Equipe','Membros','Total no Mês',''].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-bold tracking-[2px] uppercase text-muted border-b"
                  style={{ borderColor:'rgba(255,255,255,0.08)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {equipes.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-muted text-[13px] tracking-wider uppercase">Nenhuma equipe cadastrada</td></tr>
            ) : equipes.map(e => {
              const membros = vendedores.filter(v => v.equipe_id === e.id)
              const total   = vendas.filter(v => membros.find(m => m.id === v.vendedor_id)).reduce((a,b) => a+Number(b.valor), 0)
              return (
                <tr key={e.id} className="border-b last:border-0 hover:bg-white/[0.02] transition-colors"
                  style={{ borderColor:'rgba(255,255,255,0.06)' }}>
                  <td className="px-5 py-3 text-[13px] font-semibold">{e.nome}</td>
                  <td className="px-5 py-3 text-[13px] text-muted">{membros.length} membro(s)</td>
                  <td className="px-5 py-3 font-bebas text-[15px] text-red">{fmt(total)}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => remover(e.id)}
                      className="px-2.5 py-1 rounded text-[11px] font-bold tracking-wide border text-red border-red/20 hover:bg-red/10 transition-colors"
                      style={{background:'rgba(239,68,68,0.06)'}}>
                      Remover
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
