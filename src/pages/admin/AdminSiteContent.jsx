import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import ImageUploader from '../../components/ImageUploader';

export default function AdminSiteContent() {
  const [hero, setHero] = useState({
    headline: '',
    subheadline: '',
    hero_image_url: '',
    facebook_url: '',
  });
  const [announcement, setAnnouncement] = useState({
    enabled: true,
    text: '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const loadContent = async () => {
      const { data } = await supabase.from('site_content').select('*');
      data?.forEach((row) => {
        if (row.key === 'hero') setHero(row.value);
        if (row.key === 'announcement') setAnnouncement(row.value);
      });
    };
    loadContent();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      const { error: err1 } = await supabase.from('site_content').upsert(
        {
          key: 'hero',
          value: hero,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );
      if (err1) throw err1;

      const { error: err2 } = await supabase.from('site_content').upsert(
        {
          key: 'announcement',
          value: announcement,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );
      if (err2) throw err2;

      setMsg({ type: 'success', text: 'Site content updated!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ fontSize: '2.2rem', marginBottom: '15px' }}>Controlled Site Content</h2>
      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Hero Headline (use Enter for line break)</label>
          <textarea
            rows="2"
            className="form-control"
            value={hero.headline}
            onChange={(e) => setHero({ ...hero, headline: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Hero Subheadline</label>
          <textarea
            rows="3"
            className="form-control"
            value={hero.subheadline}
            onChange={(e) => setHero({ ...hero, subheadline: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Facebook Messenger / Page URL</label>
          <input
            type="url"
            className="form-control"
            value={hero.facebook_url}
            onChange={(e) => setHero({ ...hero, facebook_url: e.target.value })}
          />
        </div>

        <ImageUploader
          label="Hero Banner Image (leave blank to use default)"
          value={hero.hero_image_url}
          onChange={(url) => setHero({ ...hero, hero_image_url: url })}
        />

        <hr style={{ margin: '25px 0', border: 'none', borderTop: '1px solid #eee' }} />

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            id="annEnabled"
            type="checkbox"
            checked={announcement.enabled}
            onChange={(e) =>
              setAnnouncement({ ...announcement, enabled: e.target.checked })
            }
          />
          <label htmlFor="annEnabled" style={{ margin: 0 }}>
            Show Pricing Page Note / Announcement
          </label>
        </div>

        <div className="form-group">
          <label>Pricing Note Text</label>
          <input
            type="text"
            className="form-control"
            value={announcement.text}
            onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })}
          />
        </div>

        <button type="submit" className="btn" disabled={saving}>
          {saving ? 'Saving...' : 'Save Site Content'}
        </button>
      </form>
    </div>
  );
}