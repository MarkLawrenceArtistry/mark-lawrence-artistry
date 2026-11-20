import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [fbName, setFbName] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (mode === 'signup') {
      if (!fullName.trim() || !contactNumber.trim() || !email.trim()) {
        setError('Please fill in your full name, contact number, and email address.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!privacyAgreed) {
        setError('Please agree to the Data Privacy Policy to create an account.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error: signInError } = await signIn({ email, password });
        if (signInError) throw signInError;
        navigate(from, { replace: true });
      } else {
        const { data, error: signUpError } = await signUp({
          email,
          password,
          fullName: fullName.trim(),
          contactNumber: contactNumber.trim(),
          fbName: fbName.trim(),
        });
        if (signUpError) throw signUpError;

        if (data?.session) {
          navigate(from, { replace: true });
        } else {
          setMessage(
            'Account created! Please check your email to confirm your address before signing in.'
          );
          setMode('signin');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ padding: '60px 20px' }}>
      <div className="container" style={{ maxWidth: '500px' }}>
        <div className="card">
          <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
            <button
              type="button"
              className={`btn ${mode === 'signin' ? '' : 'secondary'}`}
              style={{ flex: 1, padding: '12px' }}
              onClick={() => {
                setMode('signin');
                setError('');
                setMessage('');
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`btn ${mode === 'signup' ? '' : 'secondary'}`}
              style={{ flex: 1, padding: '12px' }}
              onClick={() => {
                setMode('signup');
                setError('');
                setMessage('');
              }}
            >
              Sign Up
            </button>
          </div>

          <h2 style={{ fontSize: '2.4rem', marginBottom: '8px' }}>
            {mode === 'signin' ? 'Welcome Back' : 'Create Client Account'}
          </h2>
          <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.95rem' }}>
            {mode === 'signin'
              ? 'Sign in to submit commissions and track your orders.'
              : 'Your contact details are used strictly for commission updates and GCash verification.'}
          </p>

          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Juan Dela Cruz"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Contact Number (GCash / Mobile) *</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="09XX XXX XXXX"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Facebook Name / Profile Link (for Messenger)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Juan Dela Cruz or fb.com/juan"
                    value={fbName}
                    onChange={(e) => setFbName(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {mode === 'signup' && (
              <>
                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div
                  className="form-group"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    background: '#f8f9fa',
                    padding: '12px',
                    borderRadius: '8px',
                  }}
                >
                  <input
                    id="privacyConsent"
                    type="checkbox"
                    checked={privacyAgreed}
                    onChange={(e) => setPrivacyAgreed(e.target.checked)}
                    style={{ marginTop: '4px' }}
                  />
                  <label
                    htmlFor="privacyConsent"
                    style={{ fontWeight: 'normal', fontSize: '0.85rem', margin: 0 }}
                  >
                    <strong>Data Privacy Consent:</strong> I consent to Mark Lawrence Artistry
                    storing my name, contact number, and email address for commission processing. I
                    can update or delete my account anytime.
                  </label>
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading
                ? 'Please wait...'
                : mode === 'signin'
                ? 'Sign In'
                : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}