import { Fragment, useEffect, useState } from 'react';
import { getCampaign, listCampaigns } from '../api/client';

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
      return;
    }
    setExpandedId(id);
    setDetailLoading(true);
    try {
      const full = await getCampaign(id);
      setDetail(full);
    } catch (err) {
      setDetail({ error: err.message });
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Past campaigns</h2>
      <p style={{ color: '#9aa0a6', fontSize: '0.9rem', marginTop: 0 }}>
        All previous campaigns — click a row for full details.
      </p>
      {error && <div className="error">{error}</div>}
      {loading && <p style={{ color: '#9aa0a6' }}>Loading…</p>}
      {!loading && campaigns.length === 0 && (
        <p style={{ color: '#9aa0a6' }}>No campaigns yet. Create your first campaign above.</p>
      )}
      {!loading && campaigns.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Status</th>
                <th>Total</th>
                <th>Sent</th>
                <th>Failed</th>
                <th>Pending</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <Fragment key={c._id}>
                  <tr
                    className={`campaign-row ${expandedId === c._id ? 'expanded' : ''}`}
                    onClick={() => toggleExpand(c._id)}
                  >
                    <td>{formatDate(c.createdAt)}</td>
                    <td>{c.name}</td>
                    <td>
                      <span className={statusClass(c.status)}>{c.status}</span>
                    </td>
                    <td>{c.stats?.total ?? '—'}</td>
                    <td>{c.stats?.sent ?? 0}</td>
                    <td>{c.stats?.failed ?? 0}</td>
                    <td>{c.stats?.pending ?? 0}</td>
                    <td>{c.imageUrl ? 'Yes' : '—'}</td>
                  </tr>
                  {expandedId === c._id && (
                    <tr className="detail-row">
                      <td colSpan={8}>
                        {detailLoading && <span style={{ color: '#9aa0a6' }}>Loading details…</span>}
                        {!detailLoading && detail?.error && (
                          <div className="error">{detail.error}</div>
                        )}
                        {!detailLoading && detail && !detail.error && (
                          <div className="campaign-detail">
                            <p>
                              <strong>Message:</strong> {detail.text}
                            </p>
                            {detail.imageUrl && (
                              <div className="image-preview small">
                                <img src={detail.imageUrl} alt="" />
                                <a href={detail.imageUrl} target="_blank" rel="noreferrer">
                                  Open image
                                </a>
                              </div>
                            )}
                            {detail.error && (
                              <p className="error">
                                <strong>Error:</strong> {detail.error}
                              </p>
                            )}
                            <p>
                              <strong>Created by:</strong> {detail.createdBy || 'admin'} ·{' '}
                              <strong>Updated:</strong> {formatDate(detail.updatedAt)}
                            </p>
                            <p>
                              <strong>Retries:</strong> up to 3 attempts per failed number (8s apart)
                            </p>
                            <p>
                              <strong>Numbers count:</strong> {detail.numbers?.length ?? 0}
                              {detail.assignments?.length > 0 && (
                                <>
                                  {' '}
                                  · <strong>Devices:</strong>{' '}
                                  {detail.assignments.map((a) => a.deviceId).join(', ')}
                                </>
                              )}
                            </p>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
