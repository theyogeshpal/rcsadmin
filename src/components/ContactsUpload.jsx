import { useState, useEffect } from 'react';
import ExcelUpload from './ExcelUpload';
import { uploadContacts, getContacts } from '../api/client';

export default function ContactsUpload() {
  const [numbers, setNumbers] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [contacts, setContacts] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    getContacts().then(data => {
      setContacts(data);
      setSelectedIds(new Set());
    }).catch(err => console.error(err));
  }, [refreshKey]);

  async function handleSave() {
    if (!numbers.length) {
      setError('Please upload an Excel file first.');
      return;
    }
    if (!category.trim()) {
      setError('Please provide a category name.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await uploadContacts(numbers, category.trim());
      setMessage(`Successfully saved ${res.count} numbers to category "${category}".`);
      setNumbers([]);
      setCategory('');
      setRefreshKey(k => k + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSelected() {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} contacts?`)) return;

    setDeleting(true);
    try {
      // Import this dynamically or make sure it's exported from client.js
      const { deleteContacts } = await import('../api/client');
      await deleteContacts(Array.from(selectedIds));
      setRefreshKey(k => k + 1);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  }

  function toggleSelection(id) {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  }

  function toggleAll() {
    const visibleContacts = contacts.slice(0, 15);
    if (selectedIds.size === visibleContacts.length && visibleContacts.length > 0) {
      setSelectedIds(new Set()); // Deselect all
    } else {
      setSelectedIds(new Set(visibleContacts.map(c => c._id))); // Select all
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Contacts Management</h1>
        <p className="subtitle" style={{ margin: 0 }}>Upload numbers from Excel and organize them by category</p>
      </div>

      <div className="grid-split">
        <div>
          <ExcelUpload onNumbersParsed={(nums) => {
            setNumbers(nums);
            setError('');
            setMessage('');
          }} />
          
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h2>2. Save to Category</h2>
            <p style={{ color: '#9aa0a6', fontSize: '0.9rem', marginTop: 0 }}>
              Give these numbers a category name so you can select them later when launching a campaign.
            </p>
            <div style={{ marginTop: '1rem' }}>
              <label>Category Name</label>
              <input 
                type="text" 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                placeholder="e.g. VIP Customers, June Leads..."
              />
              <div className="stats" style={{ margin: '1rem 0' }}>
                <span className="stat">{numbers.length} numbers ready to save</span>
              </div>
              <button 
                onClick={handleSave} 
                disabled={loading || !category.trim() || numbers.length === 0} 
                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
              >
                {loading ? 'Saving...' : 'Save Numbers to Database'}
              </button>
            </div>
            {error && <div className="error">{error}</div>}
            {message && <div className="success">{message}</div>}
          </div>
        </div>

        <div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0 }}>Recent Contacts</h2>
              {selectedIds.size > 0 && (
                <button 
                  className="danger" 
                  onClick={handleDeleteSelected}
                  disabled={deleting}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  {deleting ? 'Deleting...' : `Delete Selected (${selectedIds.size})`}
                </button>
              )}
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input 
                        type="checkbox" 
                        checked={contacts.length > 0 && selectedIds.size === Math.min(contacts.length, 15)}
                        onChange={toggleAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th>Phone Number</th>
                    <th>Category</th>
                    <th>Added On</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', color: '#9aa0a6' }}>No contacts found</td>
                    </tr>
                  ) : (
                    contacts.slice(0, 15).map(c => (
                      <tr key={c._id}>
                        <td>
                          <input 
                            type="checkbox" 
                            checked={selectedIds.has(c._id)}
                            onChange={() => toggleSelection(c._id)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td>{c.phoneNumber}</td>
                        <td><span className="status-badge" style={{ background: '#2d3142', color: '#e8eaed' }}>{c.category}</span></td>
                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {contacts.length > 15 && <p style={{ fontSize: '0.85rem', color: '#9aa0a6', textAlign: 'center', marginTop: '1rem' }}>Showing latest 15 contacts</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
