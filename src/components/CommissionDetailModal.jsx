export default function CommissionDetailModal({ commission, onClose, onOpenReceipt }) {
  if (!commission) return null;

  const items =
    Array.isArray(commission.items) && commission.items.length > 0
      ? commission.items
      : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>Commission Details</h2>
            <p style={{ fontSize: '0.85rem', color: '#d4d4d8', margin: 0 }}>
              Order #{commission.id.slice(0, 8).toUpperCase()} •{' '}
              {new Date(commission.created_at).toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '1.4rem',
              cursor: 'pointer',
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body" style={{ display: 'grid', gap: '18px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '14px',
              background: '#f8f9fa',
              padding: '16px',
              borderRadius: '8px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.78rem', color: '#666' }}>CLIENT</div>
              <strong>{commission.client_name}</strong>
              {commission.client_contact && (
                <div style={{ fontSize: '0.85rem' }}>{commission.client_contact}</div>
              )}
              {commission.client_email && (
                <div style={{ fontSize: '0.85rem' }}>{commission.client_email}</div>
              )}
              {commission.fb_name && (
                <div style={{ fontSize: '0.85rem', color: '#0084ff' }}>
                  FB: {commission.fb_name}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', color: '#666' }}>STATUS</div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                <span className={`status-pill status-${commission.payment_status}`}>
                  {commission.payment_status}
                </span>
                <span className={`status-pill status-${commission.work_status}`}>
                  {commission.work_status.replace('_', ' ')}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#666', marginTop: '6px' }}>
                Method: {commission.payment_method}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', color: '#666' }}>TOTAL SALE</div>
              <div
                style={{
                  fontFamily: 'Zuume',
                  fontSize: '2.4rem',
                  color: 'var(--accent-color)',
                  lineHeight: 1,
                }}
              >
                ₱{Number(commission.total_amount).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#666' }}>Tag: {commission.tag}</div>
            </div>
          </div>

          {items && (
            <div>
              <h4 style={{ marginTop: 0 }}>Ordered Items</h4>
              <ul style={{ paddingLeft: '18px' }}>
                {items.map((item, idx) => (
                  <li key={idx}>
                    {item.title} × {item.quantity} — ₱
                    {(Number(item.price) * Number(item.quantity)).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 style={{ marginTop: 0 }}>Design Brief / Description</h4>
            <div
              style={{
                background: '#f8f9fa',
                border: '1px solid #e5e7eb',
                padding: '16px',
                borderRadius: '8px',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
              }}
            >
              {commission.description || 'No description provided.'}
            </div>
          </div>
        </div>

        <div
          className="modal-footer"
          style={{ flexDirection: 'row', justifyContent: 'flex-end' }}
        >
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              onClose();
              onOpenReceipt(commission);
            }}
          >
            <i className="fa-solid fa-receipt"></i> View / Export Receipt
          </button>
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}