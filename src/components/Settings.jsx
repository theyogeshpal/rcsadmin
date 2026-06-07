import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../api/client';

export default function Settings() {
  const { token } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch(`${API_BASE}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings({
          cooldownMs: data.cooldownMs,
          dailyLimitPerDevice: data.dailyLimitPerDevice,
          nextDayStartTime: data.nextDayStartTime,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const err = await res.json();
        setMessage(`Error: ${err.error}`);
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading settings...</p>;
  if (!settings) return <p>Failed to load settings.</p>;

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '20px auto' }}>
      <h2>Global Settings</h2>
      {message && (
        <div style={{ padding: '10px', background: '#e8f0fe', color: '#1a73e8', borderRadius: '4px', marginBottom: '16px' }}>
          {message}
        </div>
      )}
      <form onSubmit={handleSave}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Delay Between Messages (ms)
          </label>
          <input
            type="number"
            min="1000"
            required
            value={settings.cooldownMs}
            onChange={(e) => setSettings({ ...settings, cooldownMs: Number(e.target.value) })}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <small style={{ color: '#666' }}>E.g. 8000 means 8 seconds delay.</small>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Max Messages Per Device (Daily Limit)
          </label>
          <input
            type="number"
            min="1"
            required
            value={settings.dailyLimitPerDevice}
            onChange={(e) => setSettings({ ...settings, dailyLimitPerDevice: Number(e.target.value) })}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <small style={{ color: '#666' }}>If a campaign exceeds this limit, remaining numbers are scheduled for the next day.</small>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Next Day Start Time (HH:mm)
          </label>
          <input
            type="time"
            required
            value={settings.nextDayStartTime}
            onChange={(e) => setSettings({ ...settings, nextDayStartTime: e.target.value })}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <small style={{ color: '#666' }}>Time to resume queued campaigns on the next day.</small>
        </div>

        <button type="submit" className="primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
