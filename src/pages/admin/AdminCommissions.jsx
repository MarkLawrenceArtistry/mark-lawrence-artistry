import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

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
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Filters
  const [search, setSearch] = useState('');
  const [filterPayment, setFilterPayment] = useState('all');

  const loadData = async () => {
    const [{ data: commData }, { data: prodData }] = await Promise.all([
      supabase
        .from('commissions')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase.from('products').select('title, price').order('sort_order'),
    ]);
    setCommissions(commData || []);
    setProducts(prodData || []);
  };

  useEffect(() => {
    loadData();
  }, []);

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
        setMsg({ type: 'success', text: 'Commission updated!' });
      } else {
        const { error } = await supabase.from('commissions').insert({
          ...payload,
          source: 'manual_admin',
          payment_method: 'GCash via Facebook',
        });
        if (error) throw error;
        setMsg({ type: 'success', text: 'Commission added!' });
      }
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
    const matchesPayment =
      filterPayment === 'all' || c.payment_status === filterPayment;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.client_name?.toLowerCase().includes(q) ||
      c.tag?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q);
    return matchesPayment && matchesSearch;
  });

  return (
    <div style={{ display: 'grid', gap: '30px' }}>
      {/* Add / Edit Commission Form */}
      <div className="card">
        <h2 style={{ fontSize: '2.2rem', marginBottom: '15px' }}>
          {form.id ? 'Edit Commission' : 'Input New Commission'}
        </h2>

        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '15px',
            }}
          >
            <div className="form-group">
              <label>Client Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Client or Team Name"
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
                placeholder="e.g. AdBanner (Pilot), Basic Bundle"
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
                placeholder="400"
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
              rows="3"
              className="form-control"
              placeholder="Project details, hero/theme, deadline..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? 'Saving...' : form.id ? 'Update Commission' : 'Save Commission'}
            </button>
            {form.id && (
              <button
                type="button"
                className="btn secondary"
                onClick={() => setForm(EMPTY_FORM)}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Commission Table */}
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
          <h2 style={{ fontSize: '2.2rem' }}>All Commissions ({filtered.length})</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-control"
              style={{ width: '220px' }}
              placeholder="Search client or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="form-control"
              style={{ width: '150px' }}
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
            >
              <option value="all">All Payments</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '10px' }}>Date</th>
                <th style={{ padding: '10px' }}>Client</th>
                <th style={{ padding: '10px' }}>Tag & Brief</th>
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
                  <td style={{ padding: '10px', maxWidth: '280px' }}>
                    <span
                      style={{
                        background: '#f3f4f6',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {c.tag}
                    </span>
                    <div style={{ fontSize: '0.82rem', color: '#555', marginTop: '4px' }}>
                      {c.description}
                    </div>
                  </td>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>
                    ₱{Number(c.total_amount).toLocaleString()}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <select
                      className="form-control"
                      style={{ padding: '6px 8px', fontSize: '0.85rem', minWidth: '105px' }}
                      value={c.payment_status}
                      onChange={(e) =>
                        quickUpdateStatus(c.id, 'payment_status', e.target.value)
                      }
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <select
                      className="form-control"
                      style={{ padding: '6px 8px', fontSize: '0.85rem', minWidth: '120px' }}
                      value={c.work_status}
                      onChange={(e) =>
                        quickUpdateStatus(c.id, 'work_status', e.target.value)
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="revision">Revision</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn-small"
                        onClick={() => {
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
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-small"
                        style={{ background: '#dc2626' }}
                        onClick={() => handleDelete(c.id)}
                      >
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}