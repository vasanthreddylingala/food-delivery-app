import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, ArrowRight } from 'lucide-react';

export const RestaurantCard = ({ restaurant }) => {
  const defaultImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ position: 'relative', height: '190px', width: '100%', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
        <img
          src={restaurant.imageUrl || defaultImage}
          alt={restaurant.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.src = defaultImage; }}
        />
      </div>

      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            {restaurant.name}
          </h3>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {restaurant.description || 'Delicious freshly prepared culinary specialties.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{restaurant.address}</span>
            </div>
            {restaurant.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>{restaurant.phone}</span>
              </div>
            )}
          </div>
        </div>

        <Link
          to={`/restaurants/${restaurant.id}`}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          <span>Explore Menu</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default RestaurantCard;
