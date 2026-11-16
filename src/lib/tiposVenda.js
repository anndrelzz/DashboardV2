import { IconHome, IconCar, IconWrench } from '../components/admin/icons'

export const TIPOS = [
  { value:'Imovel',  label:'Imóvel',  Icon:IconHome,   color:'#E8000D' },
  { value:'Veiculo', label:'Veículo', Icon:IconCar,    color:'#60A5FA' },
  { value:'Serviço', label:'Serviço', Icon:IconWrench, color:'#FFD60A' },
]

// Vendas antigas foram gravadas como 'Servico' (sem cedilha)
export const tipoInfo = (t) => TIPOS.find(x => x.value === t || (x.value === 'Serviço' && t === 'Servico')) || null
