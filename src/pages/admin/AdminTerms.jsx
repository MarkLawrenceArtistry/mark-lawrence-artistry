import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const EMPTY_FORM = {
  id: null,
  section_title: '',
  section_subtitle: '',
  sort_order: 0,
  is_active: true,
  items: [{ badge: '', text: '', dark: false }],
  fee_cards: [],
  columns: [],
};

export default function AdminTerms() {
  const [sections, setSections] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const loadTerms = async () => {
    const { data } = await supabase
      .from('terms_sections')
      .select('*')
      .order('sort_order', { ascending: true });
    setSections(data || []);
  };

  useEffect(() => {
    loadTerms();
  }, []);

  const handleEdit = (sec) => {
    setForm({
      id: sec.id,
      section_title: sec.section_title || '',
      section_subtitle: sec.section_subtitle || '',
      sort_order: sec.sort_order || 0,
      is_active: sec.is_active,
      items: Array.isArray(sec.items) && sec.items.length > 0 ? sec.items : [],
      fee_cards: Array.isArray(sec.extra?.fee_cards) ? sec.extra.fee_cards : [],
      columns: Array.isArray(sec.extra?.columns) ? sec.extra.columns : [],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

    const payload = {
      section_title: form.section_title.trim(),
      section_subtitle: form.section_subtitle.trim(),
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
      items: form.items.filter((i) => i.badge.trim() || i.text.trim()),
      extra: {
        ...(form.fee_cards.length > 0 ? { fee_cards: form.fee_cards } : {}),
        ...(form.columns.length > 0 ? { columns: form.columns } : {}),
      },
      updated_at: new Date().toISOString(),
    };

    try {
      if (form.id) {
        const { error } = await supabase
          .from('terms_sections')
          .update(payload)
          .eq('id', form.id);
        if (error) throw error;
        setMsg({ type: 'success', text: 'Terms section updated!' });
      } else {
        const { error } = await supabase.from('terms_sections').insert(payload);
        if (error) throw error;
        setMsg({ type: 'success', text: 'New Terms section created!' });
      }
      setForm(EMPTY_FORM);
      await loadTerms();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this Terms section?')) return;
    await supabase.from('terms_sections').delete().eq('id', id);
    await loadTerms();
  };

  const updateItem = (idx, field, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { badge: '', text: '', dark: false }],
    }));
  };

  const removeItem = (idx) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div style={{ display: 'grid', gap: '30px' }}>
      <div className="card">
        <h2 style={{ fontSize: '2.2rem', marginBottom: '15px' }}>
          {form.id ? 'Edit Terms Section' : 'Add New Terms Section'}
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
              <label>Section Title *</label>
              <input
                type="text"
                className="form-control"
                value={form.section_title}
                onChange={(e) => setForm({ ...form, section_title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Subtitle (Optional)</label>
              <input
                type="text"
                className="form-control"
                value={form.section_subtitle}
                onChange={(e) => setForm({ ...form, section_subtitle: e.target.value })}
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

          <div style={{ marginTop: '10px', marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <strong>Term Badge Rows</strong>
              <button type="button" className="btn-small" onClick={addItem}>
                + Add Row
              </button>
            </div>

            {form.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: '#f8f9fa',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  display: 'grid',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="form-control"
                    style={{ flex: '1 1 200px' }}
                    placeholder="Badge Label (e.g. PAYMENT METHOD)"
                    value={item.badge}
                    onChange={(e) => updateItem(idx, 'badge', e.target.value)}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="checkbox"
                      checked={!!item.dark}
                      onChange={(e) => updateItem(idx, 'dark', e.target.checked)}
                    />
                    Dark Badge
                  </label>
                  <button
                    type="button"
                    className="btn-small"
                    style={{ background: '#dc2626' }}
                    onClick={() => removeItem(idx)}
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  rows="2"
                  className="form-control"
                  placeholder="Policy text..."
                  value={item.text}
                  onChange={(e) => updateItem(idx, 'text', e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Optional Fee Cards Editor */}
          {form.fee_cards.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <strong>Fee Cards</strong>
              {form.fee_cards.map((fc, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 140px 2fr',
                    gap: '10px',
                    marginTop: '8px',
                  }}
                >
                  <input
                    type="text"
                    className="form-control"
                    value={fc.name}
                    onChange={(e) => {
                      const next = [...form.fee_cards];
                      next[idx] = { ...next[idx], name: e.target.value };
                      setForm({ ...form, fee_cards: next });
                    }}
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={fc.price}
                    onChange={(e) => {
                      const next = [...form.fee_cards];
                      next[idx] = { ...next[idx], price: e.target.value };
                      setForm({ ...form, fee_cards: next });
                    }}
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={fc.desc}
                    onChange={(e) => {
                      const next = [...form.fee_cards];
                      next[idx] = { ...next[idx], desc: e.target.value };
                      setForm({ ...form, fee_cards: next });
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Optional Comparison Columns Editor */}
          {form.columns.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <strong>Revision Comparison Columns</strong>
              {form.columns.map((col, cIdx) => (
                <div
                  key={cIdx}
                  style={{
                    background: '#f8f9fa',
                    padding: '12px',
                    borderRadius: '8px',
                    marginTop: '10px',
                  }}
                >
                  <input
                    type="text"
                    className="form-control"
                    style={{ marginBottom: '8px', fontWeight: 'bold' }}
                    value={col.title}
                    onChange={(e) => {
                      const next = [...form.columns];
                      next[cIdx] = { ...next[cIdx], title: e.target.value };
                      setForm({ ...form, columns: next });
                    }}
                  />
                  <textarea
                    rows="4"
                    className="form-control"
                    placeholder="One bullet per line"
                    value={(col.bullets || []).join('\n')}
                    onChange={(e) => {
                      const next = [...form.columns];
                      next[cIdx] = {
                        ...next[cIdx],
                        bullets: e.target.value.split('\n'),
                      };
                      setForm({ ...form, columns: next });
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              id="termsActive"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            <label htmlFor="termsActive" style={{ margin: 0 }}>
              Visible on Terms Page
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? 'Saving...' : form.id ? 'Update Section' : 'Create Section'}
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
          Terms Sections ({sections.length})
        </h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          {sections.map((sec) => (
            <div
              key={sec.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                background: '#f8f9fa',
                borderRadius: '8px',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div>
                <strong>
                  #{sec.sort_order} — {sec.section_title}
                </strong>
                <div style={{ fontSize: '0.82rem', color: '#666' }}>
                  {(sec.items || []).length} rule(s) • {sec.is_active ? 'Visible' : 'Hidden'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn-small" onClick={() => handleEdit(sec)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-small"
                  style={{ background: '#dc2626' }}
                  onClick={() => handleDelete(sec.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}