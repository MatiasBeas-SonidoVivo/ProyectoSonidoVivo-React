import api from './api';

// GET /api/productos - Obtener todos los productos
export const getProductos = async () => {
  const response = await api.get('/productos');
  return response.data;
};

// GET /api/productos/{id} - Detalle de producto
export const getProductoById = async (id) => {
  const response = await api.get(`/productos/${id}`);
  return response.data;
};

// POST /api/productos - Crear producto (Requiere token)
export const crearProducto = async (productoData) => {
  const response = await api.post('/productos', productoData);
  return response.data;
};

// PUT /api/productos/{id} - Actualizar producto (Requiere token)
export const actualizarProducto = async (id, productoData) => {
  const response = await api.put(`/productos/${id}`, productoData);
  return response.data;
};

// DELETE /api/productos/{id} - Eliminar producto (Requiere token)
export const eliminarProducto = async (id) => {
  const response = await api.delete(`/productos/${id}`);
  return response.data;
};