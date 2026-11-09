import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      obtenerPerfil();
    } else {
      setLoading(false);
    }
  }, []);

  const obtenerPerfil = async () => {
    try {
      const response = await api.get('/usuarios/me');
      setUsuario(response.data);
    } catch (error) {
      console.error('Error al recuperar perfil:', error);
      // Solo si el servidor rechaza explícitamente el token (401 o 403), cerramos sesión
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data; // Retorna { token: "...", usuario: { ... } }

      if (data.token) {
        localStorage.setItem('jwt_token', data.token);

        if (data.usuario) {
          setUsuario(data.usuario);
        } else {
          await obtenerPerfil();
        }
      }
      return data;
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || error.response?.data?.message || 'Credenciales inválidas';
      throw new Error(mensaje);
    }
  };

  const registro = async (datosRegistro) => {
    try {
      const response = await api.post('/auth/registro', datosRegistro);
      return response.data;
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || error.response?.data?.message || 'Error en el registro';
      throw new Error(mensaje);
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setUsuario(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ usuario, sesion: usuario, loading, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);