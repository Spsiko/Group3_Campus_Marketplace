import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, } from "react";
const CartContext = createContext(undefined);
export function CartProvider({ children }) {
    // --------------------------------------------------
    // Load cart from localStorage on first render
    // --------------------------------------------------
    const [cart, setCart] = useState(() => {
        try {
            const stored = localStorage.getItem("cart");
            return stored ? JSON.parse(stored) : [];
        }
        catch {
            return [];
        }
    });
    // --------------------------------------------------
    // Persist cart to localStorage on every update
    // --------------------------------------------------
    useEffect(() => {
        try {
            localStorage.setItem("cart", JSON.stringify(cart));
        }
        catch (err) {
            console.error("Error saving cart:", err);
        }
    }, [cart]);
    // --------------------------------------------------
    // Add or increment an item in cart
    // --------------------------------------------------
    const addToCart = (item) => {
        setCart((prev) => {
            const existing = prev.find((p) => p.id === item.id);
            if (existing) {
                return prev.map((p) => p.id === item.id
                    ? { ...p, quantity: p.quantity + 1 }
                    : p);
            }
            // Add new item with quantity = 1
            return [...prev, { ...item, quantity: 1 }];
        });
    };
    // --------------------------------------------------
    // Remove one listing entirely
    // --------------------------------------------------
    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((p) => p.id !== id));
    };
    // --------------------------------------------------
    // Empty entire cart
    // --------------------------------------------------
    const clearCart = () => {
        setCart([]);
        localStorage.removeItem("cart");
    };
    return (_jsx(CartContext.Provider, { value: { cart, addToCart, removeFromCart, clearCart }, children: children }));
}
export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx)
        throw new Error("useCart must be used inside a CartProvider");
    return ctx;
}
