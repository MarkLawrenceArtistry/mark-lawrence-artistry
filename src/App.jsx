import { NavLink, BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageTracker from './components/PageTracker';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import PortfolioPage from './pages/PortfolioPage';
import PricingPage from './pages/PricingPage';
import TermsPage from './pages/TermsPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import AccountPage from './pages/AccountPage';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './AdminDashboard';
import AdminCommissions from './AdminCommissions';
import AdminProducts from './AdminProducts';
import AdminPortfolio from './AdminPortfolio';
import AdminSiteContent from './AdminSiteContent';

const Placeholder = ({ title }) => (
  <div className="container" style={{ padding: '80px 20px' }}>
    <div className="card">
      <h1>{title}</h1>
      <p style={{ marginTop: '10px', color: '#666' }}>
        Ready to be built in the upcoming module.
      </p>
    </div>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <PageTracker />
          <div className="app-wrapper">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Placeholder title="Home" />} />
                <Route path="/portfolio" element={<Placeholder title="Portfolio" />} />
                <Route path="/pricing" element={<Placeholder title="Pricing & Bundles" />} />
                <Route path="/terms" element={<Placeholder title="Terms & Conditions" />} />
                <Route path="/cart" element={<Placeholder title="Commission Cart" />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/account"
                    element={
                        <ProtectedRoute>
                        <AccountPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute requireAdmin>
                        <AdminLayout />
                        </ProtectedRoute>
                    }
                />
                <Route path="/" element={<HomePage />} />
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/account"
                    element={
                        <ProtectedRoute>
                        <AccountPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute requireAdmin>
                        <Placeholder title="Admin Dashboard & CMS" />
                        </ProtectedRoute>
                    }
                />
                <Route index element={<AdminDashboard />} />
                <Route path="commissions" element={<AdminCommissions />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}