import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import OrderCard from '../components/OrderCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/orders');
      if (res.data?.data) {
        setOrders(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--secondary)' }}>My Orders</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Track live status and order history</p>
        </div>
        <button onClick={fetchOrders} className="btn btn-sm btn-outline">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <ErrorMessage message={error} onRetry={fetchOrders} />

      {loading ? (
        <LoadingSpinner message="Retrieving your orders..." />
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)' }}>
          <Package size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No orders placed yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>When you place orders, they will appear here with live tracking status.</p>
          <Link to="/restaurants" className="btn btn-primary btn-sm">Find Restaurants</Link>
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
