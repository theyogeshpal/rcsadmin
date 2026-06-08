import { Fragment, useEffect, useState } from 'react';
import { getCampaign, getCampaignLogs, listCampaigns, retryCampaign, relaunchCampaign, deleteCampaign } from '../api/client';
import { Trash2, RotateCcw, FileText, ChevronDown, ChevronUp, Play } from 'lucide-react';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

function statusClass(status) {
  return `status-badge status-${status || 'pending'}`;
}

export default function PastCampaigns({ refreshKey }) {
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  const [logsData, setLogsData] = useState(null);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    listCampaigns()
      .then(setCampaigns)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  async function toggleExpand(id) {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      setLogsData(null);
      return;
    }
    setExpandedId(id);
    setDetailLoading(true);
    setLogsData(null);
    try {
      const full = await getCampaign(id);
      setDetail(full);
    } catch (err) {
      setDetail({ error: err.message });
    } finally {
      setDetailLoading(false);
    }
  }

  async function loadLogs(campaignId) {
    setLogsLoading(true);
    try {
      const data = await getCampaignLogs(campaignId);
      setLogsData(data);
    } catch (err) {
      alert(`Failed to load logs: ${err.message}`);
    } finally {
      setLogsLoading(false);
    }
  }

  async function handleRetry(campaignId) {
    if (!window.confirm('Are you sure you want to retry this campaign?')) return;
    try {
      setDetailLoading(true);
      await retryCampaign(campaignId);
      alert('Retry triggered successfully!');
      const updated = await listCampaigns();
      setCampaigns(updated);
      setExpandedId(null);
      setDetail(null);
    } catch (err) {
      alert(`Retry failed: ${err.message}`);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleRelaunch(campaignId) {
    if (!window.confirm('Are you sure you want to relaunch this ENTIRE campaign to all numbers again?')) return;
    try {
      setDetailLoading(true);
      await relaunchCampaign(campaignId);
      alert('Campaign relaunched successfully!');
      const updated = await listCampaigns();
      setCampaigns(updated);
      setExpandedId(null);
      setDetail(null);
    } catch (err) {
      alert(`Relaunch failed: ${err.message}`);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleDelete(campaignId) {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this campaign?')) return;
    try {
      setDetailLoading(true);
      await deleteCampaign(campaignId);
      const updated = await listCampaigns();
      setCampaigns(updated);
      setExpandedId(null);
      setDetail(null);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Campaign History</h2>
      <p style={{ color: '#9aa0a6', fontSize: '0.9rem', marginTop: 0 }}>
        Your recently launched campaigns.
      </p>
      
      {error && <div className="error">{error}</div>}
      {loading && <p style={{ color: '#9aa0a6' }}>Loading…</p>}
      
      {!loading && campaigns.length === 0 && (
        <p style={{ color: '#9aa0a6' }}>No campaigns yet. Launch your first campaign to the left.</p>
      )}
      
      {!loading && campaigns.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {campaigns.map((c) => {
            const isFailed = c.status === 'failed' || (c.status === 'completed' && c.stats?.failed > 0);
            
            return (
              <div key={c._id} style={{ background: '#0f1117', border: '1px solid #2d3142', borderRadius: '10px', overflow: 'hidden' }}>
                {/* Card Header & Summary */}
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem 0', color: '#e8eaed', fontSize: '1.1rem' }}>{c.name}</h3>
                      <div style={{ fontSize: '0.8rem', color: '#9aa0a6' }}>{formatDate(c.createdAt)}</div>
                    </div>
                    <span className={statusClass(c.status)}>{c.status}</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <div className="stat">Total: <strong>{c.stats?.total ?? '—'}</strong></div>
                    <div className="stat" style={{ color: '#81c995' }}>Sent: <strong>{c.stats?.sent ?? 0}</strong></div>
                    <div className="stat" style={{ color: '#f28b82' }}>Failed: <strong>{c.stats?.failed ?? 0}</strong></div>
                    <div className="stat" style={{ color: '#fdd663' }}>Pending: <strong>{c.stats?.pending ?? 0}</strong></div>
                  </div>

                  {/* Quick Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid #2d3142', paddingTop: '1rem' }}>
                    <button 
                      type="button"
                      className="secondary"
                      onClick={() => toggleExpand(c._id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'center' }}
                    >
                      <FileText size={16} />
                      {expandedId === c._id ? 'Hide Details' : 'View Details'}
                      {expandedId === c._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    
                    {isFailed && (
                      <button 
                        type="button"
                        onClick={() => handleRetry(c._id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#3a3520', color: '#fdd663' }}
                        title="Retry Failed Numbers"
                      >
                        <RotateCcw size={16} /> Retry
                      </button>
                    )}

                    <button 
                      type="button"
                      onClick={() => handleRelaunch(c._id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1c2e4a', color: '#6ba3ff' }}
                      title="Relaunch Entire Campaign"
                    >
                      <Play size={16} /> Relaunch
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => handleDelete(c._id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid #3c2020', color: '#f28b82' }}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === c._id && (
                  <div style={{ background: '#151821', padding: '1.25rem', borderTop: '1px solid #2d3142' }}>
                    {detailLoading && <span style={{ color: '#9aa0a6' }}>Loading details…</span>}
                    
                    {!detailLoading && detail?.error && (
                      <div className="error">{detail.error}</div>
                    )}
                    
                    {!detailLoading && detail && !detail.error && (
                      <div className="campaign-detail">
                        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#0b0c10', borderRadius: '8px' }}>
                          <strong style={{ display: 'block', color: '#9aa0a6', marginBottom: '0.5rem' }}>Message Content:</strong>
                          <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{detail.text}</div>
                        </div>

                        {detail.assignments?.length > 0 && (
                          <div style={{ marginBottom: '1rem' }}>
                            <strong style={{ display: 'block', color: '#9aa0a6', marginBottom: '0.5rem' }}>Device Distribution:</strong>
                            <div className="table-wrap">
                              <table style={{ background: '#0b0c10' }}>
                                <thead>
                                  <tr>
                                    <th>Device ID</th>
                                    <th>Assigned</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {detail.assignments.map((a) => (
                                    <tr key={a.deviceId}>
                                      <td style={{ color: '#9aa0a6' }}>{a.deviceId.substring(0, 8)}...</td>
                                      <td>{a.numbers?.length || 0} numbers</td>
                                      <td>
                                        {a.dispatchedAt ? (
                                          <span style={{ color: '#81c995' }}>Started: {new Date(a.dispatchedAt).toLocaleTimeString()}</span>
                                        ) : (
                                          <span style={{ color: '#fdd663' }}>Pending...</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Logs Section */}
                        <div style={{ marginTop: '1rem' }}>
                          {!logsData && (
                            <button
                              type="button"
                              className="secondary"
                              onClick={() => loadLogs(c._id)}
                              disabled={logsLoading}
                              style={{ width: '100%' }}
                            >
                              {logsLoading ? 'Loading logs...' : 'Load Delivery Logs'}
                            </button>
                          )}
                          
                          {logsData && (
                            <div style={{ marginTop: '1rem' }}>
                              <strong style={{ display: 'block', color: '#9aa0a6', marginBottom: '0.5rem' }}>Delivery Logs ({logsData.length}):</strong>
                              {logsData.length === 0 ? (
                                <p style={{ fontSize: '0.9rem', color: '#666' }}>No logs found for this campaign yet.</p>
                              ) : (
                                <div className="table-wrap" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                  <table style={{ background: '#0b0c10' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: '#151821' }}>
                                      <tr>
                                        <th>Time</th>
                                        <th>Phone Number</th>
                                        <th>Status</th>
                                        <th>Error</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {logsData.map((log) => (
                                        <tr key={log._id}>
                                          <td>{new Date(log.createdAt).toLocaleTimeString()}</td>
                                          <td>{log.phoneNumber}</td>
                                          <td>
                                            <span style={{ color: log.status === 'sent' ? '#81c995' : '#f28b82' }}>
                                              {log.status.toUpperCase()}
                                            </span>
                                          </td>
                                          <td style={{ color: '#f28b82' }}>{log.error || '—'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
