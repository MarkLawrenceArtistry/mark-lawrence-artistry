import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Lightbox from '../components/Lightbox';

export default function PortfolioPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState('All');
  const [zoomedImg, setZoomedImg] = useState(null);

  useEffect(() => {
    const loadPortfolio = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      setItems(data || []);
      setLoading(false);
    };
    loadPortfolio();
  }, []);

  const tags = ['All', ...new Set(items.map((item) => item.tag).filter(Boolean))];
  const filtered =
    activeTag === 'All' ? items : items.filter((item) => item.tag === activeTag);

  return (
    <section className="portfolio-section">
      <div className="container">
        <h2>Portfolio</h2>

        {tags.length > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              marginBottom: '30px',
            }}
          >
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`btn-small`}
                style={{
                  background:
                    activeTag === tag ? 'var(--accent-color)' : 'var(--secondary-accent-color)',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading portfolio...</p>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ color: '#666' }}>
              No portfolio items uploaded yet. Upload your designs in the Admin CMS!
            </p>
          </div>
        ) : (
          <div className="portfolio-grid">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="portfolio-item"
                onClick={() => setZoomedImg(item.image_url)}
              >
                <img src={item.image_url} alt={item.title} />
                {item.tag && <span className="portfolio-overlay-tag">{item.tag}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <Lightbox imageUrl={zoomedImg} onClose={() => setZoomedImg(null)} />
    </section>
  );
}