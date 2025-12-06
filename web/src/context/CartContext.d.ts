import { type ReactNode } from "react";
export interface CartItem {
    id: string;
    title: string;
    price: number;
    image: string;
    quantity: number;
    seller_id: string;
}
interface CartContextType {
    cart: CartItem[];
    addToCart: (item: Omit<CartItem, "quantity">) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
}
export declare function CartProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useCart(): CartContextType;
export {};
