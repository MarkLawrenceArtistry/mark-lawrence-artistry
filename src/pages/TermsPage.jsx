import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function TermsPage() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTerms = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('terms_sections')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      setSections(data || []);
      setLoading(false);
    };
    loadTerms();
  }, []);

  return (
    <>
      <div className="page-title-banner">
        <div className="container">
          <h1>Terms & Conditions</h1>
          <p>Please read our policies carefully before commissioning any design work.</p>
        </div>
      </div>

      <section className="terms-content-section">
        <div className="container">
          {loading ? (
            <p style={{ textAlign: 'center' }}>Loading terms...</p>
          ) : (
            sections.map((section) => (
              <div key={section.id} className="terms-card">
                <h2 className="terms-title">{section.section_title}</h2>
                {section.section_subtitle && (
                  <p className="terms-subtitle">{section.section_subtitle}</p>
                )}

                {Array.isArray(section.items) && section.items.length > 0 && (
                  <div className="term-list">
                    {section.items.map((item, idx) => (
                      <div key={idx} className="term-item">
                        <div className={`term-badge ${item.dark ? 'dark' : ''}`}>
                          {item.badge}
                        </div>
                        <div style={{ whiteSpace: 'pre-line' }}>{item.text}</div>
                      </div>
                    ))}
                  </div>
                )}

                {Array.isArray(section.extra?.fee_cards) &&
                  section.extra.fee_cards.length > 0 && (
                    <div className="fee-grid">
                      {section.extra.fee_cards.map((fee, idx) => (
                        <div key={idx} className="fee-card">
                          <div className="fee-header">
                            <div>
                              <strong>{fee.name}</strong>
                            </div>
                            <div className="fee-price">{fee.price}</div>
                          </div>
                          <p style={{ color: '#d1d1d1', fontSize: '0.95rem' }}>{fee.desc}</p>
                        </div>
                      ))}
                    </div>
                  )}

                {Array.isArray(section.extra?.columns) &&
                  section.extra.columns.length > 0 && (
                    <div className="revision-definitions">
                      {section.extra.columns.map((col, idx) => (
                        <div key={idx} className="rev-col">
                          <h3>{col.title}</h3>
                          <ul>
                            {(col.bullets || []).map((b, bIdx) => (
                              <li key={bIdx}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}