import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import ImageUploader from '../../components/ImageUploader';

const EMPTY_FORM = {
  id: null,
  title: '',
  description: '',
  category: 'standard',
  badge_text: 'Standard',
  price: 400,
  image_url: '',
  sort_order: 0,
  is_active: true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    setProducts(data || []);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      badge_text: form.badge_text.trim(),
      price: Number(form.price),
      image_url: form.image_url.trim(),
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };

    try {
      if (form.id) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', form.id);
        if (error) throw error;
        setMsg({ type: 'success', text: 'Service updated!' });
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
        setMsg({ type: 'success', text: 'New service added!' });
      }
      setForm(EMPTY_FORM);
      await loadProducts();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service/product?')) return;
    await supabase.from('products').delete().eq('id', id);
    await loadProducts();
  };

  const toggleActive = async (item) => {
    await supabase
      .from('products')
      .update({ is_active: !item.is_active })
      .eq('id', item.id);
    await loadProducts();
  };

  return (
    <div style={{ display: 'grid', gap: '30px' }}>
      <div className="card">
        <h2 style={{ fontSize: '2.2rem', marginBottom: '15px' }}>
          {form.id ? 'Edit Service / Bundle' : 'Add New Service / Bundle'}
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
              <label>Title *</label>
              <input
                type="text"
                className="form-control"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                className="form-control"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="templates">Templates / PSD</option>
                <option value="bundles">Bundles</option>
              </select>
            </div>

            <div className="form-group">
              <label>Badge Text</label>
              <input
                type="text"
                className="form-control"
                value={form.badge_text}
                onChange={(e) => setForm({ ...form, badge_text: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Price (₱) *</label>
              <input
                type="number"
                className="form-control"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Sort Order</label>
              <input
                type="number"
                className="form-control"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              className="form-control"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <ImageUploader
            label="Thumbnail / Sample Image (Cloudinary)"
            value={form.image_url}
            onChange={(url) => setForm({ ...form, image_url: url })}
          />

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              id="prodActive"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            <label htmlFor="prodActive" style={{ margin: 0 }}>
              Visible on Pricing Page
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? 'Saving...' : form.id ? 'Update Service' : 'Add Service'}
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

      <div className="card">
        <h2 style={{ fontSize: '2.2rem', marginBottom: '15px' }}>
          All Services ({products.length})
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '10px' }}>Image</th>
                <th style={{ padding: '10px' }}>Title</th>
                <th style={{ padding: '10px' }}>Category</th>
                <th style={{ padding: '10px' }}>Price</th>
                <th style={{ padding: '10px' }}>Status</th>
                <th style={{ padding: '10px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px' }}>
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.title}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                    ) : (
                      <span style={{ color: '#999', fontSize: '0.8rem' }}>None</span>
                    )}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <strong>{p.title}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{p.description}</div>
                  </td>
                  <td style={{ padding: '10px', textTransform: 'capitalize' }}>{p.category}</td>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>
                    ₱{Number(p.price).toLocaleString()}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <button
                      type="button"
                      onClick={() => toggleActive(p)}
                      className={`status-pill ${p.is_active ? 'status-paid' : 'status-cancelled'}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {p.is_active ? 'Visible' : 'Hidden'}
                    </button>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn-small"
                        onClick={() => {
                          setForm(p);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-small"
                        style={{ background: '#dc2626' }}
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
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