import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePedidos } from '../context/PedidosContext';

const CLASE_ESTADO = {
    'pendiente de pago': 'text-danger',
    'en preparación': 'text-warning',
    'listo para retiro/despacho': 'text-primary',
    'entregado': 'text-success',
};

function MisPedidos() {
    const { sesion } = useAuth();
    const { pedidosDe, cargando, cargarPedidosPorCliente } = usePedidos();

    useEffect(() => {
        if (sesion?.email) {
            cargarPedidosPorCliente(sesion.email);
        }
    }, [sesion?.email, cargarPedidosPorCliente]);

    const misPedidos = sesion?.email ? pedidosDe(sesion.email) : [];

    return (
        <main>
            <div className="page-header">
                <div className="container">
                    <h1 className="h3">Mis pedidos</h1>
                    <p>Revisa el estado de tus compras.</p>
                </div>
            </div>

            <div className="container pb-5">
                {cargando ? (
                    <div className="text-center text-muted py-5">Cargando pedidos...</div>
                ) : misPedidos.length === 0 ? (
                    <div className="text-center text-muted py-5">
                        <p className="mb-3">Aún no has realizado ningún pedido.</p>
                        <Link to="/productos" className="btn btn-accent">Ver catálogo</Link>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {misPedidos.map(pedido => {
                            const listaItems = pedido.items || pedido.productos || [];
                            const fechaPedido = pedido.fecha || pedido.fechaCreacion;

                            return (
                                <div key={pedido.id} className="seccion-card">
                                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                                        <div>
                                            <h6 className="mb-1">Pedido #{pedido.id}</h6>
                                            {fechaPedido && (
                                                <p className="small text-muted mb-2">
                                                    {new Date(fechaPedido).toLocaleDateString('es-CL')}
                                                </p>
                                            )}
                                            <p className="small mb-1">
                                                {listaItems.map(p => `${p.nombre} x${p.cantidad}`).join(', ')}
                                            </p>
                                            <p className="small mb-0">
                                                Entrega: {pedido.entrega} · Pago: {pedido.metodoPago}
                                            </p>
                                            {pedido.direccion && (
                                                <p className="small text-muted mb-0">Dirección: {pedido.direccion}</p>
                                            )}
                                        </div>
                                        <div className="text-end">
                                            <p className="fw-bold mb-1">${Number(pedido.total || 0).toLocaleString('es-CL')}</p>
                                            <span className={`small fw-bold ${CLASE_ESTADO[pedido.estado] || 'text-muted'}`}>
                                                {pedido.estado}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}

export default MisPedidos;