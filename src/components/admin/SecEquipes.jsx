import { Fragment, useState } from 'react'
import { sb } from '../../lib/supabase'
import { fmt, unidadePadraoId } from '../../lib/utils'
import { toast } from '../../lib/toast'
import { excluirVenda } from '../../lib/excluirVenda'
import SectionHeader from './SectionHeader'
import MesSelector from './MesSelector'
import EquipeDetalhe from './EquipeDetalhe'
import EditarVendaModal from './EditarVendaModal'
import NovaVendaModal from './NovaVendaModal'
import EditarVendedorModal from './EditarVendedorModal'
import AdicionarIntegranteModal from './AdicionarIntegranteModal'
import { IconEquipes, IconTrash } from './icons'

const inputCls = "rounded-lg px-4 py-2.5 text-white text-sm outline-none border border-white/10 focus:border-red/40 transition-colors"
const inputBg  = { background:'#1F1F1F' }

export default function SecEquipes({ equipes, vendedores, unidades = [], mesAtual, consulta }) {
  // Vendas do mês escolhido no seletor (padrão: mês atual). recarregar atualiza
  // o store (equipes, unidades...) e o mês que estiver na tela.
  const { vendas, mes, trocarMes, loading: loadingMes, recarregar: onRefresh } = consulta

  const [abertas, setAbertas]           = useState(() => new Set())
  const [vendaEditando, setVendaEditando] = useState(null)
  const [novaVendaPara, setNovaVendaPara] = useState(null)
  const [vendedorEditando, setVendedorEditando] = useState(null)
  const [adicionarEm, setAdicionarEm] = useState(null) // equipe recebendo integrante
  const alternar = (id) => setAbertas(prev => {
    const n = new Set(prev)
    if (n.has(id)) n.delete(id); else n.add(id)
    return n
  })

  const [nome, setNome]       = useState('')
  const [uniId, setUniId]     = useState('')
  const [saving, setSaving]   = useState(false)
  const [novaUni, setNovaUni] = useState('')
  const [savingUni, setSavingUni] = useState(false)

  const temUnidades = unidades.length > 0
  // Coluna gestor_id só existe depois do SQL sql/2026-11-gestor-equipe.sql
  const temGestor   = equipes.some(e => 'gestor_id' in e)
  const padraoId    = unidadePadraoId(unidades)
  const nomeUni     = id => unidades.find(u => u.id === id)?.nome

  const cadastrar = async () => {
    if (!nome.trim()) { toast('Informe o nome', false); return }
    setSaving(true)
    const { error } = await sb.from('equipes').insert({ nome: nome.trim(), ...(uniId ? { unidade_id: uniId } : {}) })
    setSaving(false)
    if (error) { toast('Equipe já existe ou erro ao cadastrar', false); return }
    setNome('')
    await onRefresh()
    toast('Equipe cadastrada!')
  }

  const trocarUnidade = async (equipeId, unidadeId) => {
    // .select() devolve as linhas alteradas: se a regra de acesso (RLS) bloquear,
    // o Supabase não dá erro, só não altera nada — por isso confere a quantidade
    const { data, error } = await sb.from('equipes').update({ unidade_id: unidadeId || null }).eq('id', equipeId).select('id')
    if (error) { console.error(error); toast(`Erro ao mudar a unidade: ${error.message}`, false); return }
    if (!data?.length) { toast('O banco não deixou alterar a equipe (permissão de update)', false); return }
    await onRefresh()
    toast('Unidade atualizada')
  }

  const trocarGestor = async (equipeId, vendedorId) => {
    const { data, error } = await sb.from('equipes').update({ gestor_id: vendedorId || null }).eq('id', equipeId).select('id')
    if (error) { console.error(error); toast(`Erro ao definir o gestor: ${error.message}`, false); return }
    if (!data?.length) { toast('O banco não deixou alterar a equipe (permissão de update)', false); return }
    await onRefresh()
    toast(vendedorId ? 'Gestor definido' : 'Equipe sem gestor')
  }

  const remover = async (id) => {
    if (!confirm('Remover equipe? Os vendedores ficarão sem equipe.')) return
    // Se desvincular os vendedores falhar, não apaga a equipe (senão ficariam
    // apontando pra uma equipe que não existe mais)
    const r1 = await sb.from('vendedores').update({ equipe_id: null }).eq('equipe_id', id)
    if (r1.error) { toast('Erro ao desvincular vendedores da equipe', false); return }
    const r2 = await sb.from('equipes').delete().eq('id', id)
    if (r2.error) { toast('Erro ao remover equipe (vendedores já ficaram sem equipe)', false); await onRefresh(); return }
    await onRefresh()
    toast('Equipe removida')
  }

  const cadastrarUnidade = async () => {
    if (!novaUni.trim()) { toast('Informe o nome da unidade', false); return }
    setSavingUni(true)
    const ordem = Math.max(0, ...unidades.map(u => u.ordem ?? 0)) + 1
    const { error } = await sb.from('unidades').insert({ nome: novaUni.trim(), ordem })
    setSavingUni(false)
    if (error) { toast('Unidade já existe ou erro ao cadastrar', false); return }
    setNovaUni('')
    await onRefresh()
    toast('Unidade cadastrada!')
  }

  const removerUnidade = async (u) => {
    const qtd = equipes.filter(e => e.unidade_id === u.id).length
    if (!confirm(`Remover a unidade ${u.nome}?${qtd ? ` As ${qtd} equipe(s) dela passam a contar como ${nomeUni(padraoId)}.` : ''}`)) return
    const { error } = await sb.from('unidades').delete().eq('id', u.id)
    if (error) { toast('Erro ao remover unidade', false); return }
    await onRefresh()
    toast('Unidade removida')
  }

  return (
    <div className="p-10 flex flex-col gap-8">
      <SectionHeader icon={<IconEquipes size={20} />} title="Equipes" subtitle="Cadastre e gerencie equipes e unidades" />

      <div className="rounded-2xl border overflow-hidden" style={{ background:'#161616', borderColor:'rgba(255,255,255,0.07)' }}>
        <div className="px-6 py-4.5 border-b" style={{ borderColor:'rgba(255,255,255,0.07)' }}>
          <span className="font-cond font-bold text-sm tracking-[2px] uppercase">Cadastrar Equipe</span>
        </div>
        <div className="p-6 flex gap-4 items-end">
          <div className="flex flex-col gap-1.5 flex-1 max-w-sm">
            <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Nome da Equipe</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && cadastrar()}
              placeholder="Ex: Equipe Alfa" className={inputCls} style={inputBg} />
          </div>
          {temUnidades && (
            <div className="flex flex-col gap-1.5 w-64">
              <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Unidade</label>
              <select value={uniId} onChange={e => setUniId(e.target.value)} className={inputCls} style={inputBg}>
                <option value="">{nomeUni(padraoId)} (padrão)</option>
                {unidades.filter(u => u.id !== padraoId).map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </select>
            </div>
          )}
          <button onClick={cadastrar} disabled={saving}
            className="px-6 py-2.5 rounded-lg font-cond font-bold text-[13px] tracking-[2px] uppercase text-white disabled:opacity-60"
            style={{ background:'#E8000D' }}>
            {saving ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background:'#161616', borderColor:'rgba(255,255,255,0.07)' }}>
        <div className="px-6 py-4.5 border-b flex items-center justify-between gap-4" style={{ borderColor:'rgba(255,255,255,0.07)' }}>
          <span className="font-cond font-bold text-sm tracking-[2px] uppercase">Lista de Equipes</span>
          <MesSelector mes={mes} mesAtual={mesAtual} onChange={trocarMes} loading={loadingMes} />
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ background:'#1c1c1c' }}>
              {['', 'Nome da Equipe', ...(temUnidades ? ['Unidade'] : []), ...(temGestor ? ['Gestor'] : []), 'Membros','Total no Mês',''].map((h, i) => (
                <th key={i} className="text-left px-6 py-3.5 text-[10.5px] font-bold tracking-[2px] uppercase text-muted border-b"
                  style={{ borderColor:'rgba(255,255,255,0.07)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {equipes.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-14 text-muted text-[13px] tracking-wider uppercase">Nenhuma equipe cadastrada</td></tr>
            ) : equipes.map(e => {
              const membros = vendedores.filter(v => v.equipe_id === e.id)
              const idsMembros = new Set(membros.map(m => m.id))
              const total   = vendas.filter(v => idsMembros.has(v.vendedor_id)).reduce((a,b) => a+Number(b.valor), 0)
              const aberta  = abertas.has(e.id)
              const colunas = 5 + (temUnidades ? 1 : 0) + (temGestor ? 1 : 0)
              return (
                <Fragment key={e.id}>
                <tr onClick={() => alternar(e.id)} title={aberta ? 'Fechar integrantes' : 'Ver integrantes e vendas do mês'}
                  className={`border-b cursor-pointer transition-colors ${aberta ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'}`}
                  style={{ borderColor:'rgba(255,255,255,0.05)' }}>
                  <td className="pl-6 pr-0 py-3.5 w-8">
                    <span className="inline-block text-muted text-[11px] transition-transform duration-200"
                      style={{ transform: aberta ? 'rotate(90deg)' : 'none' }}>▶</span>
                  </td>
                  <td className="px-6 py-3.5 text-[13.5px] font-semibold">{e.nome}</td>
                  {temUnidades && (
                    <td className="px-6 py-3" onClick={ev => ev.stopPropagation()}>
                      <select value={e.unidade_id || ''} onChange={ev => trocarUnidade(e.id, ev.target.value)}
                        className="rounded-lg px-3 py-1.5 text-white text-[13px] outline-none border border-white/10 focus:border-red/40"
                        style={inputBg}>
                        <option value="">{nomeUni(padraoId)} (padrão)</option>
                        {unidades.filter(u => u.id !== padraoId).map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                      </select>
                    </td>
                  )}
                  {temGestor && (
                    <td className="px-6 py-3" onClick={ev => ev.stopPropagation()}>
                      <select value={e.gestor_id || ''} onChange={ev => trocarGestor(e.id, ev.target.value)}
                        className="rounded-lg px-3 py-1.5 text-[13px] outline-none border border-white/10 focus:border-red/40 max-w-[220px]"
                        style={{ ...inputBg, color: e.gestor_id ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                        <option value="">Sem gestor</option>
                        {membros.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                        {/* gestor que saiu da equipe continua aparecendo até trocar */}
                        {e.gestor_id && !membros.some(m => m.id === e.gestor_id) && vendedores.find(v => v.id === e.gestor_id) && (
                          <option value={e.gestor_id}>{vendedores.find(v => v.id === e.gestor_id).nome} (outra equipe)</option>
                        )}
                      </select>
                    </td>
                  )}
                  <td className="px-6 py-3.5 text-[13px] text-muted">{membros.length} membro(s)</td>
                  <td className="px-6 py-3.5 font-bebas text-[15px] text-red">{fmt(total)}</td>
                  <td className="px-6 py-3.5" onClick={ev => ev.stopPropagation()}>
                    <button onClick={() => remover(e.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-bold tracking-wide border text-red border-red/20 hover:bg-red/10 transition-colors"
                      style={{background:'rgba(239,68,68,0.06)'}}>
                      <IconTrash size={12} />Remover
                    </button>
                  </td>
                </tr>
                {aberta && (
                  <tr className="border-b" style={{ borderColor:'rgba(255,255,255,0.05)' }}>
                    <td colSpan={colunas} className="px-6 pb-5 pt-1" style={{ background:'rgba(255,255,255,0.03)' }}>
                      <EquipeDetalhe equipe={e} membros={membros} vendas={vendas} mes={mes}
                        onEditar={setVendaEditando}
                        onExcluir={id => excluirVenda(id, onRefresh)}
                        onNovaVenda={setNovaVendaPara}
                        onEditarVendedor={setVendedorEditando}
                        onAdicionar={() => setAdicionarEm(e)} />
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
      <NovaVendaModal vendedor={novaVendaPara}
        onClose={() => setNovaVendaPara(null)} onSaved={onRefresh} />
      <EditarVendedorModal vendedor={vendedorEditando} equipes={equipes}
        onClose={() => setVendedorEditando(null)} onSaved={onRefresh} />
      <AdicionarIntegranteModal equipe={adicionarEm} equipes={equipes} vendedores={vendedores}
        onClose={() => setAdicionarEm(null)} onSaved={onRefresh} />

      {/* Unidades */}
      <div className="rounded-2xl border overflow-hidden" style={{ background:'#161616', borderColor:'rgba(255,255,255,0.07)' }}>
        <div className="px-6 py-4.5 border-b" style={{ borderColor:'rgba(255,255,255,0.07)' }}>
          <span className="font-cond font-bold text-sm tracking-[2px] uppercase">Unidades</span>
        </div>
        {!temUnidades ? (
          <p className="px-6 py-6 text-[13px] text-muted">
            Tabela de unidades ainda não criada no Supabase (rodar <code className="text-white">sql/2026-11-unidades.sql</code>).
          </p>
        ) : (
          <div className="p-6 flex flex-col gap-5">
            <div className="flex flex-wrap gap-2.5">
              {unidades.map(u => (
                <span key={u.id} className="inline-flex items-center gap-2 pl-3.5 pr-1.5 py-1.5 rounded-lg border text-[13px] font-semibold"
                  style={{ background:'#1F1F1F', borderColor:'rgba(255,255,255,0.1)' }}>
                  {u.nome}
                  {u.id === padraoId
                    ? <span className="text-[10px] font-bold tracking-wide uppercase text-muted px-1.5">padrão</span>
                    : <button onClick={() => removerUnidade(u)} title="Remover unidade"
                        className="w-6 h-6 flex items-center justify-center rounded text-muted hover:text-red hover:bg-red/10 transition-colors">
                        <IconTrash size={12} />
                      </button>}
                </span>
              ))}
            </div>
            <div className="flex gap-3 items-center">
              <input type="text" value={novaUni} onChange={e => setNovaUni(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && cadastrarUnidade()}
                placeholder="Nova unidade" className={`${inputCls} w-72`} style={inputBg} />
              <button onClick={cadastrarUnidade} disabled={savingUni}
                className="px-5 py-2.5 rounded-lg font-cond font-bold text-[12px] tracking-[2px] uppercase border text-muted hover:text-white hover:border-white/25 transition-colors disabled:opacity-60"
                style={{ background:'#1F1F1F', borderColor:'rgba(255,255,255,0.1)' }}>
                {savingUni ? 'Salvando...' : 'Adicionar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
