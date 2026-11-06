import React, { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const API_GATEWAY_URL = 'http://localhost:8501/api';

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      obtenerPerfil(token);
    } else {
      setLoading(false);
    }
  }, []);

  const obtenerPerfil = async (token) => {
    try {
      const response = await fetch(`${API_GATEWAY_URL}/usuarios/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsuario(data);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await fetch(`${API_GATEWAY_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.mensaje || errorData.message || 'Credenciales inválidas');
    }

    const data = await response.json();
    
    if (data.token) {
      localStorage.setItem('jwt_token', data.token);

      if (data.usuario) {
        setUsuario(data.usuario);
      } else if (data.nombre || data.email) {
        setUsuario(data);
      } else {
        await obtenerPerfil(data.token);
      }
    }
    
    return data;
  };

  const registro = async (datosRegistro) => {
    const response = await fetch(`${API_GATEWAY_URL}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosRegistro)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.mensaje || errorData.message || 'Error en el registro');
    }

    return await response.json();
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setUsuario(null);
  };

  // Exportamos tanto `usuario` como `sesion` (apuntando a usuario) para retrocompatibilidad
  return (
    <AuthContext.Provider value={{ usuario, sesion: usuario, loading, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);