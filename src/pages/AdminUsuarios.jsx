import React, { useState, useEffect } from 'react';
import api from '../api/api';

export const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/usuarios');
      setUsuarios(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError(err.response?.data?.mensaje || 'Error al conectar con el servidor');
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleCambiarActivo = async (id, estadoActual) => {
    try {
      await api.patch(`/usuarios/${id}/activo?activo=${!estadoActual}`);
      cargarUsuarios(); // Recargar la lista tras actualizar
    } catch (err) {
      alert('Error al cambiar el estado del usuario');
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2 text-muted">Cargando usuarios del sistema...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Gestión de Usuarios</h2>
          <p className="text-muted small mb-0">
            Administración centralizada de cuentas y permisos
          </p>
        </div>
        <span className="badge bg-primary fs-6 px-3 py-2 rounded-pill">
          Total: {usuarios?.length || 0} usuarios
        </span>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light border-bottom">
                <tr>
                  <th className="ps-4">ID</th>
                  <th>Usuario</th>
                  <th>Correo Electrónico</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th className="text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(usuarios) && usuarios.length > 0 ? (
                  usuarios.map((user) => (
                    <tr key={user.id}>
                      <td className="ps-4 fw-bold text-secondary">#{user.id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-3 fw-bold"
                            style={{ width: '40px', height: '40px' }}
                          >
                            {(user.nombre?.[0] || 'U').toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">
                              {user.nombre} {user.apellido}
                            </div>
                            {user.telefono && (
                              <small className="text-muted">{user.telefono}</small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-muted">{user.email}</td>
                      <td>
                        <span
                          className={`badge px-2 py-1 ${
                            user.rol === 'ADMINISTRADOR' || user.rol === 'ROLE_ADMINISTRADOR'
                              ? 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25'
                              : user.rol === 'VENDEDOR' || user.rol === 'ROLE_VENDEDOR'
                              ? 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25'
                              : 'bg-info bg-opacity-10 text-info border border-info border-opacity-25'
                          }`}
                        >
                          {user.rol}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge rounded-pill ${
                            user.activo ? 'bg-success' : 'bg-secondary'
                          }`}
                        >
                          {user.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button
                          className={`btn btn-sm ${
                            user.activo ? 'btn-outline-danger' : 'btn-outline-success'
                          }`}
                          onClick={() => handleCambiarActivo(user.id, user.activo)}
                        >
                          {user.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      No se encontraron usuarios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsuarios;