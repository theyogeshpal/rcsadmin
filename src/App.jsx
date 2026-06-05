import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import ExcelUpload from './components/ExcelUpload';
import CampaignForm from './components/CampaignForm';
import DeviceStatus from './components/DeviceStatus';
import PastCampaigns from './components/PastCampaigns';

function Dashboard() {
  const { user, logout } = useAuth();
  const [numbers, setNumbers] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [tab, setTab] = useState('new');

  return (
    <>
      <header className="app-header">
        <div>
          <h1>RCS Campaign Admin</h1>
          <p className="subtitle">Logged in as {user?.username}</p>
        </div>
        <button type="button" className="secondary" onClick={logout}>
          Logout
        </button>
      </header>

      <nav className="tabs">
        <button
          type="button"
          className={tab === 'new' ? 'tab active' : 'tab'}
          onClick={() => setTab('new')}
        >
          New campaign
        </button>
        <button
          type="button"
          className={tab === 'past' ? 'tab active' : 'tab'}
          onClick={() => setTab('past')}
        >
          Past campaigns
        </button>
        <button
          type="button"
          className={tab === 'devices' ? 'tab active' : 'tab'}
          onClick={() => setTab('devices')}
        >
          Devices
        </button>
      </nav>

      {tab === 'new' && (
        <>
          <ExcelUpload onNumbersParsed={setNumbers} />
          <CampaignForm numbers={numbers} onSubmitted={() => setRefreshKey((k) => k + 1)} />
        </>
      )}
      {tab === 'past' && <PastCampaigns refreshKey={refreshKey} />}
      {tab === 'devices' && <DeviceStatus />}
    </>
  );
}

function AppRoot() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="login-wrap">
        <p style={{ color: '#9aa0a6' }}>Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) return <Login />;
  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoot />
    </AuthProvider>
  );
}
