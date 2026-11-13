import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/api";
import { useAuth } from "./AuthContext";

export const ESTADOS_POSIBLES = [
    "pendiente de pago",
    "en preparación",
    "listo para retiro/despacho",
    "entregado",
];

const PedidosContext = createContext(null);

function normalizarPedido(p) {
    if (!p) return p;
    const listaProductos = p.productos || p.items || [];
    return {
        ...p,
        email: p.email || p.clienteEmail || "",
        clienteEmail: p.email || p.clienteEmail || "",
        productos: listaProductos,
        items: listaProductos,
        estadoPago: p.estadoPago || (p.estado === "pendiente de pago" ? "pendiente" : "pagado"),
    };
}

export function PedidosProvider({ children }) {
    const { sesion } = useAuth();
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(false);

    const cargarTodosLosPedidos = useCallback(async () => {
        const token = localStorage.getItem("jwt_token");
        if (!token || !sesion) return;

        const rol = (sesion.rol || sesion.role || "").toUpperCase();
        if (!rol.includes("VENDEDOR") && !rol.includes("ADMIN")) {
            return;
        }

        setCargando(true);
        try {
            const resp = await api.get("/pedidos");
            const lista = Array.isArray(resp.data) ? resp.data.map(normalizarPedido) : [];
            setPedidos(lista);
        } catch (err) {
            if (err.response?.status !== 403 && err.response?.status !== 500) {
                console.error("Error cargando pedidos:", err);
            }
        } finally {
            setCargando(false);
        }
    }, [sesion]);

    const cargarPedidosPorCliente = useCallback(async (email) => {
        const token = localStorage.getItem("jwt_token");
        if (!token || !email) return [];

        setCargando(true);
        try {
            const resp = await api.get(`/pedidos/cliente/${encodeURIComponent(email)}`);
            const lista = Array.isArray(resp.data) ? resp.data.map(normalizarPedido) : [];
            setPedidos(lista);
            return lista;
        } catch (err) {
            console.error("Error cargando pedidos del cliente:", err);
            return [];
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarTodosLosPedidos();
    }, [cargarTodosLosPedidos]);

    async function crearPedido(datosPedido) {
        const listaItems = (datosPedido.productos || datosPedido.items || []).map((item) => ({
            productoId: item.productoId ?? item.id ?? null,
            nombre: item.nombre || item.name,
            cantidad: Number(item.cantidad ?? item.quantity ?? 1),
            precio: Number(item.precio ?? item.price ?? 0),
        }));

        const payload = {
            email: datosPedido.email || datosPedido.clienteEmail,
            entrega: datosPedido.entrega,
            metodoPago: datosPedido.metodoPago,
            direccion: datosPedido.direccion,
            total: Number(datosPedido.total ?? 0),
            estado: datosPedido.estado || "pendiente de pago",
            productos: listaItems,
        };

        try {
            const resp = await api.post("/pedidos", payload);
            const pedidoCreado = normalizarPedido(resp.data);
            setPedidos((actual) => [pedidoCreado, ...actual]);
            return pedidoCreado;
        } catch (err) {
            const status = err.response?.status || "red";
            const detalle = err.response?.data?.message || err.response?.data || err.message;
            throw new Error(`Error al crear pedido (${status}): ${JSON.stringify(detalle)}`);
        }
    }

    async function cambiarEstado(id, nuevoEstado) {
        try {
            const resp = await api.put(`/pedidos/${id}/estado`, { estado: nuevoEstado });
            const pedidoActualizado = normalizarPedido(resp.data);
            setPedidos((actual) =>
                actual.map((p) => (p.id === id ? pedidoActualizado : p))
            );
            return pedidoActualizado;
        } catch (err) {
            const status = err.response?.status || "red";
            const detalle = err.response?.data?.message || err.response?.data || err.message;
            throw new Error(`Error al cambiar estado (${status}): ${JSON.stringify(detalle)}`);
        }
    }

    function pedidosDe(email) {
        if (!email) return [];
        return pedidos.filter(
            (p) => (p.email || p.clienteEmail || "").toLowerCase() === email.toLowerCase()
        );
    }

    const value = {
        pedidos,
        cargando,
        crearPedido,
        cambiarEstado,
        pedidosDe,
        cargarTodosLosPedidos,
        cargarPedidosPorCliente,
    };

    return <PedidosContext.Provider value={value}>{children}</PedidosContext.Provider>;
}

export function usePedidos() {
    return useContext(PedidosContext);
}