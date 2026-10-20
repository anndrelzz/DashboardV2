import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Spinner from './components/ui/Spinner'
// Dashboard é a página que a TV abre: vem no pacote principal pra não
// esperar um segundo download. Só o Admin fica sob demanda.
import Dashboard from './pages/Dashboard'

const Admin = lazy(() => import('./pages/Admin'))

function Fallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background:'#080808' }}>
      <Spinner size={40} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route path="/"      element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
