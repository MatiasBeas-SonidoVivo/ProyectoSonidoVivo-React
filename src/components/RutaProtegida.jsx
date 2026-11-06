import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function RutaProtegida({ children, rol, permitirAdminSiempre = true }) {
  const { usuario, sesion, loading } = useContext(AuthContext);
  const location = useLocation();

  const currentUser = usuario || sesion;

  // 1. Mientras se consulta /api/usuarios/me, esperamos
  if (loading) {
    return <div className="text-center py-5">Cargando...</div>;
  }

  // 2. Si no hay usuario logueado, redirigir al Login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 3. Normalizar el rol del usuario desde el backend ("ROLE_CLIENTE" -> "cliente")
  const rolUsuario = (currentUser.rol || currentUser.role || '')
    .toLowerCase()
    .replace('role_', '');

  const esAdmin = rolUsuario === 'administrador' || rolUsuario === 'admin';

  // 4. Si se especificó un rol requerido para la ruta
  if (rol) {
    const rolRequerido = rol.toLowerCase().replace('role_', '');
    const esClienteRequerido = rolRequerido === 'cliente';
    
    // Si la ruta requiere un cliente y el rol actual es cliente (o admin permitido)
    const tieneAcceso = 
      rolUsuario === rolRequerido || 
      (permitirAdminSiempre && esAdmin) ||
      (esClienteRequerido && (rolUsuario === 'cliente' || rolUsuario === 'user'));

    if (!tieneAcceso) {
      // Redirigir según el rol que tenga la persona
      if (rolUsuario === 'vendedor') return <Navigate to="/vendedor" replace />;
      if (esAdmin) return <Navigate to="/admin" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default RutaProtegida;