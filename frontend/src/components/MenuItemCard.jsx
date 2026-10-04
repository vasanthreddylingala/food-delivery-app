import React, { useState } from 'react';
import { Plus, Minus, Check, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const MenuItemCard = ({ item }) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const defaultImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80';

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      await addToCart(item.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch (err) {
      alert(err.message || 'Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ position: 'relative', height: '160px', width: '100%', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
        <img
          src={item.imageUrl || defaultImage}
          alt={item.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.src = defaultImage; }}
        />
        {!item.available && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}>
            Sold Out
          </div>
        )}
      </div>

      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</h4>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
              ${Number(item.price).toFixed(2)}
            </span>
          </div>

          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {item.description || 'Prepared fresh with high quality ingredients.'}
          </p>
        </div>

        {item.available ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            {/* Quantity Selector */}
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
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ background: 'transparent', padding: '4px 8px', color: 'var(--text-muted)' }}
              >
                <Minus size={14} />
              </button>
              <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 600, fontSize: '0.85rem' }}>
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                style={{ background: 'transparent', padding: '4px 8px', color: 'var(--text-muted)' }}
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Add button */}
            <button
              onClick={handleAddToCart}
              disabled={loading}
              className={`btn btn-sm ${added ? 'btn-primary' : 'btn-primary'}`}
              style={{
                flex: 1,
                backgroundColor: added ? 'var(--success)' : 'var(--primary)',
                borderColor: added ? 'var(--success)' : 'var(--primary)'
              }}
            >
              {added ? (
                <>
                  <Check size={16} /> Added
                </>
              ) : (
                <>
                  <ShoppingBag size={16} /> Add to Cart
                </>
              )}
            </button>
          </div>
        ) : (
          <button disabled className="btn btn-sm btn-outline" style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }}>
            Unavailable
          </button>
        )}
      </div>
    </div>
  );
};

export default MenuItemCard;
