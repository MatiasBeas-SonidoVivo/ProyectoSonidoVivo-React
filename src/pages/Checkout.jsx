import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductos } from '../context/ProductosContext';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { usePedidos } from '../context/PedidosContext';
import { useStock } from '../context/StockContext';

const CODIGO_CUPON = 'SONIDO10';
const PORCENTAJE_DESCUENTO = 0.05;

const NUMERO_TARJETA_VALIDO = '4111111111111111';
const VENCIMIENTO_VALIDO = '12/28';
const CVV_VALIDO = '123';

function Checkout() {
    const { sesion } = useAuth();
    const { carrito, vaciarCarrito } = useCarrito();
    const { crearPedido } = usePedidos();
    const { obtenerStock, descontarStock } = useStock();
    const navigate = useNavigate();
    const { catalogo } = useProductos();

    const [entrega, setEntrega] = useState('despacho');
    const [direccion, setDireccion] = useState('');
    const [referencia, setReferencia] = useState('entrada');
    const [pago, setPago] = useState('transferencia');
    const [cupon, setCupon] = useState('');
    const [cuponAplicado, setCuponAplicado] = useState(false);
    const [mensajeCupon, setMensajeCupon] = useState({ tipo: '', texto: '' });
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);

    const [numeroTarjeta, setNumeroTarjeta] = useState('');
    const [vencimiento, setVencimiento] = useState('');
    const [cvv, setCvv] = useState('');

    const lineas = carrito
        .map(item => ({ ...item, producto: catalogo.find(p => p.id === item.id) }))
        .filter(linea => linea.producto);

    const subtotal = lineas.reduce((suma, l) => suma + l.producto.precio * l.cantidad, 0);
    const descuento = cuponAplicado ? Math.round(subtotal * PORCENTAJE_DESCUENTO) : 0;
    const total = subtotal - descuento;

    const cambiarEntrega = (valor) => {
        setEntrega(valor);
        if (valor === 'despacho' && pago === 'tienda') {
            setPago('transferencia');
        }
    };

    const aplicarCupon = () => {
        if (cupon.trim().toUpperCase() === CODIGO_CUPON) {
            setCuponAplicado(true);
            setMensajeCupon({ tipo: 'success', texto: '¡Cupón aplicado! 5% de descuento.' });
        } else {
            setCuponAplicado(false);
            setMensajeCupon({ tipo: 'danger', texto: 'Cupón no válido.' });
        }
    };

    // ---- Auto-formato de los campos de tarjeta ----
    const handleNumeroTarjeta = (e) => {
        const valor = e.target.value
            .replace(/\D/g, '')
            .slice(0, 16)
            .replace(/(.{4})/g, '$1 ')
            .trim();
        setNumeroTarjeta(valor);
    };

    const handleVencimiento = (e) => {
        let valor = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (valor.length > 2) {
            valor = valor.slice(0, 2) + '/' + valor.slice(2);
        }
        setVencimiento(valor);
    };

    const handleCvv = (e) => {
        setCvv(e.target.value.replace(/\D/g, '').slice(0, 3));
    };

    // ---- Confirmar pedido ----
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!sesion?.email) {
            setError('Debes iniciar sesión para confirmar un pedido.');
            return;
        }

        if (lineas.length === 0) {
            setError('Tu carrito está vacío.');
            return;
        }

        const sinStock = lineas.find(l => l.cantidad > obtenerStock(l.producto.id));
        if (sinStock) {
            setError(
                `No hay stock suficiente de "${sinStock.producto.nombre}" ` +
                `(disponibles: ${obtenerStock(sinStock.producto.id)}). Ajusta tu carrito.`
            );
            return;
        }

        if (entrega === 'despacho' && !direccion.trim()) {
            setError('Ingresa la dirección de despacho.');
            return;
        }

        if (pago === 'tarjeta') {
            const numero = numeroTarjeta.replace(/\s/g, '');

            if (numero.length !== 16 || vencimiento.length !== 5 || cvv.length !== 3) {
                setError('Completa todos los datos de la tarjeta.');
                return;
            }

            const [mes, anio] = vencimiento.split('/').map(Number);
            const hoy = new Date();
            const anioActual = hoy.getFullYear() % 100;
            const mesActual = hoy.getMonth() + 1;

            const estaVencida =
                mes < 1 || mes > 12 ||
                anio < anioActual ||
                (anio === anioActual && mes < mesActual);

            if (estaVencida) {
                setError('La tarjeta está vencida. Verifica la fecha ingresada.');
                return;
            }

            if (numero !== NUMERO_TARJETA_VALIDO || vencimiento !== VENCIMIENTO_VALIDO || cvv !== CVV_VALIDO) {
                setError('Pago rechazado. Verifica tu saldo o comunícate con tu banco.');
                return;
            }
        }

        let estadoPago = 'pendiente de pago';
        let estado = 'pendiente de pago';

        if (pago === 'tarjeta') {
            estadoPago = 'pagado';
            estado = 'en preparación';
        } else if (pago === 'tienda') {
            estadoPago = 'pendiente (paga al retirar)';
            estado = 'en preparación';
        }

        setEnviando(true);
        try {
            await crearPedido({
                clienteEmail: sesion.email,
                items: lineas.map(({ producto, cantidad }) => ({
                    productoId: producto.id,
                    nombre: producto.nombre,
                    precio: producto.precio,
                    cantidad,
                })),
                subtotal,
                descuento,
                total,
                entrega,
                direccion: entrega === 'despacho' ? direccion.trim() : null,
                referencia: entrega === 'despacho' ? referencia : null,
                metodoPago: pago,
                estadoPago,
                estado,
            });

            descontarStock(
                lineas.map(({ producto, cantidad }) => ({ id: producto.id, cantidad }))
            );

            vaciarCarrito();
            navigate('/pedidos');
        } catch (err) {
            console.error(err);
            setError('No se pudo registrar el pedido en el servidor. Intenta nuevamente.');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <main className="container py-5">
            <h1 className="h3 mb-4">Confirmar pedido</h1>

            <form className="row g-4" onSubmit={handleSubmit}>
                <div className="col-lg-7">

                    <div className="mb-4">
                        <h5 className="mb-3">Modalidad de entrega</h5>
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="entrega"
                                id="entregaDespacho"
                                checked={entrega === 'despacho'}
                                onChange={() => cambiarEntrega('despacho')}
                            />
                            <label className="form-check-label" htmlFor="entregaDespacho">Despacho a domicilio</label>
                        </div>
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="entrega"
                                id="entregaRetiro"
                                checked={entrega === 'retiro'}
                                onChange={() => cambiarEntrega('retiro')}
                            />
                            <label className="form-check-label" htmlFor="entregaRetiro">Retiro en tienda</label>
                        </div>
                    </div>

                    {entrega === 'despacho' && (
                        <div className="mb-4">
                            <h5 className="mb-3">Dirección de despacho</h5>
                            <div className="mb-3">
                                <label htmlFor="direccion" className="form-label">Dirección</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="direccion"
                                    placeholder="Calle, número, comuna"
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="referenciaEntrega" className="form-label">Referencia de acceso</label>
                                <select
                                    className="form-select"
                                    id="referenciaEntrega"
                                    value={referencia}
                                    onChange={(e) => setReferencia(e.target.value)}
                                >
                                    <option value="entrada">Entrada principal</option>
                                    <option value="conserjeria">Conserjería</option>
                                    <option value="codigo">Con código de acceso</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="mb-4">
                        <h5 className="mb-3">Método de pago</h5>

                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="pago"
                                id="pagoTransferencia"
                                checked={pago === 'transferencia'}
                                onChange={() => setPago('transferencia')}
                            />
                            <label className="form-check-label" htmlFor="pagoTransferencia">Transferencia bancaria</label>
                        </div>

                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="pago"
                                id="pagoTarjeta"
                                checked={pago === 'tarjeta'}
                                onChange={() => setPago('tarjeta')}
                            />
                            <label className="form-check-label" htmlFor="pagoTarjeta">
                                Tarjeta de crédito/débito (Webpay)
                            </label>
                        </div>

                        {pago === 'tarjeta' && (
                            <div className="seccion-card mt-3 mb-3">
                                <div className="mb-3">
                                    <label htmlFor="numeroTarjeta" className="form-label small">Número de tarjeta</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="numeroTarjeta"
                                        placeholder="1111 1111 1111 1111"
                                        inputMode="numeric"
                                        value={numeroTarjeta}
                                        onChange={handleNumeroTarjeta}
                                    />
                                </div>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <label htmlFor="vencimientoTarjeta" className="form-label small">Vencimiento (MM/AA)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="vencimientoTarjeta"
                                            placeholder="MM/AA"
                                            inputMode="numeric"
                                            value={vencimiento}
                                            onChange={handleVencimiento}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label htmlFor="cvvTarjeta" className="form-label small">CVV</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="cvvTarjeta"
                                            placeholder="123"
                                            inputMode="numeric"
                                            value={cvv}
                                            onChange={handleCvv}
                                        />
                                    </div>
                                </div>
                                <div className="form-text mt-2">
                                    Datos de prueba: N° 4111 1111 1111 1111 · Vencimiento 12/28 · CVV 123
                                </div>
                            </div>
                        )}

                        {entrega === 'retiro' && (
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="pago"
                                    id="pagoTienda"
                                    checked={pago === 'tienda'}
                                    onChange={() => setPago('tienda')}
                                />
                                <label className="form-check-label" htmlFor="pagoTienda">Pago en tienda al retirar</label>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="alert alert-danger py-2 small" role="alert">{error}</div>
                    )}

                    <button type="submit" className="btn btn-accent" disabled={enviando}>
                        {enviando ? 'Procesando pedido...' : 'Confirmar pedido'}
                    </button>
                </div>

                <div className="col-lg-5">
                    <div className="toolbar-productos">
                        <h5 className="mb-3">Resumen del pedido</h5>

                        {lineas.map(({ producto, cantidad }) => (
                            <div key={producto.id} className="d-flex justify-content-between small mb-2">
                                <span>{producto.nombre} x{cantidad}</span>
                                <span>${(producto.precio * cantidad).toLocaleString('es-CL')}</span>
                            </div>
                        ))}

                        <hr />

                        <div className="mb-3">
                            <label htmlFor="cuponInput" className="form-label small">¿Tienes un cupón?</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    id="cuponInput"
                                    className="form-control"
                                    placeholder="Código del cupón"
                                    value={cupon}
                                    onChange={(e) => setCupon(e.target.value)}
                                />
                                <button type="button" className="btn btn-outline-secondary" onClick={aplicarCupon}>
                                    Aplicar
                                </button>
                            </div>
                            {mensajeCupon.texto && (
                                <div className={`small mt-1 text-${mensajeCupon.tipo}`}>{mensajeCupon.texto}</div>
                            )}
                        </div>

                        <hr />

                        <div className="d-flex justify-content-between small mb-1">
                            <span>Subtotal</span>
                            <span>${subtotal.toLocaleString('es-CL')}</span>
                        </div>

                        {cuponAplicado && (
                            <div className="d-flex justify-content-between small mb-1 text-success">
                                <span>Descuento (5%)</span>
                                <span>-${descuento.toLocaleString('es-CL')}</span>
                            </div>
                        )}

                        <div className="d-flex justify-content-between fw-bold mt-2">
                            <span>Total</span>
                            <span>${total.toLocaleString('es-CL')}</span>
                        </div>
                    </div>
                </div>
            </form>
        </main>
    );
}

export default Checkout;