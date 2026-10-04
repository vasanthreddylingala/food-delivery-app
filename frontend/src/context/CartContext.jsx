import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, isCustomer } = useAuth();
  const [cart, setCart] = useState({ id: null, items: [], totalAmount: 0, totalItems: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated || !isCustomer) {
      setCart({ id: null, items: [], totalAmount: 0, totalItems: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data && res.data.data) {
        setCart(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, isCustomer]);

  const addToCart = async (menuItemId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to your cart');
    }
    try {
      setLoading(true);
      const res = await api.post('/cart/items', { menuItemId, quantity });
      if (res.data && res.data.data) {
        setCart(res.data.data);
      }
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      setLoading(true);
      const res = await api.put(`/cart/items/${cartItemId}?quantity=${quantity}`);
      if (res.data && res.data.data) {
        setCart(res.data.data);
      }
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      setLoading(true);
      const res = await api.delete(`/cart/items/${cartItemId}`);
      if (res.data && res.data.data) {
        setCart(res.data.data);
      }
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await api.delete('/cart');
      setCart({ id: null, items: [], totalAmount: 0, totalItems: 0 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
