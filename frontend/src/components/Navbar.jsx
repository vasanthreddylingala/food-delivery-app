import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ShoppingBag, User, LogOut, LayoutDashboard, Shield, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const { user, isAuthenticated, isCustomer, isRestaurant, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="brand-logo">
          <UtensilsCrossed size={26} />
          <span>FoodSwift</span>
        </Link>

        <nav className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/restaurants" className="nav-link">Restaurants</Link>

          {isAuthenticated && isCustomer && (
            <Link to="/orders" className="nav-link">
              <ClipboardList size={18} />
              <span>My Orders</span>
            </Link>
          )}

          {isAuthenticated && isRestaurant && (
            <Link to="/restaurant/dashboard" className="nav-link">
              <LayoutDashboard size={18} />
              <span>Restaurant Portal</span>
            </Link>
          )}

          {isAuthenticated && isAdmin && (
            <Link to="/admin/dashboard" className="nav-link">
              <Shield size={18} />
              <span>Admin Panel</span>
            </Link>
          )}

          {/* Cart Icon */}
          <Link to="/cart" className="cart-button">
            <ShoppingBag size={18} />
            <span>Cart</span>
            {cart.totalItems > 0 && (
              <span className="cart-badge">{cart.totalItems}</span>
            )}
          </Link>

          {/* Auth State */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                <User size={18} style={{ color: 'var(--primary)' }} />
                <span>{user.name.split(' ')[0]}</span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: '#e2e8f0',
                  color: '#475569'
                }}>
                  {user.role === 'ROLE_ADMIN' ? 'Admin' : user.role === 'ROLE_RESTAURANT' ? 'Owner' : 'Customer'}
                </span>
              </div>
              <button onClick={handleLogout} className="btn btn-sm btn-outline" title="Log out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-sm btn-outline">Log in</Link>
              <Link to="/register" className="btn btn-sm btn-primary">Sign up</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
