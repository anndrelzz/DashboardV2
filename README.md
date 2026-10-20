# Dashboard de Vendas — Ademicon Joinville América

Painel de vendas em tempo real feito para ficar ligado numa **TV da sala de vendas**. Mostra o ranking de vendedores e equipes, o progresso da meta do mês e comemora cada venda nova na hora em que ela é lançada.

Tem também um **painel administrativo**, onde a gestão lança vendas, cadastra vendedores e equipes, define metas e confere os números.

---

## O que ele faz

### Tela da TV (`/`)

| Aba | Conteúdo |
|---|---|
| **Vendedores** | Ranking individual com foto, nível e total vendido, além do gráfico de barras |
| **Equipes** | Ranking por equipe e participação de cada uma no total |
| **Semana do Fechamento** | Vendas de cada equipe dia a dia na semana configurada, com meta e barra de progresso. Só aparece quando a semana está definida |

- As abas **alternam sozinhas** a cada 2 minutos.
- No topo ficam a meta do mês, o total vendido, o percentual atingido, o resumo por categoria (Imóvel, Veículo e Serviço) e um widget de mercado (dólar, euro, libra, bitcoin e Ibovespa).
- A tela tem **dois modos**:
  - **Dia-Dia**: mostra o mês inteiro.
  - **Fechamento**: mostra só as vendas do dia do fechamento, com meta própria e visual laranja/fogo.
- A cada venda nova aparece um **card de comemoração** com fogos, foto do vendedor e o quanto a venda empurrou a meta.

### Painel administrativo (`/admin`)

| Seção | Para quê |
|---|---|
| Resumo | Visão geral do mês |
| Desempenho Equipes | Comparativo entre equipes |
| Metas | Meta do mês, meta do dia do fechamento e datas e meta da Semana do Fechamento (qualquer mês) |
| Ranking da Semana | Ranking por vendedor dentro da Semana do Fechamento |
| Lançar Venda | Lançar, editar e remover vendas |
| Vendedores | Cadastro com foto, nível e equipe |
| Equipes | Cadastro de equipes |
| Conferência | Compara o total lançado de cada vendedor com o valor que ele informou e lança a diferença |

---

## Stack

- **React 19** + **Vite 8** para a interface e o build
- **Tailwind CSS 3** para o estilo
- **Zustand** para o estado global, num único store
- **Supabase** para banco Postgres, autenticação, realtime e storage das fotos
- **Chart.js** (react-chartjs-2) para os gráficos
- **Framer Motion** para as animações
- **Vitest** para os testes das regras de negócio
- Deploy na **Vercel**

---

## Estrutura

```
src/
├── pages/
│   ├── Dashboard.jsx      # Tela da TV: abas, modos, realtime, comemoração
│   └── Admin.jsx          # Painel administrativo (troca de seções)
├── components/
│   ├── dashboard/         # Peças da TV (abas, navbar, card de comemoração, KeepAwake…)
│   ├── admin/             # Uma seção do admin por arquivo (Sec*.jsx) + sidebar
│   └── ui/                # Modal, Spinner, Toast
├── store/
│   └── useStore.js        # Carrega tudo do Supabase e guarda em cache local
└── lib/
    ├── supabase.js        # Cliente do Supabase
    ├── utils.js           # Regras de negócio: datas, filtros, formatação, conferência
    ├── utils.test.js      # Testes dessas regras
    └── toast.js           # Avisos do admin
```

---

## Dados (Supabase)

| Tabela | Conteúdo |
|---|---|
| `vendas` | Vendedor, valor, tipo (Imóvel, Veículo ou Serviço), data, mês e descrição |
| `vendedores` | Nome, equipe, nível (Prévia, AUT., Pleno ou Sênior), empresa e foto |
| `equipes` | Times de vendas |
| `metas` | Meta de cada mês |
| `meta_fechamento` | Meta do dia do fechamento |
| `semana_fechamento` | Início, fim e meta da Semana do Fechamento de cada mês |

As fotos dos vendedores ficam no bucket `fotos-vendedores` do Storage.

**Acesso:** todas as tabelas têm Row Level Security. Usuários autenticados podem ler, e só administradores podem gravar (função `public.is_admin()`). Não existe acesso anônimo. Toda tabela nova precisa receber as mesmas regras.

---

## Decisões importantes

Pontos que não são óbvios lendo o código pela primeira vez:

- **Datas sempre no fuso local.** Nunca use `toISOString()` para obter "a data de hoje". Ele converte para UTC, e em Joinville, a partir das 21h, já devolve o dia seguinte. Use `toISODateLocal()` de `lib/utils.js`.
- **O dia do fechamento vai até as 4h da manhã.** A equipe costuma lançar vendas depois da meia-noite, então antes das 4h o modo Fechamento ainda conta o dia anterior (`getDiaFechamento()`).
- **Atualização em tempo real, com economia de banco.** A TV escuta mudanças do Supabase pelo realtime. Rajadas de eventos (como apagar vendas em lote) viram uma única recarga, com debounce de 1 s. Também há uma recarga quando a conexão volta e uma de segurança a cada 1 hora. Isso existe para caber no limite de Disk IO do plano Free.
- **Abertura instantânea.** O último resultado do mês fica no `localStorage`. A tela abre com ele e atualiza em segundo plano. O cache é apagado no logout e quando não há sessão.
- **A TV não pode dormir.** O navegador da TV apaga a tela por inatividade. O `KeepAwake` mantém um vídeo invisível tocando e pede Wake Lock, e a rotação de abas mantém a tela em movimento.

---

## Desenvolvimento

Requer Node 20 ou mais recente.

```bash
npm install
cp .env.example .env   # preencher com os dados do projeto Supabase
npm run dev            # servidor local
npm test               # testes das regras de negócio
npm run lint
npm run build
```

Variáveis de ambiente (ver `.env.example`):

| Variável | Uso |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_KEY` | Chave pública (`anon`) do Supabase |
| `VITE_BRAPI_TOKEN` | Token da brapi para o widget de mercado (IBOV) |

O deploy na Vercel é automático a cada push na `main`. O `vercel.json` redireciona todas as rotas para o `index.html`, que é o que faz `/admin` funcionar.
