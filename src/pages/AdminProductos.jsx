import { useEffect, useRef, useState } from 'react';
import { useProductos } from '../context/ProductosContext';
import { useStock } from '../context/StockContext';

const IMAGEN_POR_DEFECTO = 'https://placehold.co/600x400?text=Producto';

const FORM_VACIO = {
    nombre: '',
    marca: '',
    modelo: '',
    categoria: '',
    precio: '',
    stock: '',
    imagen: '',
    descripcion: '',
};

function AdminProductos() {
    const { catalogo, agregarProducto, editarProducto, eliminarProducto } = useProductos();
    const { obtenerStock, fijarStock } = useStock();

    const [mostrarForm, setMostrarForm] = useState(false);
    const [editandoId, setEditandoId] = useState(null); // null = producto nuevo
    const [form, setForm] = useState(FORM_VACIO);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    const formRef = useRef(null);

    // Categorías existentes, para sugerirlas en el formulario y evitar duplicados por typos
    const categorias = [...new Set(catalogo.map(p => p.categoria))];

    // Al abrir el formulario, baja hasta él
    useEffect(() => {
        if (mostrarForm) {
            formRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [mostrarForm, editandoId]);

    const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

    const abrirNuevo = () => {
        setForm(FORM_VACIO);
        setEditandoId(null);
        setError('');
        setMensaje('');
        setMostrarForm(true);
    };

    const abrirEditar = (producto) => {
        setForm({
            nombre: producto.nombre,
            marca: producto.marca,
            modelo: producto.modelo,
            categoria: producto.categoria,
            precio: String(producto.precio),
            stock: String(obtenerStock(producto.id)), // el stock real, con lo que haya fijado el vendedor
            imagen: producto.imagen || '',
            descripcion: producto.descripcion || '',
        });
        setEditandoId(producto.id);
        setError('');
        setMensaje('');
        setMostrarForm(true);
    };

    const cancelar = () => {
        setMostrarForm(false);
        setEditandoId(null);
        setError('');
    };

    const handleEliminar = (producto) => {
        if (!window.confirm(`¿Seguro que quieres eliminar "${producto.nombre}"?`)) return;

        eliminarProducto(producto.id);

        // Si justo se estaba editando ese producto, cerramos el formulario
        if (editandoId === producto.id) cancelar();

        setMensaje(`Producto "${producto.nombre}" eliminado.`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const precio = Number(form.precio);
        const stock = Number(form.stock);

        if (!form.nombre.trim() || !form.marca.trim() || !form.modelo.trim() || !form.categoria.trim()) {
            setError('Completa los campos obligatorios.');
            return;
        }

        if (
            form.precio === '' || form.stock === '' ||
            isNaN(precio) || isNaN(stock) ||
            precio < 0 || stock < 0 || !Number.isInteger(stock)
        ) {
            setError('Precio y stock deben ser números válidos (el stock, un entero).');
            return;
        }

        const datos = {
            nombre: form.nombre.trim(),
            marca: form.marca.trim(),
            modelo: form.modelo.trim(),
            categoria: form.categoria.trim(),
            precio,
            stock,
            imagen: form.imagen.trim() || IMAGEN_POR_DEFECTO,
            descripcion: form.descripcion.trim(),
        };

        try {
            if (editandoId !== null) {
                await editarProducto(editandoId, datos);
                fijarStock(editandoId, stock);
                setMensaje(`Producto "${datos.nombre}" actualizado.`);
            } else {
                const nuevo = await agregarProducto(datos);
                if (nuevo?.id) {
                    fijarStock(nuevo.id, stock);
                }
                setMensaje(`Producto "${datos.nombre}" agregado al catálogo.`);
            }

            cancelar();
        } catch (err) {
            setError('Error al guardar el producto. Revisa la consola o la conexión con el servidor.');
            console.error(err);
        }
    };

    return (
        <main>
            <div className="page-header">
                <div className="container">
                    <h1 className="h3">Productos</h1>
                    <p>Ingresa, edita o elimina productos del catálogo.</p>
                </div>
            </div>

            <div className="container pb-5">
                <div className="seccion-card mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Catálogo de productos</h5>
                        <button className="btn btn-accent btn-sm" onClick={abrirNuevo}>
                            + Nuevo producto
                        </button>
                    </div>

                    {mensaje && (
                        <div className="alert alert-success py-2 small" role="alert">{mensaje}</div>
                    )}

                    {catalogo.length === 0 ? (
                        <p className="text-muted mb-0">No hay productos en el catálogo.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table align-middle">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Marca</th>
                                        <th>Categoría</th>
                                        <th>Precio</th>
                                        <th>Stock</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {catalogo.map(producto => (
                                        <tr key={producto.id}>
                                            <td>{producto.nombre}</td>
                                            <td>{producto.marca}</td>
                                            <td>{producto.categoria}</td>
                                            <td>${producto.precio.toLocaleString('es-CL')}</td>
                                            <td>{obtenerStock(producto.id)}</td>
                                            <td className="text-nowrap">
                                                <button
                                                    className="btn btn-sm btn-outline-secondary me-1"
                                                    onClick={() => abrirEditar(producto)}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleEliminar(producto)}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {mostrarForm && (
                    <div className="seccion-card" ref={formRef}>
                        <h5 className="mb-3">
                            {editandoId !== null ? 'Editar producto' : 'Nuevo producto'}
                        </h5>

                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label htmlFor="nombre" className="form-label">Nombre</label>
                                    <input type="text" className="form-control" id="nombre"
                                        value={form.nombre} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="marca" className="form-label">Marca</label>
                                    <input type="text" className="form-control" id="marca"
                                        value={form.marca} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="modelo" className="form-label">Modelo</label>
                                    <input type="text" className="form-control" id="modelo"
                                        value={form.modelo} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="categoria" className="form-label">Categoría</label>
                                    <input type="text" className="form-control" id="categoria"
                                        list="listaCategorias"
                                        value={form.categoria} onChange={handleChange} required />
                                    <datalist id="listaCategorias">
                                        {categorias.map(cat => (
                                            <option key={cat} value={cat} />
                                        ))}
                                    </datalist>
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="precio" className="form-label">Precio</label>
                                    <input type="number" min="0" className="form-control" id="precio"
                                        value={form.precio} onChange={handleChange} required />
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="stock" className="form-label">Stock</label>
                                    <input type="number" min="0" className="form-control" id="stock"
                                        value={form.stock} onChange={handleChange} required />
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="imagen" className="form-label">URL de imagen</label>
                                    <input type="text" className="form-control" id="imagen"
                                        value={form.imagen} onChange={handleChange} />
                                </div>
                                <div className="col-12">
                                    <label htmlFor="descripcion" className="form-label">Descripción</label>
                                    <textarea className="form-control" id="descripcion" rows="2"
                                        value={form.descripcion} onChange={handleChange} />
                                </div>
                            </div>

                            {error && (
                                <div className="alert alert-danger py-2 small mt-3" role="alert">{error}</div>
                            )}

                            <div className="mt-3 d-flex gap-2">
                                <button type="submit" className="btn btn-accent">Guardar</button>
                                <button type="button" className="btn btn-outline-secondary" onClick={cancelar}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </main>
    );
}

export default AdminProductos;