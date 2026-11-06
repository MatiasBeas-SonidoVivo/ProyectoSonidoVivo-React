import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';

function Navbar() {
    // Extraemos usuario (y sesion por si acaso) desde el contexto
    const { usuario, sesion, logout } = useAuth();
    const currentUser = usuario || sesion; // Soporta ambos nombres
    
    const { totalItems } = useCarrito();
    const navigate = useNavigate();

    const [menuAbierto, setMenuAbierto] = useState(false);
    const [dropdownAbierto, setDropdownAbierto] = useState(false);

    // Normalizar rol
    const rolNormalizado = (currentUser?.rol || currentUser?.role || '')
        .toLowerCase()
        .replace('role_', '');

    const esVendedor = rolNormalizado === 'vendedor';
    const esAdmin = rolNormalizado === 'administrador' || rolNormalizado === 'admin';
    const esCliente = rolNormalizado === 'cliente' || (!esVendedor && !esAdmin && !!currentUser);
    const esPersonal = esVendedor || esAdmin;

    const rutaInicio = esVendedor ? '/vendedor' : esAdmin ? '/admin' : '/';

    const cerrarMenus = () => {
        setMenuAbierto(false);
        setDropdownAbierto(false);
    };

    const handleLogout = () => {
        logout();
        cerrarMenus();
        navigate('/');
    };

    const claseNavLink = ({ isActive }) => 'nav-link' + (isActive ? ' active' : '');

    return (
        <nav className="navbar navbar-expand-lg navbar-dark navbar-custom" style={{ position: 'relative', zIndex: 1000 }}>
            <div className="container-fluid">
                <Link className="navbar-brand" to={rutaInicio} onClick={cerrarMenus}>
                    Sonido Vivo
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    aria-label="Toggle navigation"
                    aria-expanded={menuAbierto}
                    onClick={() => setMenuAbierto(!menuAbierto)}
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className={'collapse navbar-collapse' + (menuAbierto ? ' show' : '')}>
                    <ul className="navbar-nav">
                        {esVendedor && (
                            <>
                                <li className="nav-item">
                                    <NavLink className={claseNavLink} to="/vendedor" end onClick={cerrarMenus}>Stock</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className={claseNavLink} to="/vendedor/pedidos" onClick={cerrarMenus}>Pedidos</NavLink>
                                </li>
                            </>
                        )}

                        {esAdmin && (
                            <>
                                <li className="nav-item">
                                    <NavLink className={claseNavLink} to="/admin" end onClick={cerrarMenus}>Usuarios</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className={claseNavLink} to="/admin/productos" onClick={cerrarMenus}>Productos</NavLink>
                                </li>
                            </>
                        )}

                        {!esPersonal && (
                            <>
                                <li className="nav-item">
                                    <NavLink className={claseNavLink} to="/" end onClick={cerrarMenus}>Inicio</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className={claseNavLink} to="/productos" onClick={cerrarMenus}>Productos</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className={claseNavLink} to="/contacto" onClick={cerrarMenus}>Contacto</NavLink>
                                </li>
                            </>
                        )}
                    </ul>

                    <ul className="navbar-nav ms-lg-auto align-items-lg-center">
                        {!esPersonal && (
                            <li className="nav-item mt-2 mt-lg-0 me-lg-3">
                                <Link className="nav-link text-white position-relative" to="/carrito" onClick={cerrarMenus}>
                                    🛒
                                    {totalItems > 0 && (
                                        <span
                                            className="badge rounded-pill"
                                            style={{ position: 'absolute', top: 0, right: '-8px', backgroundColor: 'var(--acento)', fontSize: '0.65rem' }}
                                        >
                                            {totalItems}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        )}

                        {currentUser ? (
                            <li className="nav-item dropdown mt-2 mt-lg-0 position-relative">
                                <a
                                    className="nav-link dropdown-toggle text-white d-flex align-items-center"
                                    href="#"
                                    role="button"
                                    aria-expanded={dropdownAbierto}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setDropdownAbierto(!dropdownAbierto);
                                    }}
                                >
                                    {currentUser.nombre || currentUser.email}
                                </a>
                                <ul 
                                    className={'dropdown-menu dropdown-menu-end' + (dropdownAbierto ? ' show' : '')}
                                    style={{
                                        position: 'absolute',
                                        right: 0,
                                        left: 'auto',
                                        minWidth: '160px',
                                        marginTop: '0.5rem'
                                    }}
                                >
                                    {esCliente && (
                                        <li>
                                            <Link className="dropdown-item" to="/pedidos" onClick={cerrarMenus}>Mis pedidos</Link>
                                        </li>
                                    )}
                                    <li>
                                        <Link className="dropdown-item" to="/perfil" onClick={cerrarMenus}>Mi perfil</Link>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button className="dropdown-item text-danger" type="button" onClick={handleLogout}>
                                            Cerrar sesión
                                        </button>
                                    </li>
                                </ul>
                            </li>
                        ) : (
                            <li className="nav-item mt-2 mt-lg-0">
                                <Link to="/login" className="btn btn-outline-light btn-sm rounded-pill px-3 me-lg-2" onClick={cerrarMenus}>
                                    Iniciar sesión
                                </Link>
                                <Link to="/registro" className="btn btn-accent btn-sm rounded-pill px-3" onClick={cerrarMenus}>
                                    Registrarse
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;