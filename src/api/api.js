import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8501/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('jwt_token');
    if (token) {
      // Limpiamos comillas extra por si acaso y usamos backticks (`)
      token = token.replace(/^"(.*)"$/, '$1').trim();
      config.headers.Authorization = `Bearer ${token}`; 
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('jwt_token');
    }
    return Promise.reject(error);
  }
);

export default api;