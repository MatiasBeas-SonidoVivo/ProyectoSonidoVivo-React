import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function normalizarRol(valor) {
  const limpio = (valor || '').toString().toLowerCase().replace('role_', '').trim();
  if (limpio === 'administrador') return 'admin';
  if (limpio === 'user') return 'cliente';
  return limpio;
}

function RutaProtegida({ children, rol, permitirAdminSiempre = true }) {
  const { usuario, sesion, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  const token = localStorage.getItem('jwt_token');
  const currentUser = usuario || sesion;

  // Si no hay usuario o no hay token JWT, fuera a Login
  if (!currentUser || !token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const rolUsuario = normalizarRol(currentUser.rol || currentUser.role);
  const esAdmin = rolUsuario === 'admin';

  if (rol) {
    const rolRequerido = normalizarRol(rol);

    const tieneAcceso =
      rolUsuario === rolRequerido ||
      (permitirAdminSiempre && esAdmin);

    if (!tieneAcceso) {
      if (rolUsuario === 'vendedor') return <Navigate to="/vendedor" replace />;
      if (esAdmin) return <Navigate to="/admin" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default RutaProtegida;