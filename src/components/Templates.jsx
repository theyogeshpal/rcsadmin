import { useState, useEffect, useRef } from 'react';
import { getTemplates, createTemplate, deleteTemplate } from '../api/client';
import { Trash2, Bold, Italic, Link as LinkIcon } from 'lucide-react';

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const textareaRef = useRef(null);

  useEffect(() => {
    getTemplates().then(setTemplates).catch(err => console.error(err));
  }, [refreshKey]);

  function insertFormatting(prefix, suffix = '') {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);
    
    const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
    setText(newText);
    
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start, end + prefix.length + suffix.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length);
      }
    }, 0);
  }

  function parseMarkdown(rawText) {
    let html = rawText
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: #8ab4f8; text-decoration: none;">$1</a>')
      .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
    return { __html: html };
  }

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
              
              {/* Formatting Toolbar */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <button 
                  type="button" 
                  className="secondary" 
                  onClick={() => insertFormatting('*', '*')}
                  style={{ padding: '0.4rem', flex: 'none', background: '#1c2e4a', border: 'none', color: '#6ba3ff' }}
                  title="Bold (*text*)"
                >
                  <Bold size={16} />
                </button>
                <button 
                  type="button" 
                  className="secondary" 
                  onClick={() => insertFormatting('_', '_')}
                  style={{ padding: '0.4rem', flex: 'none', background: '#1c2e4a', border: 'none', color: '#6ba3ff' }}
                  title="Italic (_text_)"
                >
                  <Italic size={16} />
                </button>
                <button 
                  type="button" 
                  className="secondary" 
                  onClick={() => insertFormatting(' [Link Text](https://', ') ')}
                  style={{ padding: '0.4rem', flex: 'none', background: '#1c2e4a', border: 'none', color: '#6ba3ff' }}
                  title="Insert Link"
                >
                  <LinkIcon size={16} />
                </button>
              </div>

              <textarea 
                ref={textareaRef}
                value={text} 
                onChange={e => setText(e.target.value)} 
                placeholder="Hello! Check out our new promo..."
                style={{ height: '150px' }}
              />

              {text && (
                <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9aa0a6', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Live SMS/RCS Preview
                  </label>
                  <div style={{ 
                    background: '#202124', 
                    borderRadius: '16px 16px 16px 4px', 
                    padding: '0.9rem 1.1rem', 
                    maxWidth: '320px', 
                    color: '#e8eaed',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    lineHeight: '1.4',
                    fontSize: '0.95rem',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                  }}>
                    <div dangerouslySetInnerHTML={parseMarkdown(text)} />
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading || !name.trim() || !text.trim()} style={{ width: '100%', marginTop: '1rem' }}>
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
                  <div key={t._id} style={{ background: '#0f1117', padding: '1.25rem', borderRadius: '12px', border: '1px solid #2d3142', position: 'relative' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', color: '#e8eaed' }}>{t.name}</h3>
                    
                    <div style={{ 
                      background: '#202124', 
                      borderRadius: '16px 16px 16px 4px', 
                      padding: '0.9rem 1.1rem', 
                      maxWidth: '100%', 
                      color: '#e8eaed',
                      lineHeight: '1.4',
                      fontSize: '0.95rem',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                    }}>
                      <div dangerouslySetInnerHTML={parseMarkdown(t.text)} />
                    </div>
                    
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
