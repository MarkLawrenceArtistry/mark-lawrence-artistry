import { useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import AdminCommissions from './AdminCommissions';
import AdminProducts from './AdminProducts';
import AdminPortfolio from './AdminPortfolio';
import AdminTerms from './AdminTerms';
import AdminSiteContent from './AdminSiteContent';
import AdminUsers from './AdminUsers';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <img
              src="/resources/images/logo.png"
              alt="MLA"
              style={{ height: '38px', filter: 'brightness(0) invert(1)' }}
            />
            <button
              type="button"
              className="admin-mobile-toggle"
              onClick={closeSidebar}
              style={{ background: 'transparent' }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.82rem', color: '#a1a1aa' }}>
            Logged in as <strong>{profile?.full_name || 'Admin'}</strong>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <i className="fa-solid fa-chart-line"></i> Dashboard
          </NavLink>

          <NavLink
            to="/admin/commissions"
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <i className="fa-solid fa-clipboard-list"></i> Commissions
          </NavLink>

          <NavLink
            to="/admin/products"
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <i className="fa-solid fa-tags"></i> Pricing CMS
          </NavLink>

          <NavLink
            to="/admin/portfolio"
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <i className="fa-solid fa-images"></i> Portfolio CMS
          </NavLink>

          <NavLink
            to="/admin/terms"
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <i className="fa-solid fa-file-contract"></i> Terms CMS
          </NavLink>

          <NavLink
            to="/admin/content"
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <i className="fa-solid fa-pen-to-square"></i> Site Content
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
            >
            <i className="fa-solid fa-users"></i> Users / Clients
            </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-link" onClick={closeSidebar}>
            <i className="fa-solid fa-globe"></i> View Public Site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="admin-nav-link"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="admin-mobile-toggle"
              onClick={() => setSidebarOpen(true)}
            >
              <i className="fa-solid fa-bars"></i> Menu
            </button>
            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Admin Workspace</h2>
          </div>
          <Link to="/" className="btn-small">
            <i className="fa-solid fa-arrow-up-right-from-square"></i> Storefront
          </Link>
        </div>

        <div className="admin-content-area">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="commissions" element={<AdminCommissions />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="portfolio" element={<AdminPortfolio />} />
            <Route path="terms" element={<AdminTerms />} />
            <Route path="content" element={<AdminSiteContent />} />
            <Route path="users" element={<AdminUsers />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}