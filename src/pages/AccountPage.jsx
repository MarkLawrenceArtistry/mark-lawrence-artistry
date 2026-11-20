import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function AccountPage() {
  const { user, profile, isAdmin, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();

  // Profile & Data Privacy state
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [fbName, setFbName] = useState('');
  const [email, setEmail] = useState('');
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  // Client commissions state
  const [commissions, setCommissions] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Delete account state
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setContactNumber(profile.contact_number || '');
      setFbName(profile.fb_name || '');
      setEmail(user?.email || profile.email || '');
    }
  }, [profile, user]);

  useEffect(() => {
    if (!user) return;
    const loadMyCommissions = async () => {
      setLoadingOrders(true);
      const { data } = await supabase
        .from('commissions')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });
      setCommissions(data || []);
      setLoadingOrders(false);
    };
    loadMyCommissions();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setSavingProfile(true);

    try {
      let emailNotice = '';

      // If email changed, update Supabase Auth email
      if (email.trim() !== user.email) {
        const { error: emailErr } = await supabase.auth.updateUser({
          email: email.trim(),
        });
        if (emailErr) throw emailErr;
        emailNotice =
          ' Confirmation link sent to your new email address to finalize the email change.';
      }

      const { error: profErr } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          contact_number: contactNumber.trim(),
          fb_name: fbName.trim(),
          email: email.trim(),
        })
        .eq('id', user.id);

      if (profErr) throw profErr;

      await refreshProfile();
      setProfileMsg({
        type: 'success',
        text: `Personal data saved successfully.${emailNotice}`,
      });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMsg({ type: 'success', text: 'Password updated successfully.' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    if (deleteConfirm !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm account deletion.');
      return;
    }

    setDeleting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to delete account');

      await signOut();
      navigate('/');
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="page-title-banner">
        <div className="container">
          <h1>My Account</h1>
          <p>Manage your data privacy settings, password, and commission orders.</p>
        </div>
      </div>

      <section style={{ padding: '10px 0 60px' }}>
        <div className="container" style={{ display: 'grid', gap: '30px' }}>
          {/* 1. Data Privacy & Personal Details */}
          <div className="card">
            <h2 style={{ fontSize: '2.2rem', marginBottom: '6px' }}>
              Data Privacy & Personal Information
            </h2>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.92rem' }}>
              We collect only the details needed to process your commissions and coordinate via
              Facebook / GCash.
            </p>

            {profileMsg.text && (
              <div className={`alert alert-${profileMsg.type}`}>{profileMsg.text}</div>
            )}

            <form
              onSubmit={handleUpdateProfile}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
              }}
            >
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Facebook Name / Profile</label>
                <input
                  type="text"
                  className="form-control"
                  value={fbName}
                  onChange={(e) => setFbName(e.target.value)}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <button type="submit" className="btn" disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Personal Info'}
                </button>
              </div>
            </form>
          </div>

          {/* 2. Change Password */}
          <div className="card">
            <h2 style={{ fontSize: '2.2rem', marginBottom: '15px' }}>Change Password</h2>

            {passwordMsg.text && (
              <div className={`alert alert-${passwordMsg.type}`}>{passwordMsg.text}</div>
            )}

            <form
              onSubmit={handleChangePassword}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
              }}
            >
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <button type="submit" className="btn secondary" disabled={savingPassword}>
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* 3. My Commission Orders */}
          <div className="card">
            <h2 style={{ fontSize: '2.2rem', marginBottom: '15px' }}>My Commissions</h2>
            {loadingOrders ? (
              <p>Loading your orders...</p>
            ) : commissions.length === 0 ? (
              <p style={{ color: '#666' }}>You have no commission orders yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                      <th style={{ padding: '12px 8px' }}>Date</th>
                      <th style={{ padding: '12px 8px' }}>Details</th>
                      <th style={{ padding: '12px 8px' }}>Total</th>
                      <th style={{ padding: '12px 8px' }}>Payment</th>
                      <th style={{ padding: '12px 8px' }}>Work Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((order) => (
                      <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px 8px', fontSize: '0.9rem' }}>
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <strong>{order.tag}</strong>
                          <div style={{ fontSize: '0.85rem', color: '#666' }}>
                            {order.description}
                          </div>
                        </td>
                        <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>
                          ₱{Number(order.total_amount).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span className={`status-pill status-${order.payment_status}`}>
                            {order.payment_status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span className={`status-pill status-${order.work_status}`}>
                            {order.work_status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 4. Delete Account (Clients only) */}
          {!isAdmin && (
            <div className="card" style={{ border: '1px solid #fecaca' }}>
              <h2 style={{ fontSize: '2.2rem', color: '#dc2626', marginBottom: '8px' }}>
                Delete My Account
              </h2>
              <p style={{ color: '#666', fontSize: '0.92rem', marginBottom: '15px' }}>
                Permanently deletes your login credentials and personal profile data (name,
                contact number, email). This action cannot be undone.
              </p>

              {deleteError && <div className="alert alert-error">{deleteError}</div>}

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <input
                  type="text"
                  className="form-control"
                  style={{ maxWidth: '260px' }}
                  placeholder="Type DELETE to confirm"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={deleting}
                  onClick={handleDeleteAccount}
                >
                  {deleting ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}