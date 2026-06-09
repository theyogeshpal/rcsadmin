import { useEffect, useState } from 'react';
import { getActiveDevices, deleteDevice } from '../api/client';

export default function DeviceStatus() {
  const [data, setData] = useState({ devices: [], workloadMap: {} });
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getActiveDevices();
        if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled) setError(err.message);
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
                <td>{d.label || '—'}</td>
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
