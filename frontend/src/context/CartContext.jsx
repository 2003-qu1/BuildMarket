import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('bm_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('bm_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + qty;
        // Cap at stock quantity if known
        const finalQty = product.stock_quantity ? Math.min(newQty, product.stock_quantity) : newQty;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: finalQty
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            sku: product.sku,
            name_en: product.name_en,
            name_ar: product.name_ar,
            price: parseFloat(product.price),
            sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
            image_url: product.image_url,
            unit: product.unit || 'Piece',
            stock_quantity: product.stock_quantity,
            quantity: qty
          }
        ];
      }
    });
  };

  const updateQuantity = (productId, quantity) => {
    const qty = parseInt(quantity, 10);
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => {
    const price = item.sale_price !== null ? item.sale_price : item.price;
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = subtotal > 1000 || subtotal === 0 ? 0 : 50;
  const grandTotal = subtotal + deliveryFee;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      subtotal,
      deliveryFee,
      grandTotal,
      totalItems
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
