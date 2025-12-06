import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

// --------------------------------------------------
// CartItem structure MUST match your listings table
// --------------------------------------------------
export interface CartItem {
  id: string;          // Listing UUID from Supabase
  title: string;
  price: number;
  image: string;
  quantity: number;
  seller_id: string;   // Required to notify seller or update status
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // --------------------------------------------------
  // Load cart from localStorage on first render
  // --------------------------------------------------
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // --------------------------------------------------
  // Persist cart to localStorage on every update
  // --------------------------------------------------
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (err) {
      console.error("Error saving cart:", err);
    }
  }, [cart]);

  // --------------------------------------------------
  // Add or increment an item in cart
  // --------------------------------------------------
  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);

      if (existing) {
        return prev.map((p) =>
          p.id === item.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }

      // Add new item with quantity = 1
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // --------------------------------------------------
  // Remove one listing entirely
  // --------------------------------------------------
  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  // --------------------------------------------------
  // Empty entire cart
  // --------------------------------------------------
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside a CartProvider");
  return ctx;
}
