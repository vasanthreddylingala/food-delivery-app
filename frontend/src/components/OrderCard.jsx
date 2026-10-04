import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, DollarSign, MapPin, ChevronRight } from 'lucide-react';

export const OrderCard = ({ order, onStatusUpdate, canUpdateStatus = false }) => {
  const getBadgeClass = (status) => {
    switch (status) {
      case 'PLACED': return 'badge-placed';
      case 'CONFIRMED': return 'badge-confirmed';
      case 'PREPARING': return 'badge-preparing';
      case 'OUT_FOR_DELIVERY': return 'badge-out_for_delivery';
      case 'DELIVERED': return 'badge-delivered';
      case 'CANCELLED': return 'badge-cancelled';
      default: return 'badge-placed';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <div className="card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={18} style={{ color: 'var(--primary)' }} />
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>Order #{order.id}</span>
              <span className={`badge ${getBadgeClass(order.status)}`}>
                {order.status.replace('_', ' ')}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              <Clock size={13} />
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
              ${Number(order.totalAmount).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Order Details & Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Restaurant</span>
            <span style={{ fontWeight: 600 }}>{order.restaurantName}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Delivery Address</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <MapPin size={13} style={{ color: 'var(--primary)' }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.deliveryAddress}</span>
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Items</span>
            <span style={{ fontWeight: 500 }}>
              {order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--surface-border)', paddingTop: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          {canUpdateStatus && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</label>
              <select
                value={order.status}
                onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                className="form-select"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
              >
                <option value="PLACED">PLACED</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PREPARING">PREPARING</option>
                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          )}

          <Link
            to={`/orders/${order.id}`}
            className="btn btn-sm btn-outline"
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <span>Track & Details</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
