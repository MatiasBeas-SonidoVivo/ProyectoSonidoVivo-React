import { Link, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

function Registro() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const { registro } = useAuth(); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validación sencilla de contraseñas en el cliente
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            await registro({ nombre, email, password });
            alert('¡Cuenta creada exitosamente!');
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Error al registrar el usuario');
        }
    };

    return (
        <section className="auth-bg">
            <div className="auth-card">

                <div className="brand">Sonido Vivo</div>

                <form id="formRegistro" onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="nombre" className="form-label">Nombre completo</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            id="nombre" 
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Correo electrónico</label>
                        <input 
                            type="email" 
                            className="form-control" 
                            id="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Contraseña</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            id="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div className="form-text">Mínimo 6 caracteres, con mayúscula, minúscula y número.</div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="confirmPassword" className="form-label">Confirmar contraseña</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            id="confirmPassword" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div id="registroError" className="alert alert-danger py-2 small" role="alert">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-accent">Crear cuenta</button>
                </form>

                <p className="text-center mt-3 auth-switch">
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
                </p>

            </div>
        </section>
    );
}

export default Registro;