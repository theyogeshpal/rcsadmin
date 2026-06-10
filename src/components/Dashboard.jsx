import { useState, useEffect } from 'react';
import { getStats } from '../api/client';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, Send, AlertTriangle, MessageSquare } from 'lucide-react';

const COLORS = ['#1a73e8', '#34a853', '#fbbc04', '#ea4335', '#9334e6', '#24c1e0'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container"><p style={{ color: '#9aa0a6' }}>Loading Analytics...</p></div>;
  if (error) return <div className="page-container"><p className="error">{error}</p></div>;
  if (!stats) return null;

  const { contacts, campaigns } = stats;

  const campaignData = [
    { name: 'Sent', count: campaigns.sent, fill: '#34a853' },
    { name: 'Failed', count: campaigns.failed, fill: '#ea4335' },
    { name: 'Pending', count: campaigns.pending, fill: '#fbbc04' }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard Analytics</h1>
        <p className="subtitle" style={{ margin: 0 }}>Overview of your system performance and contacts</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#1c2e4a', padding: '1rem', borderRadius: '12px', color: '#6ba3ff' }}>
            <Users size={32} />
          </div>
          <div>
            <div style={{ color: '#9aa0a6', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Contacts</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e8eaed' }}>{contacts.total.toLocaleString()}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#0d3c26', padding: '1rem', borderRadius: '12px', color: '#81c995' }}>
            <MessageSquare size={32} />
          </div>
          <div>
            <div style={{ color: '#9aa0a6', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Campaigns</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e8eaed' }}>{campaigns.total.toLocaleString()}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#1c2e4a', padding: '1rem', borderRadius: '12px', color: '#6ba3ff' }}>
            <Send size={32} />
          </div>
          <div>
            <div style={{ color: '#9aa0a6', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Messages Sent</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#81c995' }}>{campaigns.sent.toLocaleString()}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: '#3c2020', padding: '1rem', borderRadius: '12px', color: '#f28b82' }}>
            <AlertTriangle size={32} />
          </div>
          <div>
            <div style={{ color: '#9aa0a6', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Messages Failed</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f28b82' }}>{campaigns.failed.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="grid-split" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Contacts Category Pie Chart */}
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem' }}>Contact Categories</h2>
          {contacts.categories.length === 0 ? (
            <p style={{ color: '#9aa0a6' }}>No contacts available.</p>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={contacts.categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {contacts.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#151821', border: '1px solid #3c4048', borderRadius: '8px' }}
                    itemStyle={{ color: '#e8eaed' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Campaigns Bar Chart */}
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem' }}>Campaign Delivery Metrics</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={campaignData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3142" />
                <XAxis dataKey="name" stroke="#9aa0a6" />
                <YAxis stroke="#9aa0a6" />
                <Tooltip 
                  cursor={{ fill: '#151821' }}
                  contentStyle={{ background: '#151821', border: '1px solid #3c4048', borderRadius: '8px', color: '#e8eaed' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {campaignData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
