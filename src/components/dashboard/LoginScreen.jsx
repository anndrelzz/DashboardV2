import { useState } from 'react'
import { sb } from '../../lib/supabase'

const LOGO = (
  <svg height="70" viewBox="0 0 1606 1126" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1407.16 985.975C1378.74 1032.88 1329.4 1065.4 1272.17 1070.05H1022.27C975.625 1070.05 976.675 1029.48 976.675 1029.48V754.798C977.201 712.394 1016.89 712.289 1016.89 712.289L1424.45 712.394C1475.45 712.394 1508.74 704.559 1530.44 694.479L1407.18 985.993L1407.16 985.975ZM648.47 124.844C648.47 124.844 604.296 69.8195 542.831 67.8562C542.831 67.8562 572.549 56.4621 600.779 55.9187H945.4C945.4 55.9187 1001.91 55.1299 1035.57 93.0284L1509.86 572.51C1577.27 652.724 1453.98 655.213 1453.98 655.213H1102.95L648.47 124.844ZM469.43 655.196H132.754C132.754 655.196 19.1165 658.912 84.4146 572.51L456.076 137.097C456.076 137.097 520.499 67.6108 607.569 159.307L754.232 329.71L469.43 655.178V655.196ZM583.12 712.289C583.12 712.289 622.813 712.394 623.338 754.798V1029.48C623.338 1029.48 624.388 1070.05 577.712 1070.05H332.988C273.483 1067.07 221.959 1033.99 192.679 985.625L69.5558 694.462C91.2752 704.559 124.563 712.394 175.597 712.394L583.137 712.289H583.12ZM1573.46 559.608C1572.39 558.574 1571.53 557.382 1570.48 556.33L1077.34 55.0423C1028.74 1.54258 956.129 0.105176 945.208 0H599.711C562.433 0.718705 526.275 14.4092 522.179 15.7414C470.077 32.6572 429.491 81.5292 426.359 84.9299C425.764 85.596 425.169 86.2621 424.591 86.9457L26.5897 559.538C25.9421 560.309 25.3471 561.081 24.7345 561.869C-22.922 621.978 12.0634 704.19 17.0164 715.935L140.139 1007.12C141.189 1009.59 142.397 1011.97 143.797 1014.25C183.806 1080.34 253.461 1122.09 330.083 1125.93C331.028 1125.98 331.991 1126 332.971 1126H577.712C615.917 1126 639.544 1110.26 652.618 1097.06C678.293 1071.15 680.218 1038.74 680.218 1029.48V754.114C679.413 690.763 629.674 656.475 583.102 656.335H548.327L789.13 375.672L1029.76 656.335H1016.72C970.305 656.475 920.548 690.78 919.778 754.114C919.761 754.36 919.761 754.587 919.761 754.78V1029.47C919.761 1038.72 921.703 1071.13 947.343 1097.04C960.434 1110.24 984.061 1125.98 1022.25 1125.98H1272.17C1273.69 1125.98 1275.27 1125.91 1276.83 1125.79C1350.44 1119.85 1417.43 1078.27 1456.01 1014.6C1457.39 1012.3 1458.61 1009.92 1459.66 1007.45L1582.93 715.935C1588.06 703.84 1637.58 622.03 1573.44 559.591" fill="#E8000D"/>
  </svg>
)

export default function LoginScreen({ onLogin }) {
  const [email, setEmail]       = useState('')
  const [senha, setSenha]       = useState('')
  const [erro, setErro]         = useState('')
  const [loading, setLoading]   = useState(false)

  const entrar = async () => {
    if (!email || !senha) return
    setLoading(true); setErro('')
    const { error } = await sb.auth.signInWithPassword({ email, password: senha })
    setLoading(false)
    if (error) {
      console.error('Auth error:', error)
      setErro(error.message || 'E-mail ou senha incorretos')
      return
    }
    sessionStorage.setItem('vendamax_dash_auth', '1')
    onLogin()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background:'#0A0A0A' }}>
      <div className="flex flex-col gap-5 w-[360px] rounded-2xl border border-white/10 border-t-4 border-t-red p-10"
        style={{ background:'#111111' }}>
        <div className="flex justify-center">{LOGO}</div>
        <p className="text-center text-[11px] font-bold tracking-[2px] uppercase text-muted -mt-3">
          Dashboard de Vendas
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && document.getElementById('senha-input').focus()}
              placeholder="seu@email.com"
              className="rounded-lg px-3.5 py-3 text-[15px] text-white outline-none border border-white/10 focus:border-red/40 transition-colors"
              style={{ background:'#1A1A1A' }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Senha</label>
            <input
              id="senha-input"
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && entrar()}
              placeholder="••••••••"
              className="rounded-lg px-3.5 py-3 text-[15px] text-white outline-none border border-white/10 focus:border-red/40 transition-colors"
              style={{ background:'#1A1A1A' }}
            />
          </div>
        </div>

        {erro && (
          <div className="text-center text-[12px] font-semibold text-red py-2.5 px-3 rounded-lg border border-red/20"
            style={{ background:'rgba(232,0,13,0.08)' }}>
            {erro}
          </div>
        )}

        <button
          onClick={entrar}
          disabled={loading}
          className="w-full py-3.5 rounded-lg font-cond font-bold text-[15px] tracking-[2px] uppercase text-white transition-colors disabled:opacity-60"
          style={{ background: loading ? '#9B0009' : '#E8000D' }}
        >
          {loading ? 'Autenticando...' : 'Entrar'}
        </button>

        <p className="text-center text-[11px] text-dim">América Imóveis © 2026</p>
      </div>
    </div>
  )
}
