import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Web3Provider } from '@/providers/Web3Provider'
import { Layout } from '@/components/Layout'
import { Toaster } from '@/components/ui/toaster'
import { Products } from '@/pages/Products'
import { Cart } from '@/pages/Cart'
import { Checkout } from '@/pages/Checkout'
import { Dashboard } from '@/pages/Dashboard'
import { Admin } from '@/pages/Admin'
import './App.css'

function App() {
  return (
    <Web3Provider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Layout>
        <Toaster />
      </BrowserRouter>
    </Web3Provider>
  )
}

export default App
