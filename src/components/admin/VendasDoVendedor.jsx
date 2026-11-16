import { fmt, fmtDataBR, fmtMesLabel } from '../../lib/utils'
import { TIPOS, tipoInfo } from '../../lib/tiposVenda'
import { IconEdit, IconTrash } from './icons'

// Conteúdo da setinha: resumo por tipo + lista das vendas do mês
export default function VendasDoVendedor({ vendas, mes, onEditar, onExcluir }) {
  if (vendas.length === 0) {
    return (
      <div className="rounded-xl border px-5 py-6 text-center text-muted text-[13px]"
        style={{ background:'#121212', borderColor:'rgba(255,255,255,0.06)' }}>
        Nenhuma venda em {fmtMesLabel(mes)}
      </div>
    )
  }
  const porTipo = TIPOS.map(t => {
    const lista = vendas.filter(v => tipoInfo(v.tipo)?.value === t.value)
    return { ...t, qtd: lista.length, total: lista.reduce((a, b) => a + Number(b.valor), 0) }
  }).filter(t => t.qtd > 0)

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background:'#121212', borderColor:'rgba(255,255,255,0.06)' }}>
      <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
        <span className="text-[10.5px] font-bold tracking-[2px] uppercase text-muted mr-1">{fmtMesLabel(mes)}</span>
        {porTipo.map(t => (
          <span key={t.value} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-bold border"
            style={{ color:t.color, borderColor:t.color + '40', background:t.color + '12' }}>
            <t.Icon size={13} />{t.label} · {t.qtd} · {fmt(t.total)}
          </span>
        ))}
      </div>
      <table className="w-full">
        <tbody>
          {vendas.map(v => {
            const info = tipoInfo(v.tipo)
            return (
              <tr key={v.id} className="border-b last:border-0 hover:bg-white/[0.02]" style={{ borderColor:'rgba(255,255,255,0.04)' }}>
                <td className="px-5 py-2.5 text-[13px] text-muted w-32">{fmtDataBR(v.data)}</td>
                <td className="px-5 py-2.5 text-[13px] w-36">
                  {info
                    ? <span className="inline-flex items-center gap-1.5 font-bold" style={{ color: info.color }}><info.Icon size={14} />{info.label}</span>
                    : '—'}
                </td>
                <td className="px-5 py-2.5 font-bebas text-[16px] text-red w-40">{fmt(v.valor)}</td>
                <td className="px-5 py-2.5 text-[13px] text-muted">{v.descricao || '—'}</td>
                <td className="px-5 py-2.5 w-48">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => onEditar(v)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-bold tracking-wide border text-muted border-white/15 hover:text-white hover:border-white/30 transition-colors">
                      <IconEdit size={12} />Editar
                    </button>
                    <button onClick={() => onExcluir(v.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-bold tracking-wide border text-red border-red/20 hover:bg-red/10 transition-colors"
                      style={{ background:'rgba(239,68,68,0.06)' }}>
                      <IconTrash size={12} />Excluir
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
