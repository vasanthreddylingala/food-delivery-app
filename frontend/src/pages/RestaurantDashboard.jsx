import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Package, Utensils, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import OrderCard from '../components/OrderCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export const RestaurantDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'menu'
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add/Edit menu item form state
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [itemAvailable, setItemAvailable] = useState(true);

  // Load restaurants on mount
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await api.get('/restaurants?page=0&size=50');
        if (res.data?.data?.content) {
          setRestaurants(res.data.data.content);
          if (res.data.data.content.length > 0) {
            setSelectedRestaurantId(res.data.data.content[0].id);
          }
        }
      } catch (err) {
        setError('Failed to fetch restaurants.');
      }
    };
    fetchRestaurants();
  }, []);

  // Fetch orders and menu for selected restaurant
  const refreshData = async () => {
    if (!selectedRestaurantId) return;
    setLoading(true);
    setError('');
    try {
      const [resOrders, resMenu] = await Promise.all([
        api.get(`/orders?restaurantId=${selectedRestaurantId}`),
        api.get(`/restaurants/${selectedRestaurantId}/menu`)
      ]);

      if (resOrders.data?.data) {
        setOrders(resOrders.data.data);
      }
      if (resMenu.data?.data) {
        setMenuItems(resMenu.data.data);
      }
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [selectedRestaurantId]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setSuccess(`Order #${orderId} updated to ${newStatus}`);
      setTimeout(() => setSuccess(''), 3000);
      refreshData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setItemName('');
    setItemDescription('');
    setItemPrice('');
    setItemImageUrl('');
    setItemAvailable(true);
    setShowItemModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemDescription(item.description || '');
    setItemPrice(item.price);
    setItemImageUrl(item.imageUrl || '');
    setItemAvailable(item.available);
    setShowItemModal(true);
  };

  const handleSaveMenuItem = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: itemName,
        description: itemDescription,
        price: parseFloat(itemPrice),
        imageUrl: itemImageUrl,
        available: itemAvailable,
      };

      if (editingItem) {
        await api.put(`/menu/${editingItem.id}`, payload);
        setSuccess('Menu item updated successfully!');
      } else {
        await api.post(`/restaurants/${selectedRestaurantId}/menu`, payload);
        setSuccess('Menu item added successfully!');
      }
      setShowItemModal(false);
      setTimeout(() => setSuccess(''), 3000);
      refreshData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save menu item');
    }
  };

  const handleToggleAvailable = async (item) => {
    try {
      await api.put(`/menu/${item.id}`, {
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        available: !item.available,
      });
      refreshData();
    } catch (err) {
      setError('Failed to update availability');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await api.delete(`/menu/${itemId}`);
      setSuccess('Item deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      refreshData();
    } catch (err) {
      setError('Failed to delete menu item');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)' }}>Restaurant Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Manage your menu offerings and live customer orders</p>
        </div>

        {/* Restaurant selector dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Restaurant:</label>
          <select
            value={selectedRestaurantId}
            onChange={(e) => setSelectedRestaurantId(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '220px' }}
          >
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <button onClick={refreshData} className="btn btn-sm btn-outline" title="Refresh">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {success && (
        <div style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontWeight: 500 }}>
          {success}
        </div>
      )}

      <ErrorMessage message={error} onRetry={refreshData} />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--surface-border)', marginBottom: '2rem' }}>
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
          <Package size={18} /> Incoming Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className="btn"
          style={{
            borderRadius: '0',
            borderBottom: activeTab === 'menu' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'menu' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            background: 'none',
            padding: '0.75rem 1.5rem',
            marginBottom: '-2px'
          }}
        >
          <Utensils size={18} /> Menu Management ({menuItems.length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Refreshing restaurant information..." />
      ) : activeTab === 'orders' ? (
        /* Orders Tab */
        <div>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)' }}>
              <Package size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No incoming orders right now</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>When customers order from this restaurant, orders will appear here for processing.</p>
            </div>
          ) : (
            <div>
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  canUpdateStatus={true}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Menu Tab */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Dishes & Beverages</h3>
            <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm">
              <Plus size={16} /> Add Menu Item
            </button>
          </div>

          <div style={{ overflowX: 'auto', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: '#f8fafc', color: 'var(--text-muted)', fontWeight: 600 }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Item</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Price</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Availability</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.description}</div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>
                      ${Number(item.price).toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => handleToggleAvailable(item)}
                        className={`btn btn-sm ${item.available ? 'badge-delivered' : 'badge-cancelled'}`}
                        style={{ border: 'none', cursor: 'pointer', padding: '0.25rem 0.6rem' }}
                      >
                        {item.available ? 'In Stock' : 'Sold Out'}
                      </button>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="btn btn-sm btn-outline"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
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
      )}

      {/* Add / Edit Item Modal */}
      {showItemModal && (
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
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h3>

            <form onSubmit={handleSaveMenuItem}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Truffle Cheeseburger"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={2}
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="Ingredients and culinary notes..."
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  placeholder="12.99"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  value={itemImageUrl}
                  onChange={(e) => setItemImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="availableCheck"
                  checked={itemAvailable}
                  onChange={(e) => setItemAvailable(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                />
                <label htmlFor="availableCheck" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  Available in menu
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDashboard;
