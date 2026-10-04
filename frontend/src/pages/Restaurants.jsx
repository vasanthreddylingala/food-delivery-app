import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import RestaurantCard from '../components/RestaurantCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export const Restaurants = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRestaurants = async (searchQuery = search, pageNumber = page) => {
    setLoading(true);
    setError('');
    try {
      const url = `/restaurants?search=${encodeURIComponent(searchQuery)}&page=${pageNumber}&size=8`;
      const res = await api.get(url);
      if (res.data?.data) {
        setRestaurants(res.data.data.content);
        setTotalPages(res.data.data.totalPages || 1);
        setPage(res.data.data.pageNumber);
      }
    } catch (err) {
      setError('Failed to load restaurants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants(initialSearch, 0);
  }, [initialSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(search ? { search } : {});
    fetchRestaurants(search, 0);
  };

  const handleCategoryClick = (term) => {
    setSearch(term);
    setSearchParams({ search: term });
    fetchRestaurants(term, 0);
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
          Explore Restaurants
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Browse top restaurants, specialty kitchens, and order your favorite dishes
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', maxWidth: '600px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by restaurant name or cuisine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setSearchParams({}); fetchRestaurants('', 0); }}
              className="btn btn-outline"
            >
              Clear
            </button>
          )}
        </form>

        {/* Quick Tags */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['All', 'Pizza', 'Burger', 'Asian', 'Curry', 'Biryani'].map((tag) => (
            <button
              key={tag}
              onClick={() => handleCategoryClick(tag === 'All' ? '' : tag)}
              className={`btn btn-sm ${(!search && tag === 'All') || search.toLowerCase() === tag.toLowerCase() ? 'btn-primary' : 'btn-outline'}`}
              style={{ borderRadius: 'var(--radius-full)', padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <ErrorMessage message={error} onRetry={() => fetchRestaurants(search, page)} />

      {loading ? (
        <LoadingSpinner message="Searching restaurants..." />
      ) : restaurants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>No restaurants found</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Try clearing filters or searching for something else</p>
          <button onClick={() => { setSearch(''); setSearchParams({}); fetchRestaurants('', 0); }} className="btn btn-primary btn-sm">
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid-auto-fill">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '2.5rem' }}>
              <button
                disabled={page <= 0}
                onClick={() => fetchRestaurants(search, page - 1)}
                className="btn btn-sm btn-outline"
                style={{ opacity: page <= 0 ? 0.5 : 1 }}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => fetchRestaurants(search, page + 1)}
                className="btn btn-sm btn-outline"
                style={{ opacity: page >= totalPages - 1 ? 0.5 : 1 }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Restaurants;
