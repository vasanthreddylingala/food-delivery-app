import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Clock, CheckCircle2, AlertCircle, ChefHat, Bike, Home } from 'lucide-react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const STEPS = [
  { key: 'PLACED', label: 'Order Placed', icon: Package },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'PREPARING', label: 'In the Kitchen', icon: ChefHat },
  { key: 'OUT_FOR_DELIVERY', label: 'On the Way', icon: Bike },
  { key: 'DELIVERED', label: 'Delivered', icon: Home },
];

export const OrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data?.data) {
        setOrder(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Poll every 10 seconds for live updates
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Retrieving live order tracking..." />;
  }

  if (error || !order) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <ErrorMessage message={error || 'Order not found'} />
        <Link to="/orders" className="btn btn-primary btn-sm">
          <ArrowLeft size={16} /> Back to orders
        </Link>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} />
        <span>Back to my orders</span>
      </Link>

      <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Live Order Tracking</span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)', margin: '0.2rem 0' }}>
              Order #{order.id}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              From <strong style={{ color: 'var(--text-main)' }}>{order.restaurantName}</strong>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
              ${Number(order.totalAmount).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Live Stepper */}
        {isCancelled ? (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontWeight: 600
          }}>
            <AlertCircle size={24} />
            <span>This order has been CANCELLED.</span>
          </div>
        ) : (
          <div className="stepper">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = currentStepIndex > idx;
              const isActive = currentStepIndex === idx;

              return (
                <div
                  key={step.key}
                  className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                >
                  <div className="step-icon">
                    <Icon size={16} />
                  </div>
                  <span className="step-label">{step.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Info & Receipt Items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--secondary)' }}>
            Delivery Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <MapPin size={16} style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Destination</span>
                <span style={{ fontWeight: 600 }}>{order.deliveryAddress}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <Clock size={16} style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Placed At</span>
                <span style={{ fontWeight: 600 }}>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--secondary)' }}>
            Order Items
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {order.items?.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>{item.quantity}x {item.name}</span>
                <span style={{ fontWeight: 600 }}>${Number(item.subtotal).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem' }}>
              <span>Total Amount</span>
              <span style={{ color: 'var(--primary)' }}>${Number(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
