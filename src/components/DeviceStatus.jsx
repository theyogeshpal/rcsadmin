import { useEffect, useState } from 'react';
import { getActiveDevices } from '../api/client';

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
              <th>Device ID</th>
              <th>Label</th>
              <th>Last heartbeat</th>
              <th>Workload</th>
            </tr>
          </thead>
          <tbody>
            {data.devices.map((d) => (
              <tr key={d.deviceId}>
                <td>{d.deviceId}</td>
                <td>{d.label || '—'}</td>
                <td>{d.lastHeartbeat ? new Date(d.lastHeartbeat).toLocaleString() : '—'}</td>
                <td>
                  A:{d.workload?.assigned ?? 0} P:{d.workload?.inProgress ?? 0} C:
                  {d.workload?.completed ?? 0}
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
