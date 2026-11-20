import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import CommissionDetailModal from '../../components/CommissionDetailModal';
import CommissionReceiptModal from '../../components/CommissionReceiptModal';

const EMPTY_FORM = {
  id: null,
  client_name: '',
  client_contact: '',
  client_email: '',
  fb_name: '',
  tag: '',
  description: '',
  total_amount: '',
  payment_status: 'paid',
  work_status: 'pending',
};

export default function AdminCommissions() {
  const [commissions, setCommissions] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [detailOrder, setDetailOrder] = useState(null);
  const [receiptOrder, setReceiptOrder] = useState(null);

  const [search, setSearch] = useState('');
  const [filterPayment, setFilterPayment] = useState('all');

  const loadData = async () => {
    const [{ data: commData }, { data: prodData }] = await Promise.all([
      supabase.from('commissions').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('title, price').order('sort_order'),
    ]);
    setCommissions(commData || []);
    setProducts(prodData || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNewModal = () => {
    setForm(EMPTY_FORM);
    setMsg({ type: '', text: '' });
    setFormModalOpen(true);
  };

  const openEditModal = (c) => {
    setForm({
      id: c.id,
      client_name: c.client_name || '',
      client_contact: c.client_contact || '',
      client_email: c.client_email || '',
      fb_name: c.fb_name || '',
      tag: c.tag || '',
      description: c.description || '',
      total_amount: c.total_amount || 0,
      payment_status: c.payment_status,
      work_status: c.work_status,
    });
    setMsg({ type: '', text: '' });
    setFormModalOpen(true);
  };

  const handleProductPreset = (title) => {
    const found = products.find((p) => p.title === title);
    if (found) {
      setForm((prev) => ({
        ...prev,
        tag: found.title,
        total_amount: prev.total_amount || found.price,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

    const payload = {
      client_name: form.client_name.trim(),
      client_contact: form.client_contact.trim(),
      client_email: form.client_email.trim(),
      fb_name: form.fb_name.trim(),
      tag: form.tag.trim() || 'Custom',
      description: form.description.trim(),
      total_amount: Number(form.total_amount) || 0,
      payment_status: form.payment_status,
      work_status: form.work_status,
      updated_at: new Date().toISOString(),
    };

    try {
      if (form.id) {
        const { error } = await supabase
          .from('commissions')
          .update(payload)
          .eq('id', form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('commissions').insert({
          ...payload,
          source: 'manual_admin',
          payment_method: 'GCash via Facebook',
        });
        if (error) throw error;
      }
      setFormModalOpen(false);
      setForm(EMPTY_FORM);
      await loadData();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const quickUpdateStatus = async (id, field, value) => {
    await supabase
      .from('commissions')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('id', id);
    setCommissions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this commission record?')) return;
    await supabase.from('commissions').delete().eq('id', id);
    await loadData();
  };

  const filtered = commissions.filter((c) => {
    const matchesPayment = filterPayment === 'all' || c.payment_status === filterPayment;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.client_name?.toLowerCase().includes(q) ||
      c.tag?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q);
    return matchesPayment && matchesSearch;
  });

  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ fontSize: '2.2rem', margin: 0 }}>
          Commissions ({filtered.length})
        </h2>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            className="form-control"
            style={{ width: '210px' }}
            placeholder="Search client or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-control"
            style={{ width: '145px' }}
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
          >
            <option value="all">All Payments</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
          <button type="button" className="btn" onClick={openNewModal}>
            <i className="fa-solid fa-plus"></i> Input New Commission
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '10px' }}>Date</th>
              <th style={{ padding: '10px' }}>Client</th>
              <th style={{ padding: '10px' }}>Tag</th>
              <th style={{ padding: '10px' }}>Sale</th>
              <th style={{ padding: '10px' }}>Payment</th>
              <th style={{ padding: '10px' }}>Work</th>
              <th style={{ padding: '10px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                  {new Date(c.created_at).toLocaleDateString()}
                  <div style={{ fontSize: '0.75rem', color: '#888' }}>
                    {c.source === 'website_cart' ? 'Cart Order' : 'Manual'}
                  </div>
                </td>
                <td style={{ padding: '10px' }}>
                  <strong>{c.client_name}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {c.fb_name || c.client_contact || c.client_email}
                  </div>
                </td>
                <td style={{ padding: '10px' }}>
                  <span
                    style={{
                      background: '#f3f4f6',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                    }}
                  >
                    {c.tag}
                  </span>
                </td>
                <td style={{ padding: '10px', fontWeight: 600 }}>
                  ₱{Number(c.total_amount).toLocaleString()}
                </td>
                <td style={{ padding: '10px' }}>
                  <select
                    className="form-control"
                    style={{ padding: '6px 8px', fontSize: '0.85rem', minWidth: '105px' }}
                    value={c.payment_status}
                    onChange={(e) => quickUpdateStatus(c.id, 'payment_status', e.target.value)}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </td>
                <td style={{ padding: '10px' }}>
                  <select
                    className="form-control"
                    style={{ padding: '6px 8px', fontSize: '0.85rem', minWidth: '115px' }}
                    value={c.work_status}
                    onChange={(e) => quickUpdateStatus(c.id, 'work_status', e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="revision">Revision</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="icon-btn"
                      title="View Details"
                      onClick={() => setDetailOrder(c)}
                    >
                      <i className="fa-solid fa-eye"></i>
                    </button>
                    <button
                      type="button"
                      className="icon-btn accent"
                      title="Receipt"
                      onClick={() => setReceiptOrder(c)}
                    >
                      <i className="fa-solid fa-receipt"></i>
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      title="Edit"
                      onClick={() => openEditModal(c)}
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      style={{ color: '#dc2626' }}
                      title="Delete"
                      onClick={() => handleDelete(c.id)}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Commission Modal */}
      {formModalOpen && (
        <div className="modal-overlay" onClick={() => setFormModalOpen(false)}>
          <div className="modal-box wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '2rem', margin: 0 }}>
                {form.id ? 'Edit Commission' : 'Input New Commission'}
              </h2>
              <button
                type="button"
                onClick={() => setFormModalOpen(false)}
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

            <form onSubmit={handleSubmit} className="modal-body">
              {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '14px',
                }}
              >
                <div className="form-group">
                  <label>Client Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.client_name}
                    onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Quick Preset (Optional)</label>
                  <select
                    className="form-control"
                    defaultValue=""
                    onChange={(e) => handleProductPreset(e.target.value)}
                  >
                    <option value="">-- Select service preset --</option>
                    {products.map((p) => (
                      <option key={p.title} value={p.title}>
                        {p.title} (₱{p.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Tag / Service Type *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.tag}
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Sale Amount (₱) *</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    value={form.total_amount}
                    onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.client_contact}
                    onChange={(e) => setForm({ ...form, client_contact: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Facebook Name / Link</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.fb_name}
                    onChange={(e) => setForm({ ...form, fb_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Payment Status</label>
                  <select
                    className="form-control"
                    value={form.payment_status}
                    onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Work Status</label>
                  <select
                    className="form-control"
                    value={form.work_status}
                    onChange={(e) => setForm({ ...form, work_status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="revision">Revision</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Commission Description / Brief</label>
                <textarea
                  rows="4"
                  className="form-control"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setFormModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn" disabled={saving}>
                  {saving ? 'Saving...' : form.id ? 'Update Commission' : 'Save Commission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CommissionDetailModal
        commission={detailOrder}
        onClose={() => setDetailOrder(null)}
        onOpenReceipt={(order) => setReceiptOrder(order)}
      />
      <CommissionReceiptModal
        commission={receiptOrder}
        onClose={() => setReceiptOrder(null)}
      />
    </div>
  );
}