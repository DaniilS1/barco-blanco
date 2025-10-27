// context/CartContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  slug?: { current: string }; // ← добавлено, если используешь переход на товар
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  getTotalItems: () => number;
  clearCart: () => void;
  getCartTotalPrice: () => number;
  // Modal state
  showSuccessModal: boolean;
  setShowSuccessModal: (show: boolean) => void;
  lastAddedProduct: CartItem | null;
  setLastAddedProduct: (product: CartItem | null) => void;
  // Loading and storage state
  isCartLoaded: boolean;
  isLocalStorageAvailable: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState<CartItem | null>(null);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [isLocalStorageAvailable, setIsLocalStorageAvailable] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  // ✅ SSR-safe localStorage loading
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsCartLoaded(true);
      return;
    }
    
    try {
      // Test localStorage availability
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      setIsLocalStorageAvailable(true);
      
      // Load cart from localStorage
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        try {
          const parsedCart = JSON.parse(storedCart);
          setCart(parsedCart);
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error);
          // Clear corrupted data
          localStorage.removeItem("cart");
        }
      }
    } catch (error) {
      console.error("localStorage not available:", error);
      setIsLocalStorageAvailable(false);
      // Show toast notification for localStorage issues
      if (typeof window !== 'undefined') {
        // Import toast dynamically to avoid SSR issues
        import('react-hot-toast').then(({ toast }) => {
          toast.error('Увага: кошик буде працювати тільки в цій сесії');
        });
      }
    } finally {
      setIsCartLoaded(true);
      setHasInitialized(true);
    }
  }, []);

  // ✅ Save to localStorage when cart changes (only if localStorage is available)
  useEffect(() => {
    if (!isCartLoaded) return;
    if (!isLocalStorageAvailable) return;
    if (!hasInitialized) return; // Don't save during initial load
    
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cart, isCartLoaded, isLocalStorageAvailable, hasInitialized]);

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === item.id);
      if (existing) {
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        return [...prevCart, item];
      }
    });
    // Show success modal
    setLastAddedProduct(item);
    setShowSuccessModal(true);
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getCartTotalPrice,
        showSuccessModal,
        setShowSuccessModal,
        lastAddedProduct,
        setLastAddedProduct,
        isCartLoaded,
        isLocalStorageAvailable,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
