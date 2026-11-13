import { useEffect, useState } from 'react';
import { usePedidos, ESTADOS_POSIBLES } from '../context/PedidosContext';

function VendedorPedidos() {
    const { pedidos, cargando, cambiarEstado, cargarTodosLosPedidos } = usePedidos();
    const [actualizandoId, setActualizandoId] = useState(null);

    useEffect(() => {
        cargarTodosLosPedidos();
    }, [cargarTodosLosPedidos]);

    const handleCambioEstado = async (id, nuevoEstado) => {
        setActualizandoId(id);
        try {
            await cambiarEstado(id, nuevoEstado);
        } catch (err) {
            console.error(err);
            alert('No se pudo actualizar el estado del pedido.');
        } finally {
            setActualizandoId(null);
        }
    };

    const ordenados = [...pedidos].sort((a, b) => Number(b.id) - Number(a.id));

    return (
        <main>
            <div className="page-header">
                <div className="container">
                    <h1 className="h3">Pedidos</h1>
                    <p>Revisa y actualiza el estado de los pedidos de los clientes.</p>
                </div>
            </div>

            <div className="container pb-5">
                <div className="seccion-card">
                    {cargando ? (
                        <div className="text-center text-muted py-4">
                            Cargando pedidos...
                        </div>
                    ) : ordenados.length === 0 ? (
                        <div className="text-center text-muted py-4">
                            Aún no hay pedidos registrados.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table align-middle">
                                <thead>
                                    <tr>
                                        <th>N° Pedido</th>
                                        <th>Cliente</th>
                                        <th>Productos</th>
                                        <th>Total</th>
                                        <th>Entrega</th>
                                        <th>Pago</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ordenados.map(pedido => {
                                        const listaItems = pedido.items || pedido.productos || [];

                                        return (
                                            <tr key={pedido.id}>
                                                <td>#{pedido.id}</td>
                                                <td>{pedido.clienteEmail}</td>
                                                <td className="small">
                                                    {listaItems.map(p => `${p.nombre} x${p.cantidad}`).join(', ')}
                                                </td>
                                                <td>${Number(pedido.total || 0).toLocaleString('es-CL')}</td>
                                                <td className="small">
                                                    {pedido.entrega}
                                                    {pedido.direccion && (
                                                        <div className="text-muted">{pedido.direccion}</div>
                                                    )}
                                                </td>
                                                <td className="small">
                                                    {pedido.metodoPago} ({pedido.estadoPago})
                                                </td>
                                                <td>
                                                    <select
                                                        className="form-select form-select-sm"
                                                        style={{ minWidth: '180px' }}
                                                        value={pedido.estado}
                                                        disabled={actualizandoId === pedido.id}
                                                        onChange={(e) => handleCambioEstado(pedido.id, e.target.value)}
                                                    >
                                                        {ESTADOS_POSIBLES.map(estado => (
                                                            <option key={estado} value={estado}>{estado}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default VendedorPedidos;