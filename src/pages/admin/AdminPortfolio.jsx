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
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image_url.trim()) {
      setMsg({ type: 'error', text: 'Please upload or paste an image URL first.' });
      return;
    }

    setSaving(true);
    setMsg({ type: '', text: '' });
    const payload = {
      title: form.title.trim() || 'Design',
      tag: form.tag.trim() || 'Esports',
      image_url: form.image_url.trim(),
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };

    try {
      if (form.id) {
        const { error } = await supabase
          .from('portfolio_items')
          .update(payload)
          .eq('id', form.id);
        if (error) throw error;
        setMsg({ type: 'success', text: 'Portfolio item updated!' });
      } else {
        const { error } = await supabase.from('portfolio_items').insert(payload);
        if (error) throw error;
        setMsg({ type: 'success', text: 'Portfolio item added!' });
      }
      setForm(EMPTY_FORM);
      await loadPortfolio();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
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
    <div style={{ display: 'grid', gap: '30px' }}>
      <div className="card">
        <h2 style={{ fontSize: '2.2rem', marginBottom: '15px' }}>
          {form.id ? 'Edit Portfolio Design' : 'Upload Portfolio Design'}
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
              <label>Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. MLBB Pilot Pricelist"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

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
              id="portActive"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            <label htmlFor="portActive" style={{ margin: 0 }}>
              Visible on Portfolio Page
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? 'Saving...' : form.id ? 'Update Design' : 'Add to Portfolio'}
            </button>
            {form.id && (
              <button
                type="button"
                className="btn secondary"
                onClick={() => setForm(EMPTY_FORM)}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '2.2rem', marginBottom: '20px' }}>
          Portfolio Items ({items.length})
        </h2>
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
                  <button
                    type="button"
                    className="btn-small"
                    onClick={() => {
                      setForm(item);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-small"
                    style={{ background: '#dc2626' }}
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}