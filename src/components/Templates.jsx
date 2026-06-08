import { useState, useEffect } from 'react';
import { getTemplates, createTemplate, deleteTemplate } from '../api/client';
import { Trash2 } from 'lucide-react';

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    getTemplates().then(setTemplates).catch(err => console.error(err));
  }, [refreshKey]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    
    setLoading(true);
    try {
      await createTemplate({ name: name.trim(), text: text.trim() });
      setName('');
      setText('');
      setRefreshKey(k => k + 1);
    } catch (err) {
      alert(`Error creating template: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      await deleteTemplate(id);
      setRefreshKey(k => k + 1);
    } catch (err) {
      alert(`Error deleting template: ${err.message}`);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Message Templates</h1>
        <p className="subtitle" style={{ margin: 0 }}>Create and manage reusable SMS message templates</p>
      </div>

      <div className="grid-split">
        <div>
          <div className="card">
            <h2>Create New Template</h2>
            <form onSubmit={handleCreate}>
              <label>Template Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. Promo Campaign 1"
              />

              <label>Message Text</label>
              <textarea 
                value={text} 
                onChange={e => setText(e.target.value)} 
                placeholder="Hello! Check out our new promo..."
                style={{ height: '150px' }}
              />

              <button type="submit" disabled={loading || !name.trim() || !text.trim()} style={{ width: '100%' }}>
                {loading ? 'Saving...' : 'Save Template'}
              </button>
            </form>
          </div>
        </div>

        <div>
          <div className="card">
            <h2>Saved Templates</h2>
            {templates.length === 0 ? (
              <p style={{ color: '#9aa0a6', textAlign: 'center', margin: '2rem 0' }}>No templates saved yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {templates.map(t => (
                  <div key={t._id} style={{ background: '#0f1117', padding: '1rem', borderRadius: '8px', border: '1px solid #2d3142', position: 'relative' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: '#e8eaed' }}>{t.name}</h3>
                    <p style={{ margin: 0, color: '#9aa0a6', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{t.text}</p>
                    
                    <button 
                      onClick={() => handleDelete(t._id)}
                      style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', padding: '0.25rem', color: '#f28b82', border: 'none' }}
                      title="Delete Template"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
