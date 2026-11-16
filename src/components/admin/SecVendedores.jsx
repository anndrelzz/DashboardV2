import { Fragment, useState } from 'react'
import { sb } from '../../lib/supabase'
import { fmt, NIVEIS, NIVEL_CORES, normalizarBusca } from '../../lib/utils'
import { excluirVenda } from '../../lib/excluirVenda'
import { toast } from '../../lib/toast'
import { uploadFoto } from '../../lib/fotoVendedor'
import SectionHeader from './SectionHeader'
import MesSelector from './MesSelector'
import EditarVendaModal from './EditarVendaModal'
import EditarVendedorModal from './EditarVendedorModal'
import VendasDoVendedor from './VendasDoVendedor'
import { IconVendedores, IconUser, IconCamera, IconEdit, IconTrash, IconSearch } from './icons'

export default function SecVendedores({ equipes, vendedores, mesAtual, consulta }) {
  // Vendas do mês escolhido no seletor (padrão: mês atual). recarregar atualiza
  // o mês atual e, se estiver vendo outro mês, ele também.
  const { vendas, mes, trocarMes, loading: loadingMes, recarregar: onRefresh } = consulta
  const [nome, setNome]       = useState('')
  const [empresa, setEmpresa] = useState('')
  const [nivel, setNivel]     = useState('')
  const [eqId, setEqId]       = useState('')
  const [foto, setFoto]       = useState(null)
  const [saving, setSaving]   = useState(false)

  const [editando, setEditando]     = useState(null) // vendedor em edição

  const [busca, setBusca] = useState('')
  const [ordem, setOrdem] = useState('nome') // 'nome' | 'total'
  const [abertos, setAbertos] = useState(() => new Set())
  const [vendaEditando, setVendaEditando] = useState(null)

  const alternar = (id) => setAbertos(prev => {
    const n = new Set(prev)
    if (n.has(id)) n.delete(id); else n.add(id)
    return n
  })

  // Vendas do mês agrupadas por vendedor (já vêm da mais recente pra mais antiga)
  const vendasPorVend = {}
  for (const x of vendas) (vendasPorVend[x.vendedor_id] ||= []).push(x)
  const totalDe = (id) => (vendasPorVend[id] || []).reduce((a, b) => a + Number(b.valor), 0)

  const buscaNorm = normalizarBusca(busca)
  const vendedoresFiltrados = buscaNorm
    ? vendedores.filter(v => normalizarBusca(v.nome).includes(buscaNorm) || normalizarBusca(v.empresa).includes(buscaNorm))
    : vendedores
  const vendedoresOrdenados = ordem === 'total'
    ? [...vendedoresFiltrados].sort((a, b) => totalDe(b.id) - totalDe(a.id) || a.nome.localeCompare(b.nome))
    : vendedoresFiltrados

  const cadastrar = async () => {
    if (!nome.trim()) { toast('Informe o nome', false); return }
    if (!nivel) { toast('Selecione o nível', false); return }
    setSaving(true)
    const { data, error } = await sb.from('vendedores')
      .insert({ nome: nome.trim(), empresa: empresa.trim(), nivel, equipe_id: eqId || null })
      .select().single()
    if (error) { toast('Erro ao cadastrar', false); setSaving(false); return }

    if (foto && data) {
      const url = await uploadFoto(foto, data.id)
      if (url) await sb.from('vendedores').update({ foto_url: url }).eq('id', data.id)
    }
    setSaving(false)
    setNome(''); setEmpresa(''); setNivel(''); setEqId(''); setFoto(null)
    await onRefresh()
    toast('Vendedor cadastrado!')
  }

  const remover = async (id) => {
    if (!confirm('Remover vendedor e suas vendas?')) return
    const r1 = await sb.from('vendas').delete().eq('vendedor_id', id)
    if (r1.error) { toast('Erro ao remover vendas do vendedor', false); return }
    const r2 = await sb.from('vendedores').delete().eq('id', id)
    if (r2.error) { toast('Erro ao remover vendedor (as vendas dele já foram apagadas)', false); await onRefresh(); return }
    await onRefresh()
    toast('Vendedor removido')
  }

  const inputCls = "rounded-lg px-4 py-2.5 text-white text-sm outline-none border border-white/10 focus:border-red/40 transition-colors w-full"
  const inputBg  = { background:'#1F1F1F' }

  return (
    <div className="p-10 flex flex-col gap-8">
      <SectionHeader icon={<IconVendedores size={20} />} title="Vendedores" subtitle="Cadastre e gerencie vendedores" />

      {/* Formulário cadastro */}
      <div className="rounded-2xl border overflow-hidden" style={{ background:'#161616', borderColor:'rgba(255,255,255,0.07)' }}>
        <div className="px-6 py-4.5 border-b" style={{ borderColor:'rgba(255,255,255,0.07)' }}>
          <span className="font-cond font-bold text-sm tracking-[2px] uppercase">Cadastrar Vendedor</span>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Nome Completo</label>
              <input type="text" value={nome} onChange={e=>setNome(e.target.value)} placeholder="Ex: João Silva" className={inputCls} style={inputBg} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Empresa</label>
              <input type="text" value={empresa} onChange={e=>setEmpresa(e.target.value)} placeholder="Ex: AGS Consultoria" className={inputCls} style={inputBg} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Nível</label>
              <select value={nivel} onChange={e=>setNivel(e.target.value)} className={inputCls} style={inputBg}>
                <option value="">Selecione...</option>
                {NIVEIS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Equipe</label>
              <select value={eqId} onChange={e=>setEqId(e.target.value)} className={inputCls} style={inputBg}>
                <option value="">Sem equipe</option>
                {equipes.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </select>
            </div>
          </div>

          {/* Upload foto */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Foto do Vendedor</label>
            <div className="flex items-center gap-4">
              {foto
                ? <img src={URL.createObjectURL(foto)} className="w-14 h-14 rounded-full object-cover border-2 border-red/40" alt="preview" />
                : <div className="w-14 h-14 rounded-full flex items-center justify-center border" style={{ background:'#1F1F1F', borderColor:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.3)' }}>
                    <IconUser size={22} />
                  </div>
              }
              <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-lg border text-sm font-semibold text-muted hover:text-white hover:border-white/20 transition-colors"
                style={{ background:'#1F1F1F', borderColor:'rgba(255,255,255,0.1)' }}>
                <IconCamera size={15} />
                {foto ? 'Trocar foto' : 'Selecionar foto'}
                <input type="file" accept="image/*" className="hidden" onChange={e => setFoto(e.target.files[0])} />
              </label>
              {foto && <span className="text-[12px] text-muted">{foto.name}</span>}
            </div>
          </div>

          <div>
            <button onClick={cadastrar} disabled={saving}
              className="px-6 py-2.5 rounded-lg font-cond font-bold text-[13px] tracking-[2px] uppercase text-white disabled:opacity-60"
              style={{ background:'#E8000D' }}>
              {saving ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="rounded-2xl border overflow-hidden" style={{ background:'#161616', borderColor:'rgba(255,255,255,0.07)' }}>
        <div className="px-6 py-4.5 border-b flex items-center justify-between gap-4" style={{ borderColor:'rgba(255,255,255,0.07)' }}>
          <span className="font-cond font-bold text-sm tracking-[2px] uppercase flex-shrink-0">
            Lista de Vendedores {buscaNorm && <span className="text-muted normal-case tracking-normal font-normal">({vendedoresFiltrados.length} de {vendedores.length})</span>}
          </span>
          <div className="flex items-center gap-3">
            <MesSelector mes={mes} mesAtual={mesAtual} onChange={trocarMes} loading={loadingMes} />
            <select value={ordem} onChange={e=>setOrdem(e.target.value)} title="Ordenar"
              className="rounded-lg px-3 py-2 text-white text-[13px] outline-none border border-white/10 focus:border-red/40"
              style={{ background:'#1F1F1F' }}>
              <option value="nome">Ordem: nome</option>
              <option value="total">Ordem: maior total</option>
            </select>
            <div className="relative w-64">
              <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:'rgba(255,255,255,0.3)' }} />
              <input type="text" value={busca} onChange={e=>setBusca(e.target.value)}
                placeholder="Buscar por nome ou empresa..."
                className="w-full rounded-lg pl-9 pr-3 py-2 text-white text-[13px] outline-none border border-white/10 focus:border-red/40 transition-colors"
                style={{ background:'#1F1F1F' }} />
            </div>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ background:'#1c1c1c' }}>
              {['','Foto','Nome','Empresa','Nível','Equipe','Vendas','Total',''].map((h, i) => (
                <th key={i} className="text-left px-5 py-3.5 text-[10.5px] font-bold tracking-[2px] uppercase text-muted border-b"
                  style={{ borderColor:'rgba(255,255,255,0.07)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vendedores.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-14 text-muted text-[13px] tracking-wider uppercase">Nenhum vendedor cadastrado</td></tr>
            ) : vendedoresFiltrados.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-14 text-muted text-[13px] tracking-wider uppercase">Nenhum vendedor encontrado para "{busca}"</td></tr>
            ) : vendedoresOrdenados.map(v => {
              const eq = equipes.find(e => e.id === v.equipe_id)
              const minhas = vendasPorVend[v.id] || []
              const total  = totalDe(v.id)
              const aberto = abertos.has(v.id)
              return (
                <Fragment key={v.id}>
                <tr onClick={() => alternar(v.id)} title={aberto ? 'Fechar vendas' : 'Ver vendas do mês'}
                  className={`border-b cursor-pointer transition-colors ${aberto ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'}`}
                  style={{ borderColor:'rgba(255,255,255,0.05)' }}>
                  <td className="pl-5 pr-0 py-3.5 w-8">
                    <span className="inline-block text-muted text-[11px] transition-transform duration-200"
                      style={{ transform: aberto ? 'rotate(90deg)' : 'none' }}>▶</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {v.foto_url
                      ? <img src={v.foto_url} className="w-9 h-9 rounded-full object-cover border border-white/10" alt={v.nome} />
                      : <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{background:'#282828', color:'rgba(255,255,255,0.3)'}}><IconUser size={16} /></div>
                    }
                  </td>
                  <td className="px-5 py-3.5 text-[13.5px] font-semibold">{v.nome}</td>
                  <td className="px-5 py-3.5 text-[13px] text-muted">{v.empresa || '—'}</td>
                  <td className="px-5 py-3.5">
                    {v.nivel ? <span className="text-[12px] font-bold" style={{color:NIVEL_CORES[v.nivel]||'#fff'}}>{v.nivel}</span> : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    {eq ? <span className="px-2.5 py-1 rounded text-[11px] font-bold text-red border border-red/25" style={{background:'rgba(232,0,13,0.08)'}}>{eq.nome}</span> : <span className="text-dim text-[12px]">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-muted">{minhas.length}</td>
                  <td className="px-5 py-3.5 font-bebas text-[15px] text-red">{fmt(total)}</td>
                  <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <button onClick={() => setEditando(v)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-bold tracking-wide border text-muted border-white/15 hover:text-white hover:border-white/30 transition-colors"
                        style={{background:'#282828'}}>
                        <IconEdit size={12} />Editar
                      </button>
                      <button onClick={() => remover(v.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-bold tracking-wide border text-red border-red/20 hover:bg-red/10 transition-colors"
                        style={{background:'rgba(239,68,68,0.06)'}}>
                        <IconTrash size={12} />Remover
                      </button>
                    </div>
                  </td>
                </tr>
                {aberto && (
                  <tr className="border-b" style={{ borderColor:'rgba(255,255,255,0.05)' }}>
                    <td colSpan={9} className="px-5 pb-5 pt-1" style={{ background:'rgba(255,255,255,0.03)' }}>
                      <VendasDoVendedor vendas={minhas} mes={mes}
                        onEditar={setVendaEditando}
                        onExcluir={id => excluirVenda(id, onRefresh)} />
                    </td>
                  </tr>
                )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <EditarVendaModal venda={vendaEditando} vendedores={vendedores}
        onClose={() => setVendaEditando(null)} onSaved={onRefresh} />

      <EditarVendedorModal vendedor={editando} equipes={equipes}
        onClose={() => setEditando(null)} onSaved={onRefresh} />
    </div>
  )
}
