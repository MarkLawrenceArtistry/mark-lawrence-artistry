export default function TermsPage() {
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
          <div className="terms-card">
            <h2 className="terms-title">Payment Terms & TAT</h2>
            <p className="terms-subtitle">All about payments and turnaround time.</p>

            <div className="term-list">
              <div className="term-item">
                <div className="term-badge">PAYMENT METHOD</div>
                <div>
                  Payments are strictly accepted via{' '}
                  <span className="gcash-text">
                    <i className="fa-solid fa-wallet"></i> GCash
                  </span>{' '}
                  (handled via Facebook Messenger after submitting your order).
                </div>
              </div>
              <div className="term-item">
                <div className="term-badge">PAYMENT TERMS</div>
                <div>
                  A <strong>100% full upfront payment</strong> is required before any design work
                  begins.
                </div>
              </div>
              <div className="term-item">
                <div className="term-badge">(TAT) TURNAROUND TIME</div>
                <div>
                  Standard completion time is <strong>1+ days</strong> depending on project
                  complexity.
                </div>
              </div>
              <div className="term-item">
                <div className="term-badge">RUSH ORDERS</div>
                <div>
                  Need it immediately? Same-day completion is available for an additional{' '}
                  <strong>20% Rush Fee</strong>.
                </div>
              </div>
            </div>
          </div>

          <div className="terms-card">
            <h2 className="terms-title">Revision Policy</h2>
            <div className="term-list">
              <div className="term-item">
                <div className="term-badge">FREE REVISIONS</div>
                <div>
                  <strong>Minor revisions</strong> are{' '}
                  <strong>FREE within 24 hours of delivery</strong> (up to 2 rounds). Major
                  revisions or full redesigns are not covered.
                </div>
              </div>
              <div className="term-item">
                <div className="term-badge">PAID REVISIONS</div>
                <div>
                  Requests made <strong>after the 24-hour window</strong> (or beyond free rounds)
                  incur the fees below (valid for a 24-hour revision window):
                </div>
              </div>
              <div className="term-item">
                <div className="term-badge">CLEAR INSTRUCTIONS</div>
                <div>
                  Consolidate all changes into a single, clear list. Requesting changes to an
                  already completed revision counts as a new paid revision.
                </div>
              </div>
              <div className="term-item">
                <div className="term-badge">FULL REDESIGNS</div>
                <div>
                  Scrapping the layout, changing the core concept, or redoing more than 50% of the
                  graphic counts as a <strong>new commission</strong>.
                </div>
              </div>
            </div>

            <div className="fee-grid">
              <div className="fee-card">
                <div className="fee-header">
                  <div>
                    <strong>Base Revision Fee</strong>
                  </div>
                  <div className="fee-price">PHP 75</div>
                </div>
                <p style={{ color: '#d1d1d1', fontSize: '0.95rem' }}>
                  Covers minor revisions for up to 3 designs.
                </p>
              </div>
              <div className="fee-card">
                <div className="fee-header">
                  <div>
                    <strong>Major Revision Add-On</strong>
                  </div>
                  <div className="fee-price">PHP +50</div>
                </div>
                <p style={{ color: '#d1d1d1', fontSize: '0.95rem' }}>
                  Add +₱50 per design for complex structural or subject changes.
                </p>
              </div>
            </div>

            <div className="revision-definitions">
              <div className="rev-col">
                <h3>WHAT ARE MINOR REVISIONS?</h3>
                <ul>
                  <li>
                    <strong>Text & Copy:</strong> Fixing typos, updating prices/dates, swapping
                    font styles.
                  </li>
                  <li>
                    <strong>Color Adjustments:</strong> Changing colors of text, backgrounds, or
                    accents.
                  </li>
                  <li>
                    <strong>Layout Tweaks:</strong> Nudging elements, aligning text, or slightly
                    resizing items.
                  </li>
                  <li>
                    <strong>Simple Swaps:</strong> Adjusting opacity or replacing a client-provided
                    logo.
                  </li>
                </ul>
              </div>
              <div className="rev-col">
                <h3>WHAT ARE MAJOR REVISIONS?</h3>
                <ul>
                  <li>
                    <strong>Subject Replacements:</strong> Swapping main characters/heroes or
                    rebuilding background shapes.
                  </li>
                  <li>
                    <strong>New Additions:</strong> Adding new visual assets, heavy effects, or
                    large text omitted from the original brief.
                  </li>
                  <li>
                    <strong>Full Overhauls:</strong> Changing the entire theme or art style requires
                    a <strong>new commission order</strong>.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="terms-card">
            <h2 className="terms-title">Refunds, Privacy & Data Retention</h2>
            <div className="term-list">
              <div className="term-item">
                <div className="term-badge">PRE-COMPLETION</div>
                <div>A 100% refund is available if you cancel before the project is completed.</div>
              </div>
              <div className="term-item">
                <div className="term-badge dark">POST-COMPLETION</div>
                <div>
                  <strong>No refunds once the final design is delivered.</strong> We can utilize the
                  Revision Policy if adjustments are needed.
                </div>
              </div>
              <div className="term-item">
                <div className="term-badge">PORTFOLIO USAGE</div>
                <div>
                  I reserve the right to showcase finished artwork in my portfolio unless an NDA /
                  privacy request is arranged beforehand.
                </div>
              </div>
              <div className="term-item">
                <div className="term-badge">FILE RETENTION 60 DAYS</div>
                <div>
                  Editable source files and final deliverables are kept for{' '}
                  <strong>60 days after delivery</strong>. Please back up your files immediately.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}