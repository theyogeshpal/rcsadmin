import { useEffect, useState } from 'react';
import { getActiveDevices, deleteDevice, updateDeviceLabel } from '../api/client';
import { Trash2, Phone, Battery, Wifi, Clock, ArrowRightLeft } from 'lucide-react';
import Loader from './Loader';

export default function DeviceStatus() {
  const [data, setData] = useState({ devices: [], workloadMap: {} });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');

  async function handleUpdateLabel(deviceId) {
    try {
      await updateDeviceLabel(deviceId, editLabel);
      setData(prev => ({
        ...prev,
        devices: prev.devices.map(d => d.deviceId === deviceId ? { ...d, label: editLabel } : d)
      }));
      setEditingId(null);
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getActiveDevices();
        if (!cancelled) {
            setData(res);
            setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
            setError(err.message);
            setLoading(false);
        }
      }
    }
    load();
    const id = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  async function handleDelete(deviceId) {
    if (!window.confirm(`Are you sure you want to delete device ${deviceId}?`)) return;
    try {
      await deleteDevice(deviceId);
      setData(prev => ({
        ...prev,
        devices: prev.devices.filter(d => d.deviceId !== deviceId)
      }));
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <Loader text="Fetching active devices..." />;

  return (
    <div className="card">
      <h2>Active devices</h2>
      {error && <div className="error">{error}</div>}
      <div className="stats">
        <span className="stat">{data.devices?.length ?? 0} online</span>
      </div>
      {data.devices?.length > 0 ? (
        <table style={{ marginTop: '1rem' }}>
          <thead>
            <tr>
              <th>Phone Numbers</th>
              <th>Device ID</th>
              <th>Label</th>
              <th>Last heartbeat</th>
              <th>Workload</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.devices.map((d) => (
              <tr key={d.deviceId}>
                <td style={{ fontWeight: 'bold', color: '#6ba3ff' }}>
                  {d.phoneNumbers && d.phoneNumbers.length > 0 ? d.phoneNumbers.join(' / ') : 'N/A'}
                </td>
                <td style={{ color: '#9aa0a6', fontSize: '0.8rem' }}>{d.deviceId.substring(0, 8)}...</td>
                <td>
                  {editingId === d.deviceId ? (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input 
                        type="text" 
                        value={editLabel} 
                        onChange={(e) => setEditLabel(e.target.value)} 
                        style={{ padding: '4px', width: '120px', borderRadius: '4px', border: '1px solid #30363d', background: '#0d1117', color: '#fff' }}
                        autoFocus
                      />
                      <button onClick={() => handleUpdateLabel(d.deviceId)} style={{ padding: '4px 8px', cursor: 'pointer', background: '#238636', color: '#fff', border: 'none', borderRadius: '4px' }}>Save</button>
                      <button onClick={() => setEditingId(null)} style={{ padding: '4px 8px', cursor: 'pointer', background: '#30363d', color: '#fff', border: 'none', borderRadius: '4px' }}>Cancel</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{d.label || '—'}</span>
                      <button 
                        onClick={() => { setEditingId(d.deviceId); setEditLabel(d.label || ''); }}
                        style={{ background: 'none', border: 'none', color: '#58a6ff', cursor: 'pointer', padding: 0, fontSize: '0.8rem', textDecoration: 'underline' }}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </td>
                <td>{d.lastHeartbeat ? new Date(d.lastHeartbeat).toLocaleString() : '—'}</td>
                <td>
                  A:{d.workload?.assigned ?? 0} P:{d.workload?.inProgress ?? 0} C:
                  {d.workload?.completed ?? 0}
                </td>
                <td>
                  <button onClick={() => handleDelete(d.deviceId)} style={{ padding: '4px 8px', fontSize: '0.8rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: '#9aa0a6' }}>No active Android clients. Install the app and register FCM token.</p>
      )}
    </div>
  );
}
