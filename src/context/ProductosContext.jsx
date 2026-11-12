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

  const agregarProducto = async (datos) => {
    const payload = {
      ...datos,
      imagenUrl: datos.imagen
    };
    const res = await api.post('/productos', payload);
    const nuevo = {
      ...res.data,
      imagen: res.data.imagenUrl || res.data.imagen
    };
    setCatalogo(prev => [...prev, nuevo]);
    return nuevo;
  };

  const editarProducto = async (id, datos) => {
    const payload = {
      ...datos,
      imagenUrl: datos.imagen
    };
    const res = await api.put(`/productos/${id}`, payload);
    const actualizado = {
      ...res.data,
      imagen: res.data.imagenUrl || res.data.imagen
    };
    setCatalogo(prev => prev.map(p => (p.id === id ? actualizado : p)));
    return actualizado;
  };

  const eliminarProducto = async (id) => {
    await api.delete(`/productos/${id}`);
    setCatalogo(prev => prev.filter(p => p.id !== id));
  };

  return (
    <ProductosContext.Provider
      value={{
        catalogo,
        loading,
        cargarProductos,
        agregarProducto,
        editarProducto,
        eliminarProducto
      }}
    >
      {children}
    </ProductosContext.Provider>
  );
};

export const useProductos = () => useContext(ProductosContext);