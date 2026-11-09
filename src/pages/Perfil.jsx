import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

function Perfil() {
    const { usuario, sesion, setUsuario, logout, loading } = useAuth();
    const navigate = useNavigate();

    const currentUser = usuario || sesion;

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [telefono, setTelefono] = useState('');
    
    // Campos de contraseña
    const [passwordActual, setPasswordActual] = useState('');
    const [passwordNueva, setPasswordNueva] = useState('');
    const [passwordConfirmar, setPasswordConfirmar] = useState('');
    
    const [cargandoEnvio, setCargandoEnvio] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    useEffect(() => {
        if (currentUser) {
            setNombre(currentUser.nombre || currentUser.name || '');
            setApellido(currentUser.apellido || '');
            setTelefono(currentUser.telefono || '');
        }
    }, [currentUser]);

    const handleGuardarCambios = async (e) => {
        e.preventDefault();
        setMensaje({ tipo: '', texto: '' });

        if (passwordNueva && passwordNueva !== passwordConfirmar) {
            setMensaje({ tipo: 'danger', texto: 'Las contraseñas nuevas no coinciden.' });
            return;
        }

        if (passwordNueva && !passwordActual) {
            setMensaje({ tipo: 'danger', texto: 'Debes ingresar tu contraseña actual para cambiarla.' });
            return;
        }

        try {
            setCargandoEnvio(true);

            // 1. Petición PUT para actualizar datos del perfil
            const response = await api.put('/usuarios/me', {
                nombre,
                apellido,
                telefono,
            });

            if (setUsuario) {
                setUsuario(response.data);
            }

            // 2. Petición PATCH para cambiar contraseña si ingresó una nueva
            if (passwordNueva && passwordActual) {
                await api.patch('/usuarios/me/password', {
                    passwordActual: passwordActual,
                    passwordNueva: passwordNueva,
                });
            }

            setPasswordActual('');
            setPasswordNueva('');
            setPasswordConfirmar('');
            setMensaje({ tipo: 'success', texto: 'Perfil actualizado correctamente.' });
        } catch (error) {
            console.error('Error al actualizar el perfil:', error);
            setMensaje({
                tipo: 'danger',
                texto: error.response?.data?.mensaje || error.response?.data?.errores?.passwordActual || error.message || 'Error al actualizar el perfil.',
            });
        } finally {
            setCargandoEnvio(false);
        }
    };

    const handleCerrarSesion = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #2c2b36, #d5d3dc)' }}>
                <div className="text-white fw-bold fs-5">Cargando perfil...</div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #2c2b36, #d5d3dc)' }}>
                <div className="card shadow-lg border-0 rounded-4 p-4 text-center" style={{ maxWidth: '400px' }}>
                    <p className="mb-3 fw-semibold">No has iniciado sesión.</p>
                    <button className="btn btn-accent" onClick={() => navigate('/login')}>
                        Ir al Login
                    </button>
                </div>
            </div>
        );
    }

    const rolMostrar = (currentUser.rol || currentUser.role || 'CLIENTE')
        .replace('ROLE_', '')
        .toUpperCase();

    return (
        <div 
            className="min-vh-100 d-flex align-items-center justify-content-center py-5"
            style={{ background: 'linear-gradient(135deg, #2c2b36, #d5d3dc)' }}
        >
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6">
                        <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 bg-white">
                            <h2 className="mb-4 text-center fw-bold text-dark">Perfil de Usuario</h2>

                            {mensaje.texto && (
                                <div className={`alert alert-${mensaje.tipo} py-2 small rounded-3`} role="alert">
                                    {mensaje.texto}
                                </div>
                            )}

                            <form onSubmit={handleGuardarCambios}>
                                <div className="row g-3 mb-3">
                                    <div className="col-md-6">
                                        <label htmlFor="nombre" className="form-label text-secondary small fw-semibold">Nombre</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="nombre"
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="apellido" className="form-label text-secondary small fw-semibold">Apellido</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="apellido"
                                            value={apellido}
                                            onChange={(e) => setApellido(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label text-secondary small fw-semibold">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        className="form-control bg-light"
                                        id="email"
                                        value={currentUser.email || ''}
                                        disabled
                                    />
                                    <div className="form-text small">El correo no se puede modificar.</div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label text-muted mb-1 small fw-semibold">Rol Actual</label>
                                    <div>
                                        <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#c8327b' }}>
                                            {rolMostrar}
                                        </span>
                                    </div>
                                </div>

                                <hr className="my-4" />

                                <p className="small text-muted mb-3">
                                    Deja los campos de contraseña en blanco si no deseas cambiarla.
                                </p>

                                {/* Campo Contraseña Actual */}
                                <div className="mb-3">
                                    <label htmlFor="passwordActual" className="form-label text-secondary small fw-semibold">Contraseña Actual</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="passwordActual"
                                        placeholder="••••••••"
                                        value={passwordActual}
                                        onChange={(e) => setPasswordActual(e.target.value)}
                                    />
                                </div>

                                {/* Campo Nueva Contraseña */}
                                <div className="mb-3">
                                    <label htmlFor="passwordNueva" className="form-label text-secondary small fw-semibold">Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="passwordNueva"
                                        placeholder="••••••••"
                                        value={passwordNueva}
                                        onChange={(e) => setPasswordNueva(e.target.value)}
                                    />
                                </div>

                                {/* Campo Confirmar Nueva Contraseña */}
                                <div className="mb-4">
                                    <label htmlFor="passwordConfirmar" className="form-label text-secondary small fw-semibold">Confirmar Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="passwordConfirmar"
                                        placeholder="••••••••"
                                        value={passwordConfirmar}
                                        onChange={(e) => setPasswordConfirmar(e.target.value)}
                                    />
                                </div>

                                <div className="d-flex justify-content-between align-items-center mt-4">
                                    <button 
                                        type="submit" 
                                        className="btn btn-accent rounded-pill px-4" 
                                        disabled={cargandoEnvio}
                                    >
                                        {cargandoEnvio ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCerrarSesion}
                                        className="btn btn-outline-danger rounded-pill px-4"
                                    >
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Perfil;