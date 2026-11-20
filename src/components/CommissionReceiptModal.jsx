export default function CommissionReceiptModal({ commission, onClose }) {
  if (!commission) return null;

  const receiptNo = `MLA-${commission.id.slice(0, 8).toUpperCase()}`;
  const dateStr = new Date(commission.created_at).toLocaleString();
  const isPaid = commission.payment_status === 'paid';

  const items =
    Array.isArray(commission.items) && commission.items.length > 0
      ? commission.items
      : [
          {
            title: commission.tag || 'Custom Commission',
            quantity: 1,
            price: Number(commission.total_amount) || 0,
          },
        ];

  const handleDownloadPng = () => {
    const canvas = document.createElement('canvas');
    const width = 760;
    const height = 560 + items.length * 42;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Header Banner
    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(0, 0, width, 115);
    ctx.fillStyle = '#ee3154';
    ctx.fillRect(0, 115, width, 6);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('MARK LAWRENCE ARTISTRY', 40, 52);
    ctx.font = '15px Arial';
    ctx.fillStyle = '#d4d4d8';
    ctx.fillText('Official Commission Receipt / Order Summary', 40, 82);

    // Status Pill
    ctx.fillStyle = isPaid ? '#16a34a' : '#d97706';
    ctx.fillRect(width - 170, 38, 130, 38);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(commission.payment_status.toUpperCase(), width - 105, 63);
    ctx.textAlign = 'left';

    // Metadata
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 15px Arial';
    ctx.fillText(`Receipt No: ${receiptNo}`, 40, 160);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#555555';
    ctx.fillText(`Date: ${dateStr}`, 40, 185);
    ctx.fillText(`Payment Method: ${commission.payment_method || 'GCash via Facebook'}`, 40, 208);

    // Client Info
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 15px Arial';
    ctx.fillText('Billed To:', 420, 160);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#555555';
    ctx.fillText(commission.client_name || 'Client', 420, 185);
    if (commission.client_contact) ctx.fillText(commission.client_contact, 420, 208);
    if (commission.client_email) ctx.fillText(commission.client_email, 420, 230);

    // Divider
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 260);
    ctx.lineTo(width - 40, 260);
    ctx.stroke();

    // Table Header
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('SERVICE / ITEM', 40, 290);
    ctx.fillText('QTY', 470, 290);
    ctx.textAlign = 'right';
    ctx.fillText('AMOUNT', width - 40, 290);
    ctx.textAlign = 'left';

    // Items
    let y = 325;
    ctx.font = '14px Arial';
    items.forEach((item) => {
      const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillText(String(item.title).slice(0, 46), 40, y);
      ctx.fillStyle = '#555555';
      ctx.fillText(String(item.quantity || 1), 475, y);
      ctx.fillStyle = '#1a1a1a';
      ctx.textAlign = 'right';
      ctx.fillText(`PHP ${lineTotal.toLocaleString()}`, width - 40, y);
      ctx.textAlign = 'left';
      y += 40;
    });

    // Total Divider
    ctx.strokeStyle = '#e5e7eb';
    ctx.beginPath();
    ctx.moveTo(40, y + 10);
    ctx.lineTo(width - 40, y + 10);
    ctx.stroke();

    // Total
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText('TOTAL AMOUNT', 40, y + 52);
    ctx.fillStyle = '#ee3154';
    ctx.textAlign = 'right';
    ctx.fillText(
      `PHP ${Number(commission.total_amount).toLocaleString()}`,
      width - 40,
      y + 52
    );
    ctx.textAlign = 'left';

    // Footer Note
    ctx.fillStyle = '#777777';
    ctx.font = '13px Arial';
    ctx.fillText(
      'Thank you for commissioning Mark Lawrence Artistry! Keep this receipt for your records.',
      40,
      height - 40
    );

    const link = document.createElement('a');
    link.download = `${receiptNo}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>Commission Receipt</h2>
            <p style={{ fontSize: '0.85rem', color: '#d4d4d8', margin: 0 }}>
              {receiptNo}
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

        <div className="modal-body" id="printable-receipt">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '16px',
              paddingBottom: '16px',
              borderBottom: '2px solid #f0f0f0',
              marginBottom: '16px',
            }}
          >
            <div>
              <strong style={{ fontSize: '1.15rem' }}>Mark Lawrence Artistry</strong>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                marklawrence.artistry@gmail.com
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '6px' }}>
                Receipt #: <strong>{receiptNo}</strong>
                <br />
                Date: {dateStr}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className={`status-pill status-${commission.payment_status}`}>
                {commission.payment_status}
              </span>
              <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
                <strong>Client:</strong> {commission.client_name}
                {commission.client_contact && <div>{commission.client_contact}</div>}
                {commission.client_email && <div>{commission.client_email}</div>}
              </div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                <th style={{ padding: '8px 4px' }}>Service</th>
                <th style={{ padding: '8px 4px' }}>Qty</th>
                <th style={{ padding: '8px 4px', textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '10px 4px' }}>{item.title}</td>
                  <td style={{ padding: '10px 4px' }}>{item.quantity || 1}</td>
                  <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                    ₱{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8f9fa',
              padding: '14px 16px',
              borderRadius: '8px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.82rem', color: '#666' }}>Payment Method</div>
              <strong>{commission.payment_method || 'GCash via Facebook'}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.82rem', color: '#666' }}>Total Amount</div>
              <strong style={{ fontSize: '1.5rem', color: 'var(--accent-color)' }}>
                ₱{Number(commission.total_amount).toLocaleString()}
              </strong>
            </div>
          </div>
        </div>

        <div
          className="modal-footer"
          style={{ flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap' }}
        >
          <button type="button" className="btn secondary" onClick={() => window.print()}>
            <i className="fa-solid fa-print"></i> Print / Save PDF
          </button>
          <button type="button" className="btn" onClick={handleDownloadPng}>
            <i className="fa-solid fa-download"></i> Export Receipt (PNG)
          </button>
        </div>
      </div>
    </div>
  );
}