import { useState, useEffect } from 'react';
import { getCategories, getTemplates, createCampaign } from '../api/client';
import PastCampaigns from './PastCampaigns';

export default function Campaigns() {
  const [categories, setCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
    getTemplates().then(setTemplates).catch(console.error);
  }, []);

  async function handleLaunch(e) {
    e.preventDefault();
    setError('');

    if (!selectedCategory) {
      setError('Please select a contact category.');
      return;
    }
    if (!selectedTemplate) {
      setError('Please select a message template.');
      return;
    }

    const templateData = templates.find(t => t._id === selectedTemplate);
    if (!templateData) return;

    setLoading(true);
    try {
      await createCampaign({
        name: templateData.name,
        text: templateData.text,
        imageUrl: '',
        category: selectedCategory,
      });
      // Reset form and trigger refresh of past campaigns
      setSelectedCategory('');
      setSelectedTemplate('');
      setRefreshKey(k => k + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Campaigns Manager</h1>
        <p className="subtitle" style={{ margin: 0 }}>Launch new campaigns and monitor delivery history</p>
      </div>

      <div className="grid-split ratio-1-2">
        {/* Left Column: Quick Launch */}
        <div>
          <div className="card">
            <h2>Quick Launch</h2>
            <p style={{ color: '#9aa0a6', fontSize: '0.9rem', marginTop: 0 }}>
              Create a new campaign instantly from your saved templates.
            </p>

            <form onSubmit={handleLaunch} style={{ marginTop: '1.5rem' }}>
              <label>1. Select Contact Set</label>
              <select 
                value={selectedCategory} 
                onChange={e => setSelectedCategory(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#0f1117', color: '#e8eaed', border: '1px solid #3c4048', marginBottom: '1rem' }}
              >
                <option value="" disabled>Choose a category...</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <label>2. Select Message Template</label>
              <select 
                value={selectedTemplate} 
                onChange={e => setSelectedTemplate(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#0f1117', color: '#e8eaed', border: '1px solid #3c4048', marginBottom: '1.5rem' }}
              >
                <option value="" disabled>Choose a message template...</option>
                {templates.map(t => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>

              {error && <div className="error" style={{ marginBottom: '1rem' }}>{error}</div>}

              <button 
                type="submit" 
                disabled={loading || !selectedCategory || !selectedTemplate}
                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
              >
                {loading ? 'Launching...' : 'Launch Campaign'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: History */}
        <div>
          <PastCampaigns refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}
