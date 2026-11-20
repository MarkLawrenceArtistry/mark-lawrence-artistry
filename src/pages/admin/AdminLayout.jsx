import { NavLink, Route, Routes } from 'react-router-dom';
import AdminProducts from './AdminProducts';
import AdminPortfolio from './AdminPortfolio';
import AdminSiteContent from './AdminSiteContent';

const ComingNext = ({ title }) => (
  <div className="card">
    <h2>{title}</h2>
    <p style={{ color: '#666', marginTop: '8px' }}>Coming in Module 6 (next step!).</p>
  </div>
);

export default function AdminLayout() {
  const linkStyle = ({ isActive }) => ({
    padding: '10px 18px',
    borderRadius: '8px',
    fontWeight: 'bold',
    background: isActive ? 'var(--accent-color)' : '#fff',
    color: isActive ? '#fff' : 'var(--dark-text)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  });

  return (
    <>
      <div className="page-title-banner">
        <div className="container">
          <h1>Admin Control Panel</h1>
          <p>Manage commissions, analytics, portfolio, pricing, and site content.</p>
        </div>
      </div>

      <section style={{ padding: '0 0 70px' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '30px',
            }}
          >
            <NavLink to="/admin" end style={linkStyle}>
              <i className="fa-solid fa-chart-line"></i> Dashboard
            </NavLink>
            <NavLink to="/admin/commissions" style={linkStyle}>
              <i className="fa-solid fa-clipboard-list"></i> Commissions
            </NavLink>
            <NavLink to="/admin/products" style={linkStyle}>
              <i className="fa-solid fa-tags"></i> Pricing CMS
            </NavLink>
            <NavLink to="/admin/portfolio" style={linkStyle}>
              <i className="fa-solid fa-images"></i> Portfolio CMS
            </NavLink>
            <NavLink to="/admin/content" style={linkStyle}>
              <i className="fa-solid fa-pen-to-square"></i> Site Content
            </NavLink>
          </div>

          <Routes>
            <Route index element={<ComingNext title="Analytics Dashboard" />} />
            <Route path="commissions" element={<ComingNext title="Commission Manager" />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="portfolio" element={<AdminPortfolio />} />
            <Route path="content" element={<AdminSiteContent />} />
          </Routes>
        </div>
      </section>
    </>
  );
}