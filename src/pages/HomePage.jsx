import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const DEFAULT_HERO = {
  headline: 'Design that works,\nyour advantage.',
  subheadline:
    'Edit na functional ba hanap mo maam/sir? Feel free to explore high-converting designs tailored for esports and gaming services.',
  hero_image_url: '/resources/images/hero.png',
  facebook_url: 'https://facebook.com/profile.php?id=61593438616029',
};

export default function HomePage() {
  const [hero, setHero] = useState(DEFAULT_HERO);

  useEffect(() => {
    supabase
      .from('site_content')
      .select('value')
      .eq('key', 'hero')
      .single()
      .then(({ data }) => {
        if (data?.value) {
          setHero({
            ...DEFAULT_HERO,
            ...data.value,
            hero_image_url:
              data.value.hero_image_url || '/resources/images/hero.png',
          });
        }
      });
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <h1>{hero.headline}</h1>
            <p>{hero.subheadline}</p>
            <div className="hero-buttons">
              <Link to="/portfolio" className="btn">
                See Designs
              </Link>
              <Link to="/pricing" className="btn secondary">
                Browse Services & Order
              </Link>
              <a
                href={hero.facebook_url}
                target="_blank"
                rel="noreferrer"
                className="btn secondary"
              >
                <i className="fa-brands fa-facebook-messenger"></i> Message on FB
              </a>
            </div>
          </div>
          <div className="hero-content">
            <img
              src={hero.hero_image_url}
              alt="Mark Lawrence Artistry Hero"
              className="hero-image"
            />
          </div>
        </div>
      </section>

      <section className="how-to-order-section">
        <div className="container">
          <h2 className="section-title">How To Order?</h2>
          <p className="section-subtitle">
            Order directly through our cart or message us — whichever works best for you!
          </p>

          <div className="steps-container">
            <div className="step-card">
              <div className="step-badge">STEP 1</div>
              <div className="step-text">
                Pick your designs in <strong>Pricing</strong> & add them to your cart (or
                send a private message{' '}
                <i className="fa-brands fa-facebook-messenger messenger-icon"></i> to inquire).
              </div>
            </div>

            <div className="step-card">
              <div className="step-badge">STEP 2</div>
              <div className="step-text">
                Submit your Design Brief at checkout with all specific details, references,
                and inspirations needed for the project.
              </div>
            </div>

            <div className="step-card">
              <div className="step-badge">STEP 3</div>
              <div className="step-text">
                Pay via <span className="gcash-text"><i className="fa-solid fa-wallet"></i> GCash</span>{' '}
                through our Facebook Messenger conversation once your order is confirmed.
              </div>
            </div>

            <div className="step-card">
              <div className="step-badge">STEP 4</div>
              <div className="step-text">
                We will confirm your preferred delivery date.
                <br />
                <span className="step-tip">
                  *(Tip: Providing more time allows me to deliver a higher-quality design!)*
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}