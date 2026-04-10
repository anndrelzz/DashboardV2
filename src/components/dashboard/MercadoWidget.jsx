import { useEffect, useState } from 'react'
import { BRAPI_TOKEN } from '../../lib/supabase'

function Item({ nome, valor, variacao }) {
  const cls = variacao >= 0 ? 'text-green-400' : 'text-red'
  const sig = variacao >= 0 ? '+' : ''
  return (
    <div className="flex flex-col gap-0.5 flex-shrink-0">
      <span className="text-[9px] font-bold tracking-[1.5px] uppercase text-muted">{nome}</span>
      <span className={`font-bebas text-lg leading-none ${variacao !== null ? cls : 'text-white'}`}>{valor}</span>
      {variacao !== null && (
        <span className={`text-[10px] font-bold ${cls}`}>{sig}{Number(variacao).toFixed(2)}%</span>
      )}
    </div>
  )
}

function Divider() {
  return <div className="w-px self-stretch mx-1.5" style={{ background: 'rgba(255,255,255,0.08)' }} />
}

export default function MercadoWidget() {
  const [items, setItems] = useState(null)

  const carregar = async () => {
    try {
      const res  = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL,GBP-BRL')
      const d    = await res.json()
      const list = []

      if (d.USDBRL) list.push({ nome:'DÓLAR',   valor:'R$ '+Number(d.USDBRL.bid).toFixed(2), var:Number(d.USDBRL.pctChange) })
      if (d.EURBRL) list.push({ nome:'EURO',    valor:'R$ '+Number(d.EURBRL.bid).toFixed(2), var:Number(d.EURBRL.pctChange) })
      if (d.GBPBRL) list.push({ nome:'LIBRA',   valor:'R$ '+Number(d.GBPBRL.bid).toFixed(2), var:Number(d.GBPBRL.pctChange) })

      if (d.BTCBRL) {
        const btc = Number(d.BTCBRL.bid)
        const btcFmt = btc >= 1000 ? 'R$' + (btc/1000).toFixed(1).replace('.',',')+'K' : 'R$'+btc.toFixed(0)
        list.push({ nome:'BITCOIN', valor:btcFmt, var:Number(d.BTCBRL.pctChange) })
      }

      try {
        const ri = await fetch(`https://brapi.dev/api/quote/%5EBVSP?token=${BRAPI_TOKEN}`)
        const ib = await ri.json()
        if (ib.results?.[0]) {
          const b = ib.results[0]
          list.push({ nome:'IBOV', valor:Number(b.regularMarketPrice).toLocaleString('pt-BR',{maximumFractionDigits:0}), var:b.regularMarketChangePercent })
        }
      } catch {}

      list.push({ nome:'SELIC', valor:'14,75%', var:null })

      setItems(list)
    } catch {
      setItems([])
    }
  }

  useEffect(() => {
    carregar()
    const iv = setInterval(carregar, 15 * 60 * 1000)
    return () => clearInterval(iv)
  }, [])

  return (
    <div className="flex-1 min-w-0 rounded-xl border px-3 py-2 flex flex-col gap-1"
      style={{ background: '#1A1A1A', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <span className="text-[9px] font-bold tracking-[2px] uppercase text-muted">Mercado Financeiro</span>
      <div className="flex gap-0 items-start overflow-x-auto" style={{ scrollbarWidth:'none' }}>
        {items === null && <span className="text-[10px] text-dim tracking-wide">Carregando...</span>}
        {items?.length === 0 && <span className="text-[10px] text-dim tracking-wide">Indisponível</span>}
        {items?.map((it, i) => (
          <div key={i} className="flex items-stretch">
            {i > 0 && <Divider />}
            <Item nome={it.nome} valor={it.valor} variacao={it.var} />
          </div>
        ))}
      </div>
    </div>
  )
}
