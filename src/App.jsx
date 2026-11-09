import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';

import { AuthContext, AuthProvider } from './context/AuthContext';
import { CarritoProvider } from './context/CarritoContext';
import { PedidosProvider } from './context/PedidosContext';
import { StockProvider } from './context/StockContext';
import { ProductosProvider } from './context/ProductosContext';

import RutaProtegida from './components/RutaProtegida';

import Inicio from './pages/Inicio';
import Productos from './pages/Productos';
import Contacto from './pages/Contacto';
import Registro from './pages/Registro';
import Carrito from './pages/Carrito';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import Checkout from './pages/Checkout';
import MisPedidos from './pages/MisPedidos';

import VendedorPedidos from './pages/VendedorPedidos';
import VendedorStock from './pages/VendedorStock';

import { AdminUsuarios } from './pages/AdminUsuarios'; 
import AdminProductos from './pages/AdminProductos';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

function RedirigirSiLogueado({ children }) {
  const { sesion, usuario, loading } = useContext(AuthContext);
  const location = useLocation();

  // Esperar a que el AuthContext termine de consultar /api/usuarios/me
  if (loading) {
    return <div className="text-center py-5">Cargando...</div>;
  }

  const currentUser = usuario || sesion;

  if (currentUser) {
    const rol = (currentUser.rol || currentUser.role || '').toLowerCase().replace('role_', '');
    
    let rutaPorRol = '/';
    if (rol === 'vendedor') rutaPorRol = '/vendedor';
    if (rol === 'administrador' || rol === 'admin') rutaPorRol = '/admin';

    return <Navigate to={location.state?.from || rutaPorRol} replace />;
  }

  return children;
}

function AppContent() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return <div className="text-center py-5">Cargando aplicación...</div>;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/carrito" element={<Carrito />} />

        <Route path="/registro" element={<RedirigirSiLogueado><Registro /></RedirigirSiLogueado>} />
        <Route path="/login" element={<RedirigirSiLogueado><Login /></RedirigirSiLogueado>} />
        
        <Route
          path="/perfil"
          element={
            <RutaProtegida>
              <Perfil />
            </RutaProtegida>
          }
        />
        <Route
          path="/checkout"
          element={
            <RutaProtegida>
              <Checkout />
            </RutaProtegida>
          }
        />
        <Route
          path="/pedidos"
          element={
            <RutaProtegida rol="cliente" permitirAdminSiempre={false}>
              <MisPedidos />
            </RutaProtegida>
          }
        />
        <Route
          path="/vendedor/pedidos"
          element={
            <RutaProtegida rol="vendedor">
              <VendedorPedidos />
            </RutaProtegida>
          }
        />
        <Route
          path="/vendedor"
          element={
            <RutaProtegida rol="vendedor">
              <VendedorStock />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin"
          element={
            <RutaProtegida rol="administrador">
              <AdminUsuarios />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/productos"
          element={
            <RutaProtegida rol="administrador">
              <AdminProductos />
            </RutaProtegida>
          }
        />
      </Routes>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <PedidosProvider>
          <ProductosProvider>
            <StockProvider>
              <AppContent />
            </StockProvider>
          </ProductosProvider>
        </PedidosProvider>
      </CarritoProvider>
    </AuthProvider>
  );
}