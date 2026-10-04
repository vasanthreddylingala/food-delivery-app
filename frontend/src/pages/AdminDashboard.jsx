import React, { useState, useEffect } from 'react';
import { Users, Store, ShoppingBag, DollarSign, Plus, Trash2, Edit2, Shield, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import OrderCard from '../components/OrderCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'restaurants', 'orders'
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Restaurant Modal State
  const [showRestModal, setShowRestModal] = useState(false);
  const [editingRest, setEditingRest] = useState(null);
  const [restName, setRestName] = useState('');
  const [restDescription, setRestDescription] = useState('');
  const [restAddress, setRestAddress] = useState('');
  const [restPhone, setRestPhone] = useState('');
  const [restImageUrl, setRestImageUrl] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [resUsers, resRestaurants, resOrders] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/restaurants'),
        api.get('/admin/orders'),
      ]);

      if (resUsers.data?.data) setUsers(resUsers.data.data);
      if (resRestaurants.data?.data) setRestaurants(resRestaurants.data.data);
      if (resOrders.data?.data) setOrders(resOrders.data.data);
    } catch (err) {
      setError('Failed to fetch administrative data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role?role=${newRole}`);
      setSuccess('User role updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchDashboardData();
    } catch (err) {
      setError('Failed to update user role');
    }
  };

  const handleOpenAddRest = () => {
    setEditingRest(null);
    setRestName('');
    setRestDescription('');
    setRestAddress('');
    setRestPhone('');
    setRestImageUrl('');
    setShowRestModal(true);
  };

  const handleOpenEditRest = (r) => {
    setEditingRest(r);
    setRestName(r.name);
    setRestDescription(r.description || '');
    setRestAddress(r.address || '');
    setRestPhone(r.phone || '');
    setRestImageUrl(r.imageUrl || '');
    setShowRestModal(true);
  };

  const handleSaveRestaurant = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: restName,
        description: restDescription,
        address: restAddress,
        phone: restPhone,
        imageUrl: restImageUrl,
      };

      if (editingRest) {
        await api.put(`/restaurants/${editingRest.id}`, payload);
        setSuccess('Restaurant updated successfully');
      } else {
        await api.post('/restaurants', payload);
        setSuccess('Restaurant added successfully');
      }
      setShowRestModal(false);
      setTimeout(() => setSuccess(''), 3000);
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save restaurant');
    }
  };

  const handleDeleteRestaurant = async (id) => {
    if (!window.confirm('Are you sure you want to remove this restaurant?')) return;
    try {
      await api.delete(`/restaurants/${id}`);
      setSuccess('Restaurant deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchDashboardData();
    } catch (err) {
      setError('Failed to delete restaurant');
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setSuccess(`Order #${orderId} updated to ${newStatus}`);
      setTimeout(() => setSuccess(''), 3000);
      fetchDashboardData();
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.status !== 'CANCELLED' ? Number(curr.totalAmount) : 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
            <Shield size={18} />
            <span>Admin Control Center</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)' }}>Platform Management</h1>
        </div>
        <button onClick={fetchDashboardData} className="btn btn-outline btn-sm">
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {success && (
        <div style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontWeight: 500 }}>
          {success}
        </div>
      )}

      <ErrorMessage message={error} onRetry={fetchDashboardData} />

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Users</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{users.length}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Restaurants</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{restaurants.length}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Orders</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{orders.length}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total GMV</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>${totalRevenue.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--surface-border)', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('users')}
          className="btn"
          style={{
            borderRadius: '0',
            borderBottom: activeTab === 'users' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            background: 'none',
            padding: '0.75rem 1.5rem',
            marginBottom: '-2px'
          }}
        >
          <Users size={18} /> Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('restaurants')}
          className="btn"
          style={{
            borderRadius: '0',
            borderBottom: activeTab === 'restaurants' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'restaurants' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            background: 'none',
            padding: '0.75rem 1.5rem',
            marginBottom: '-2px'
          }}
        >
          <Store size={18} /> Restaurants ({restaurants.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className="btn"
          style={{
            borderRadius: '0',
            borderBottom: activeTab === 'orders' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'orders' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            background: 'none',
            padding: '0.75rem 1.5rem',
            marginBottom: '-2px'
          }}
        >
          <ShoppingBag size={18} /> Global Orders ({orders.length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading administration resources..." />
      ) : activeTab === 'users' ? (
        /* Users Table */
        <div style={{ overflowX: 'auto', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: '#f8fafc', color: 'var(--text-muted)', fontWeight: 600 }}>
                <th style={{ padding: '0.75rem 1rem' }}>User</th>
                <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                <th style={{ padding: '0.75rem 1rem' }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="form-select"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                    >
                      <option value="ROLE_CUSTOMER">ROLE_CUSTOMER</option>
                      <option value="ROLE_RESTAURANT">ROLE_RESTAURANT</option>
                      <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                    </select>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'restaurants' ? (
        /* Restaurants Table */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Restaurant Partners</h3>
            <button onClick={handleOpenAddRest} className="btn btn-primary btn-sm">
              <Plus size={16} /> Add Restaurant
            </button>
          </div>

          <div style={{ overflowX: 'auto', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: '#f8fafc', color: 'var(--text-muted)', fontWeight: 600 }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Restaurant</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Address</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Phone</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {r.imageUrl && (
                        <img
                          src={r.imageUrl}
                          alt={r.name}
                          style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 700 }}>{r.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.description}</div>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>{r.address}</td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>{r.phone}</td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenEditRest(r)}
                          className="btn btn-sm btn-outline"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteRestaurant(r.id)}
                          className="btn btn-sm btn-outline"
                          style={{ color: 'var(--danger)', borderColor: '#fca5a5' }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Orders View */
        <div>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)' }}>
              <ShoppingBag size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No orders recorded yet</h3>
            </div>
          ) : (
            <div>
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  canUpdateStatus={true}
                  onStatusUpdate={handleOrderStatusUpdate}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Restaurant Add/Edit Modal */}
      {showRestModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              {editingRest ? 'Edit Restaurant' : 'Add New Restaurant'}
            </h3>

            <form onSubmit={handleSaveRestaurant}>
              <div className="form-group">
                <label className="form-label">Restaurant Name</label>
                <input
                  type="text"
                  required
                  value={restName}
                  onChange={(e) => setRestName(e.target.value)}
                  placeholder="e.g. Bella Italia"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={2}
                  value={restDescription}
                  onChange={(e) => setRestDescription(e.target.value)}
                  placeholder="Cuisines, specialties..."
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  required
                  value={restAddress}
                  onChange={(e) => setRestAddress(e.target.value)}
                  placeholder="123 Main St"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  value={restPhone}
                  onChange={(e) => setRestPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cover Image URL</label>
                <input
                  type="url"
                  value={restImageUrl}
                  onChange={(e) => setRestImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRestModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRest ? 'Save Changes' : 'Create Restaurant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
