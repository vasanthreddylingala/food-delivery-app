import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sparkles, Clock, ShieldCheck, ArrowRight, Utensils } from 'lucide-react';
import api from '../api/axios';
import RestaurantCard from '../components/RestaurantCard';
import LoadingSpinner from '../components/LoadingSpinner';

export const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopRestaurants = async () => {
      try {
        const res = await api.get('/restaurants?page=0&size=4');
        if (res.data?.data?.content) {
          setRestaurants(res.data.data.content);
        }
      } catch (err) {
        console.error('Failed to load restaurants:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopRestaurants();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/restaurants');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        backgroundColor: '#fff7ed',
        borderRadius: 'var(--radius-lg)',
        padding: '3.5rem 2rem',
        marginBottom: '3rem',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #ffedd5'
      }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#ffedd5',
            color: 'var(--primary)',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            <Sparkles size={14} />
            <span>Fast, Fresh & Delivered to Your Door</span>
          </div>

          <h1 style={{
            fontSize: '2.75rem',
            fontWeight: 800,
            lineHeight: 1.2,
            color: 'var(--secondary)',
            marginBottom: '1rem'
          }}>
            Craving your favorite dishes? <span style={{ color: 'var(--primary)' }}>FoodSwift</span> has you covered.
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Discover top-rated local eateries, artisan pizzerias, gourmet burgers, and fresh wok specials in seconds.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', maxWidth: '540px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search food, cuisines, or restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem', height: '48px', fontSize: '1rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem', height: '48px' }}>
              Find Food
            </button>
          </form>
        </div>
      </section>

      {/* Highlights */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Clock size={24} />
          </div>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>Ultra-Fast Delivery</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hot meals delivered from kitchen to your door in under 30 mins.</p>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
            <Utensils size={24} />
          </div>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>Artisan Restaurants</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Curated selections of authentic, hygiene-verified partners.</p>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>Live Order Tracking</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Real-time status tracking from placed to preparation to delivery.</p>
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>Featured Restaurants</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Top picks rated highly by food lovers</p>
          </div>
          <Link to="/restaurants" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Discovering top kitchens..." />
        ) : (
          <div className="grid-auto-fill">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
