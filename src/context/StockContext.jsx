import { createContext, useContext } from "react";
import { useProductos } from "./ProductosContext";
import api from "../api/api";

const StockContext = createContext(null);

export function StockProvider({ children }) {
    const { catalogo, editarProducto, cargarProductos } = useProductos();

    function obtenerStock(id) {
        const producto = catalogo.find((p) => String(p.id) === String(id));
        return producto ? Number(producto.stock ?? 0) : 0;
    }

    async function descontarStock(lineas) {
        try {
            await Promise.all(
                lineas.map(({ id, cantidad }) =>
                    api.patch(`/productos/${id}/descontar-stock`, null, {
                        params: { cantidad },
                    })
                )
            );
            await cargarProductos();
        } catch (err) {
            console.error("Error al descontar stock en backend:", err);
        }
    }

    async function fijarStock(id, cantidad) {
        const producto = catalogo.find((p) => String(p.id) === String(id));
        if (!producto) return;

        const valor = Math.max(0, Number(cantidad) || 0);
        try {
            await editarProducto(id, { ...producto, stock: valor });
        } catch (err) {
            console.error("Error al actualizar stock en backend:", err);
            throw err;
        }
    }

    const value = { obtenerStock, descontarStock, fijarStock };

    return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
}

export function useStock() {
    return useContext(StockContext);
}