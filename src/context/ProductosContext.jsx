import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const ProductosContext = createContext();

export const ProductosProvider = ({ children }) => {
  const [catalogo, setCatalogo] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/productos');
      
      
      const productosConCompatibilidad = res.data.map(prod => ({
        ...prod,
        imagen: prod.imagenUrl || prod.imagen
      }));

      setCatalogo(productosConCompatibilidad);
    } catch (error) {
      console.error('Error al cargar productos desde la API:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  return (
    <ProductosContext.Provider value={{ catalogo, loading, cargarProductos }}>
      {children}
    </ProductosContext.Provider>
  );
};

export const useProductos = () => useContext(ProductosContext);