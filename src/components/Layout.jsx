import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  Smartphone,
  Settings,
  LogOut,
  Send,
  Menu,
  X
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const closeMobile = () => setIsMobileOpen(false);

  return (
    <div className={`layout ${isMobileOpen ? 'mobile-open' : ''}`}>
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="logo-icon" style={{ width: 28, height: 28, borderRadius: 6 }}>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem' }}>V</span>
          </div>
          <span style={{ fontWeight: 600 }}>RCS Admin</span>
        </div>
        <button className="hamburger-btn" onClick={() => setIsMobileOpen(true)}>
          <Menu size={24} />
        </button>
      </header>

      <div 
        className={`sidebar-overlay ${isMobileOpen ? 'mobile-open' : ''}`} 
        onClick={closeMobile}
      />

      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-icon">
            <Send size={24} color="#fff" />
          </div>
          <h2>RCS Admin</h2>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            onClick={closeMobile}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/contacts"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            onClick={closeMobile}
          >
            <Users size={20} />
            <span>Contacts</span>
          </NavLink>
          <NavLink
            to="/templates"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            onClick={closeMobile}
          >
            <FileText size={20} />
            <span>Templates</span>
          </NavLink>
          <NavLink
            to="/devices"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            onClick={closeMobile}
          >
            <Smartphone size={20} />
            <span>Devices</span>
          </NavLink>
          
          <div className="nav-section-label" style={{ marginTop: '1rem' }}>Configuration</div>
          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            onClick={closeMobile}
          >
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="user-details">
              <span className="username">{user?.username}</span>
              <span className="role">Administrator</span>
            </div>
          </div>
          <button type="button" className="logout-btn" onClick={logout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="main-content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
