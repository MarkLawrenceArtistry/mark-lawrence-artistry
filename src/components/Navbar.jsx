import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    await signOut();
    closeMenu();
    navigate('/');
  };

  return (
    <header>
      <div className="container header-container">
        <div className="logo-container">
          <Link to="/" onClick={closeMenu}>
            <img src="/resources/images/logo.png" alt="MLA Logo" className="logo" />
          </Link>
        </div>

        <nav>
          <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
            <li>
              <NavLink to="/" end onClick={closeMenu}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/portfolio" onClick={closeMenu}>
                Portfolio
              </NavLink>
            </li>
            <li>
              <NavLink to="/pricing" onClick={closeMenu}>
                Pricing
              </NavLink>
            </li>
            <li>
              <NavLink to="/terms" onClick={closeMenu}>
                Terms
              </NavLink>
            </li>
            <li>
              <NavLink to="/cart" onClick={closeMenu} className="nav-cart-link">
                <i className="fa-solid fa-cart-shopping"></i> Cart
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </NavLink>
            </li>

            {user ? (
              <>
                {isAdmin && (
                  <li>
                    <NavLink to="/admin" onClick={closeMenu} className="nav-admin-link">
                      <i className="fa-solid fa-gauge"></i> Admin
                    </NavLink>
                  </li>
                )}
                <li>
                  <NavLink to="/account" onClick={closeMenu}>
                    <i className="fa-solid fa-user"></i> Account
                  </NavLink>
                </li>
                <li>
                  <button onClick={handleLogout} className="nav-logout-btn">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <NavLink to="/login" onClick={closeMenu}>
                  Sign In
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>
      </div>
    </header>
  );
}