import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { user, profile } = useAuth();

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [fbName, setFbName] = useState('');
  const [brief, setBrief] = useState({
    title: '',
    hero: '',
    paymentModes: '',
    colors: '',
    pilotFeatures: '',
    cta: 'Message us now!',
    deadline: '',
    contactDetails: '',
    otherRequests: '',
    });
  const [fbUrl, setFbUrl] = useState('https://facebook.com/profile.php?id=61593438616029');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedOrder, setSubmittedOrder] = useState(null);

  useEffect(() => {
    if (profile) {
      setClientName(profile.full_name || '');
      setClientEmail(user?.email || profile.email || '');
      setClientContact(profile.contact_number || '');
      setFbName(profile.fb_name || '');
    }
  }, [profile, user]);

  useEffect(() => {
    supabase
      .from('site_content')
      .select('value')
      .eq('key', 'hero')
      .single()
      .then(({ data }) => {
        if (data?.value?.facebook_url) setFbUrl(data.value.facebook_url);
      });
  }, []);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');

    if (cart.length === 0) {
      setError('Your commission cart is empty.');
      return;
    }

    if (!clientName.trim() || !clientContact.trim() || !brief.title.trim() || !brief.deadline.trim()) {
        Error('Please enter your name, contact number, design title, and preferred deadline.');
        return;
    }

    const formattedDescription = [
        'Design Brief Fill-up',
        '',
        `1. Title / Headline: ${brief.title.trim() || 'N/A'}`,
        `2. Hero / Main Character: ${brief.hero.trim() || 'N/A'}`,
        `3. Modes of Payment (on design): ${brief.paymentModes.trim() || 'N/A'}`,
        `4. Preferred Color Theme (1-2 colors): ${brief.colors.trim() || 'N/A'}`,
        `5. Pilot Service Features: ${brief.pilotFeatures.trim() || 'N/A'}`,
        `6. Call-to-Action (CTA): ${brief.cta.trim() || 'Message us now!'}`,
        `7. Deadline (Min. 1 Day): ${brief.deadline.trim() || 'N/A'}`,
        `8. Contact Details / Other Accounts (on design): ${brief.contactDetails.trim() || 'N/A'}`,
        `9. Other Requests:\n${brief.otherRequests.trim() || '- None'}`,
    ].join('\n');

    setSubmitting(true);
    try {
      const primaryTag =
        cart.length === 1
          ? cart[0].title
          : `${cart[0].title} (+${cart.length - 1} more)`;

      const formattedItems = cart.map((item) => ({
        product_id: item.id,
        title: item.title,
        category: item.category,
        price: Number(item.price),
        quantity: item.quantity,
      }));

      // 1. Insert unpaid commission into Supabase
      const { data: commission, error: insertError } = await supabase
        .from('commissions')
        .insert({
          client_id: user.id,
          client_name: clientName.trim(),
          client_email: clientEmail.trim(),
          client_contact: clientContact.trim(),
          fb_name: fbName.trim(),
          description: formattedDescription,
          tag: primaryTag,
          items: formattedItems,
          total_amount: cartTotal,
          payment_method: 'GCash via Facebook',
          payment_status: 'unpaid',
          work_status: 'pending',
          source: 'website_cart',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 2. Notify Admin via Brevo API route
      const {
        data: { session },
      } = await supabase.auth.getSession();

      await fetch('/api/notify-commission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ commissionId: commission.id }),
      }).catch((err) => console.warn('Email notify fallback:', err));

      // 3. Clear cart & show confirmation
      clearCart();
      setSubmittedOrder(commission);
    } catch (err) {
      setError(err.message || 'Failed to submit commission.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedOrder) {
    return (
      <section style={{ padding: '70px 20px' }}>
        <div className="container" style={{ maxWidth: '650px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <i
              className="fa-solid fa-circle-check"
              style={{ fontSize: '4rem', color: '#16a34a', marginBottom: '15px' }}
            ></i>
            <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>
              Commission Submitted!
            </h1>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              We received your commission request and emailed Mark Lawrence. Your order status is
              currently <span className="status-pill status-unpaid">UNPAID</span>.
            </p>
            <div
              style={{
                background: '#f8f9fa',
                padding: '18px',
                borderRadius: '8px',
                textAlign: 'left',
                marginBottom: '25px',
              }}
            >
              <p>
                <strong>Total Amount:</strong> ₱
                {Number(submittedOrder.total_amount).toLocaleString()}
              </p>
              <p>
                <strong>Payment Method:</strong> Pay via GCash (Handled on Facebook)
              </p>
              <p style={{ marginTop: '8px', fontSize: '0.9rem', color: '#555' }}>
                Next step: Send us a message on Facebook Messenger so we can confirm your brief and
                provide the GCash details!
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={fbUrl} target="_blank" rel="noreferrer" className="btn">
                <i className="fa-brands fa-facebook-messenger"></i> Message on Facebook to Pay
              </a>
              <Link to="/account" className="btn secondary">
                View My Commissions
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="page-title-banner">
        <div className="container">
          <h1>Commission Cart</h1>
          <p>Review your selected designs and submit your commission brief.</p>
        </div>
      </div>

      <section style={{ padding: '10px 0 70px' }}>
        <div className="container">
          {cart.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Your Cart is Empty</h2>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                Browse our design packages and add items to start a commission.
              </p>
              <Link to="/pricing" className="btn">
                Browse Pricing & Bundles
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '30px',
                alignItems: 'start',
              }}
            >
              {/* Cart Items */}
              <div className="card">
                <h2 style={{ fontSize: '2.2rem', marginBottom: '20px' }}>Selected Services</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingBottom: '14px',
                        borderBottom: '1px solid #eee',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <strong>{item.title}</strong>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          ₱{Number(item.price).toLocaleString()} each
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn-small"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span style={{ minWidth: '20px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="btn-small"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="btn-small"
                          style={{ background: '#dc2626' }}
                          onClick={() => removeFromCart(item.id)}
                          title="Remove"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                  }}
                >
                  <span>Total Estimate:</span>
                  <span style={{ color: 'var(--accent-color)', fontSize: '2rem', fontFamily: 'Zuume' }}>
                    ₱{cartTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout Form */}
              <div className="card">
                <h2 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>Checkout</h2>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Payment Method: <strong>Pay via GCash (Handled on Facebook)</strong>
                </p>

                {!user ? (
                  <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                    <p style={{ marginBottom: '15px' }}>
                      Please sign in or create a free client account so we can attach your contact
                      details and notify you about your commission.
                    </p>
                    <Link
                      to="/login"
                      state={{ from: '/cart' }}
                      className="btn"
                      style={{ width: '100%' }}
                    >
                      Sign In / Sign Up to Checkout
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleCheckout}>
                    {error && <div className="alert alert-error">{error}</div>}

                    <div className="form-group">
                      <label>Your Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Contact Number *</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={clientContact}
                        onChange={(e) => setClientContact(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Facebook Name / Profile Link (Important for GCash payment)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. fb.com/yourprofile"
                        value={fbName}
                        onChange={(e) => setFbName(e.target.value)}
                      />
                    </div>

                    <div
                    style={{
                        background: '#f8f9fa',
                        border: '1px solid #e5e7eb',
                        padding: '16px',
                        borderRadius: '10px',
                        marginBottom: '18px',
                    }}
                    >
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Design Brief Fill-Up</h3>

                    <div className="form-group">
                        <label>1. Title / Headline * (e.g. PILOT SERVICE, LOOKING FOR CLIENT, RANK UP MADE EASY)</label>
                        <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Mark's Pilot Service / Rank Up Made Easy"
                        value={brief.title}
                        onChange={(e) => setBrief({ ...brief, title: e.target.value })}
                        required
                        />
                    </div>

                    <div className="form-group">
                        <label>2. Which Hero / Main Character should we use?</label>
                        <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Gusion Soul Revelation, Chou Iori Yagami"
                        value={brief.hero}
                        onChange={(e) => setBrief({ ...brief, hero: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>3. Your Modes of Payment (to display on the design)</label>
                        <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. GCash, Maya, BPI"
                        value={brief.paymentModes}
                        onChange={(e) => setBrief({ ...brief, paymentModes: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>4. Preferred Edit Colors (provide 1–2 colors)</label>
                        <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Crimson Red & Black"
                        value={brief.colors}
                        onChange={(e) => setBrief({ ...brief, colors: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>5. Pilot Service Features (skip if not a pilot service)</label>
                        <textarea
                        rows="2"
                        className="form-control"
                        placeholder="e.g. ✅ Fast Process, ✅ 100% Safe & Legit, ✅ Livestream Available"
                        value={brief.pilotFeatures}
                        onChange={(e) => setBrief({ ...brief, pilotFeatures: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>6. Choose a Call-to-Action (CTA)</label>
                        <select
                        className="form-control"
                        value={brief.cta}
                        onChange={(e) => setBrief({ ...brief, cta: e.target.value })}
                        >
                        <option value="Message us now!">Message us now!</option>
                        <option value="Inquire us now!">Inquire us now!</option>
                        <option value="Reserve a slot">Reserve a slot</option>
                        <option value="Learn more">Learn more</option>
                        <option value="Contact us">Contact us</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>7. Preferred Deadline * (Minimum 1 day)</label>
                        <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Nov 25, 2026 / 2 days"
                        value={brief.deadline}
                        onChange={(e) => setBrief({ ...brief, deadline: e.target.value })}
                        required
                        />
                    </div>

                    <div className="form-group">
                        <label>8. Contact Details / Other Accounts (to show on the design)</label>
                        <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. FB: Juan Pilot | Discord: juan#1234"
                        value={brief.contactDetails}
                        onChange={(e) => setBrief({ ...brief, contactDetails: e.target.value })}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>9. Other Requests / Notes</label>
                        <textarea
                        rows="3"
                        className="form-control"
                        placeholder="- Any extra layout notes or reference links..."
                        value={brief.otherRequests}
                        onChange={(e) => setBrief({ ...brief, otherRequests: e.target.value })}
                        />
                    </div>
                    </div>

                    <div
                      style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: '#1e3a8a',
                        marginBottom: '18px',
                      }}
                    >
                      <i className="fa-solid fa-wallet"></i> <strong>Payment Method:</strong> Pay
                      via GCash on Facebook. Your commission will be logged as{' '}
                      <strong>Unpaid</strong> and Mark will coordinate with you on Messenger.
                    </div>

                    <button
                      type="submit"
                      className="btn"
                      style={{ width: '100%' }}
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting Order...' : 'Submit Commission Order'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}