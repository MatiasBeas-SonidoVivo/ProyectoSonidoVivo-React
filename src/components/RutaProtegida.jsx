import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function RutaProtegida({ children, rol, permitirAdminSiempre = true }) {
  const { usuario, sesion, loading } = useContext(AuthContext);
  const location = useLocation();

  const currentUser = usuario || sesion;

  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center style={{ minHeight: '60vh' }}">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // 2. Si ya terminó de cargar y definitivamente NO hay usuario, ahí sí redirigir a Login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 3. Normalizar rol
  const rolUsuario = (currentUser.rol || currentUser.role || '')
    .toLowerCase()
    .replace('role_', '');

  const esAdmin = rolUsuario === 'administrador' || rolUsuario === 'admin';

  if (rol) {
    const rolRequerido = rol.toLowerCase().replace('role_', '');
    const esClienteRequerido = rolRequerido === 'cliente';

    const tieneAcceso =
      rolUsuario === rolRequerido ||
      (permitirAdminSiempre && esAdmin) ||
      (esClienteRequerido && (rolUsuario === 'cliente' || rolUsuario === 'user'));

    if (!tieneAcceso) {
      if (rolUsuario === 'vendedor') return <Navigate to="/vendedor" replace />;
      if (esAdmin) return <Navigate to="/admin" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default RutaProtegida;