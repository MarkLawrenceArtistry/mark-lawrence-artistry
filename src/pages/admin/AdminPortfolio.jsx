import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import ImageUploader from '../../components/ImageUploader';

const EMPTY_FORM = {
  id: null,
  title: '',
  tag: 'AdBanner',
  image_url: '',
  sort_order: 0,
  is_active: true,
};

export default function AdminPortfolio() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadPortfolio = async () => {
    const { data } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    setItems(data || []);
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setForm(item);
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image_url.trim()) {
      setError('Please upload or paste an image URL first.');
      return;
    }

    setSaving(true);
    setError('');
    const payload = {
      title: form.title.trim() || 'Design',
      tag: form.tag.trim() || 'Esports',
      image_url: form.image_url.trim(),
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };

    try {
      if (form.id) {
        const { error: err } = await supabase
          .from('portfolio_items')
          .update(payload)
          .eq('id', form.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('portfolio_items').insert(payload);
        if (err) throw err;
      }
      setModalOpen(false);
      await loadPortfolio();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this portfolio item?')) return;
    await supabase.from('portfolio_items').delete().eq('id', id);
    await loadPortfolio();
  };

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
          Portfolio Items ({items.length})
        </h2>
        <button type="button" className="btn" onClick={openNew}>
          <i className="fa-solid fa-plus"></i> Add Portfolio Design
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: '20px',
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              overflow: 'hidden',
              background: '#fafafa',
            }}
          >
            <img
              src={item.image_url}
              alt={item.title}
              style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }}
            />
            <div style={{ padding: '12px' }}>
              <strong>{item.title}</strong>
              <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '10px' }}>
                Tag: {item.tag} • {item.is_active ? 'Visible' : 'Hidden'}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" className="icon-btn" onClick={() => openEdit(item)}>
                  <i className="fa-solid fa-pen"></i> Edit
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  style={{ color: '#dc2626' }}
                  onClick={() => handleDelete(item.id)}
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '2rem', margin: 0 }}>
                {form.id ? 'Edit Portfolio Design' : 'Upload Portfolio Design'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
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
              {error && <div className="alert alert-error">{error}</div>}

              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. MLBB Pilot Pricelist"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px',
                  gap: '12px',
                }}
              >
                <div className="form-group">
                  <label>Tag / Category</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. AdBanner, Pricelist, FB Cover"
                    value={form.tag}
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
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

              <ImageUploader
                label="Portfolio Artwork (Cloudinary) *"
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
              />

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  id="portActiveModal"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                <label htmlFor="portActiveModal" style={{ margin: 0 }}>
                  Visible on Portfolio Page
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn" disabled={saving}>
                  {saving ? 'Saving...' : form.id ? 'Update Design' : 'Add to Portfolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}