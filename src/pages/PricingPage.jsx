import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import Lightbox from '../components/Lightbox';

const CATEGORIES = [
  { key: 'all', label: 'All Designs', icon: 'fa-solid fa-layer-group' },
  { key: 'basic', label: 'Basic', icon: 'fa-solid fa-star' },
  { key: 'standard', label: 'Standard', icon: 'fa-solid fa-fire' },
  { key: 'premium', label: 'Premium', icon: 'fa-solid fa-crown' },
  { key: 'templates', label: 'Templates / PSD', icon: 'fa-solid fa-file-export' },
  { key: 'bundles', label: 'Bundles', icon: 'fa-solid fa-box-open' },
];

export default function PricingPage() {
  const [products, setProducts] = useState([]);
  const [note, setNote] = useState(
    'Note: Source files are not included unless purchasing a PSD template. Designs are not editable.'
  );
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [zoomedImg, setZoomedImg] = useState(null);
  const [addedId, setAddedId] = useState(null);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const loadPricing = async () => {
      setLoading(true);
      const [{ data: prods }, { data: ann }] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
        supabase
          .from('site_content')
          .select('value')
          .eq('key', 'announcement')
          .single(),
      ]);

      setProducts(prods || []);
      if (ann?.value?.enabled && ann?.value?.text) {
        setNote(ann.value.text);
      }
      setLoading(false);
    };
    loadPricing();
  }, []);

  const filtered =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory);

  const handleAdd = (product) => {
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <>
      <section className="page-title-banner">
        <div className="container">
          <h1>Pricing & Bundles</h1>
          <p>Explore our individual designs and cost-saving packages.</p>
        </div>
      </section>

      <section className="shop-section">
        <div className="container shop-container">
          <aside className="shop-sidebar">
            <h3>Category</h3>
            <ul className="category-filter">
              {CATEGORIES.map((cat) => {
                const count =
                  cat.key === 'all'
                    ? products.length
                    : products.filter((p) => p.category === cat.key).length;
                return (
                  <li
                    key={cat.key}
                    className={activeCategory === cat.key ? 'active' : ''}
                    onClick={() => setActiveCategory(cat.key)}
                  >
                    <i className={cat.icon}></i> {cat.label}
                    <span className="count">{count}</span>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div className="shop-content">
            {note && (
              <p className="pricing-note">
                <i className="fa-solid fa-circle-info"></i> {note}
              </p>
            )}

            {loading ? (
              <p>Loading services...</p>
            ) : (
              <div className="product-grid">
                {filtered.map((product) => (
                  <div key={product.id} className="product-card">
                    <span
                      className={`product-badge ${
                        product.category === 'bundles' ? 'bundle-badge' : ''
                      }`}
                    >
                      {product.badge_text}
                    </span>

                    <div
                      className="product-img-wrapper"
                      onClick={() =>
                        product.image_url && setZoomedImg(product.image_url)
                      }
                    >
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title} />
                      ) : (
                        <div style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
                          <i className="fa-solid fa-image" style={{ fontSize: '2.5rem' }}></i>
                          <div style={{ fontSize: '0.8rem', marginTop: '6px' }}>
                            Preview Coming Soon
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="product-info">
                      <h4>{product.title}</h4>
                      <p className="product-desc">{product.description}</p>
                      <div className="product-bottom">
                        <span className="product-price">
                          ₱{Number(product.price).toLocaleString()}
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn-small"
                            onClick={() => handleAdd(product)}
                            style={
                              addedId === product.id
                                ? { backgroundColor: '#16a34a' }
                                : undefined
                            }
                          >
                            <i className="fa-solid fa-cart-plus"></i>{' '}
                            {addedId === product.id ? 'Added!' : 'Add'}
                          </button>
                          <button
                            type="button"
                            className="btn-small"
                            style={{ backgroundColor: 'var(--accent-color)' }}
                            onClick={() => {
                              addToCart(product);
                              navigate('/cart');
                            }}
                          >
                            Order
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Lightbox imageUrl={zoomedImg} onClose={() => setZoomedImg(null)} />
    </>
  );
}