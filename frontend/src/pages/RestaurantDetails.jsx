import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, ArrowLeft, UtensilsCrossed } from 'lucide-react';
import api from '../api/axios';
import MenuItemCard from '../components/MenuItemCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export const RestaurantDetails = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const defaultBanner = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80';

  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      setLoading(true);
      setError('');
      try {
        const [resDetails, resMenu] = await Promise.all([
          api.get(`/restaurants/${id}`),
          api.get(`/restaurants/${id}/menu`)
        ]);

        if (resDetails.data?.data) {
          setRestaurant(resDetails.data.data);
        }
        if (resMenu.data?.data) {
          setMenuItems(resMenu.data.data);
        }
      } catch (err) {
        setError('Failed to load restaurant details or menu.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantAndMenu();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Loading restaurant & freshly prepared menu..." />;
  }

  if (error || !restaurant) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <ErrorMessage message={error || 'Restaurant not found'} />
        <Link to="/restaurants" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem' }}>
          <ArrowLeft size={16} /> Back to restaurants
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/restaurants" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.25rem' }}>
        <ArrowLeft size={16} />
        <span>Back to all restaurants</span>
      </Link>

      {/* Restaurant Header Banner */}
      <div className="card" style={{ marginBottom: '2.5rem', overflow: 'hidden' }}>
        <div style={{ position: 'relative', height: '240px', width: '100%' }}>
          <img
            src={restaurant.imageUrl || defaultBanner}
            alt={restaurant.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.src = defaultBanner; }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 100%)'
          }} />
          <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', color: 'white' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>{restaurant.name}</h1>
            <p style={{ fontSize: '1rem', opacity: 0.9, maxWidth: '700px' }}>{restaurant.description}</p>
          </div>
        </div>

        <div style={{ padding: '1rem 1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', backgroundColor: 'white', borderTop: '1px solid var(--surface-border)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={16} style={{ color: 'var(--primary)' }} />
            <span>{restaurant.address}</span>
          </div>
          {restaurant.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={16} style={{ color: 'var(--primary)' }} />
              <span>{restaurant.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Menu Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <UtensilsCrossed size={22} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--secondary)' }}>Menu Items</h2>
        </div>

        {menuItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)' }}>
            <p style={{ color: 'var(--text-muted)' }}>No menu items available for this restaurant currently.</p>
          </div>
        ) : (
          <div className="grid-auto-fill">
            {menuItems.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetails;
