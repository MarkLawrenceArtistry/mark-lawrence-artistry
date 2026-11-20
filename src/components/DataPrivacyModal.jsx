import { useEffect, useState } from 'react';

export default function DataPrivacyModal({
  isOpen,
  onClose,
  onConfirm,
  initialChecked = false,
  viewOnly = false,
}) {
  const [checked, setChecked] = useState(initialChecked);

  useEffect(() => {
    setChecked(initialChecked);
  }, [initialChecked, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>Data Privacy Policy</h2>
            <p style={{ fontSize: '0.85rem', color: '#d4d4d8', margin: 0 }}>
              Mark Lawrence Artistry — Client Data Protection Notice
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '1.4rem',
              cursor: 'pointer',
            }}
            aria-label="Close modal"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body">
          <p>
            At <strong>Mark Lawrence Artistry</strong>, we value your privacy and handle your
            personal information responsibly in compliance with data privacy best practices
            (including the Philippine Data Privacy Act of 2012 principles).
          </p>

          <h4>1. Information We Collect</h4>
          <ul>
            <li>
              <strong>Full Name:</strong> To address you properly and identify your commission
              orders.
            </li>
            <li>
              <strong>Contact Number:</strong> Used for urgent commission updates and verifying
              GCash transactions.
            </li>
            <li>
              <strong>Email Address:</strong> Used for account authentication, password resets, and
              order/receipt notifications.
            </li>
            <li>
              <strong>Facebook Name / Profile Link (Optional):</strong> Used to connect with you on
              Facebook Messenger where design briefs and GCash payments are finalized.
            </li>
          </ul>

          <h4>2. How We Use Your Information</h4>
          <ul>
            <li>Creating and managing your client account.</li>
            <li>Processing commission requests submitted through the cart.</li>
            <li>Notifying the designer when you place an unpaid commission order.</li>
            <li>Communicating draft previews, revisions, and final file delivery links.</li>
          </ul>
          <p>
            We <strong>never sell, rent, or share</strong> your personal contact details with third
            parties for marketing.
          </p>

          <h4>3. Data Storage & Security</h4>
          <p>
            Your account credentials and profile information are stored securely using{' '}
            <strong>Supabase</strong> with encrypted authentication and Row Level Security (RLS),
            ensuring only you and the site administrator can view your contact details.
          </p>

          <h4>4. Data Retention & Your Rights</h4>
          <ul>
            <li>
              <strong>Edit / Update:</strong> You can update your name, contact number, email, and
              Facebook link anytime under <em>My Account</em>.
            </li>
            <li>
              <strong>Change Password:</strong> You can change your password anytime from your
              account settings.
            </li>
            <li>
              <strong>Delete My Account:</strong> You may permanently delete your account and
              personal profile data at any time. *(Note: Non-identifiable sales totals may be
              retained for business accounting, with your personal account link removed.)*
            </li>
          </ul>

          <h4>5. Contact for Privacy Concerns</h4>
          <p>
            For questions regarding your data, email{' '}
            <strong>marklawrence.artistry@gmail.com</strong>.
          </p>
        </div>

        <div className="modal-footer">
          {!viewOnly ? (
            <>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  style={{ marginTop: '4px', width: '18px', height: '18px' }}
                />
                <span>
                  I have read and understood the <strong>Data Privacy Policy</strong>, and I
                  consent to the collection and use of my Full Name, Contact Number, Email Address,
                  and Facebook details for commission processing.
                </span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn secondary" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn"
                  disabled={!checked}
                  onClick={() => onConfirm(true)}
                >
                  Confirm & Agree
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn" onClick={onClose}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}