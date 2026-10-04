import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, MapPin, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export const CartPage = () => {
  const { cart, updateQuantity, removeItem, clearCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const [deliveryAddress, setDeliveryAddress] = useState('123 Innovation Way, Apt 4B');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '480px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '2.5rem' }}>
          <ShoppingBag size={48} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Sign In to View Cart</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Please sign in or create an account to view and order your meals.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <ShoppingBag size={56} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Your Cart is Empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            Looks like you haven't added any appetizing dishes to your cart yet.
          </p>
          <Link to="/restaurants" className="btn btn-primary">
            Explore Restaurants
          </Link>
        </div>
      </div>
    );
  }

  const deliveryFee = 2.99;
  const tax = Number((cart.totalAmount * 0.08).toFixed(2));
  const grandTotal = Number((Number(cart.totalAmount) + deliveryFee + tax).toFixed(2));
  const restaurantId = cart.items[0]?.restaurantId;
  const restaurantName = cart.items[0]?.restaurantName;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!deliveryAddress.trim()) {
      setError('Please provide a delivery address');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/orders', {
        restaurantId: restaurantId,
        deliveryAddress: deliveryAddress.trim(),
      });

      if (res.data?.data) {
        navigate(`/orders/${res.data.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--secondary)' }}>Your Cart</h1>
          {restaurantName && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ordering from: <strong style={{ color: 'var(--text-main)' }}>{restaurantName}</strong></p>
          )}
        </div>
        <button onClick={clearCart} className="btn btn-sm btn-outline" style={{ color: 'var(--danger)', borderColor: '#fca5a5' }}>
          <Trash2 size={14} /> Clear Cart
        </button>
      </div>

      <ErrorMessage message={error} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Cart Items List */}
        <div className="card">
          <div className="card-body" style={{ padding: '1rem' }}>
            {cart.items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 0',
                  borderBottom: '1px solid var(--surface-border)',
                }}
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}

                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                    {item.name}
                  </h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    ${Number(item.price).toFixed(2)} each
                  </span>
                </div>

                {/* Stepper */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid var(--surface-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '2px',
                  backgroundColor: '#f8fafc'
                }}>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    style={{ background: 'transparent', padding: '4px 8px', color: 'var(--text-muted)' }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 600, fontSize: '0.85rem' }}>
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    style={{ background: 'transparent', padding: '4px 8px', color: 'var(--text-muted)' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div style={{ minWidth: '65px', textAlign: 'right', fontWeight: 700, fontSize: '1rem' }}>
                  ${Number(item.subtotal).toFixed(2)}
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  style={{ background: 'transparent', color: '#94a3b8', padding: '4px' }}
                  title="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout Card */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--secondary)' }}>
            Order Summary
          </h3>

          <form onSubmit={handleCheckout}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={15} style={{ color: 'var(--primary)' }} />
                <span>Delivery Address</span>
              </label>
              <textarea
                required
                rows={2}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter street, apartment, floor, city..."
                className="form-textarea"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal ({cart.totalItems} items)</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>${Number(cart.totalAmount).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Estimated Delivery Fee</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>${deliveryFee.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Taxes & Fees (8%)</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>${tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--surface-border)', paddingTop: '0.75rem', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                <span>Grand Total</span>
                <span style={{ color: 'var(--primary)' }}>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || loading}
              className="btn btn-primary"
              style={{ width: '100%', height: '46px', fontSize: '1rem' }}
            >
              <CheckCircle size={18} />
              <span>{submitting ? 'Placing Order...' : `Place Order • $${grandTotal.toFixed(2)}`}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
