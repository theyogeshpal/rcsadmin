import { useState } from 'react';
import { createCampaign } from '../api/client';
import ImageUpload from './ImageUpload';

export default function CampaignForm({ numbers, onSubmitted }) {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!numbers.length) {
      setError('Upload Excel with phone numbers first.');
      return;
    }
    if (!name.trim() || !text.trim()) {
      setError('Campaign name and message text are required.');
      return;
    }

    setLoading(true);
    try {
      const campaign = await createCampaign({
        name: name.trim(),
        text: text.trim(),
        imageUrl: imageUrl.trim(),
        numbers,
      });
      setMessage(`Campaign queued: ${campaign._id} (${numbers.length} numbers)`);
      setName('');
      setText('');
      setImageUrl('');
      onSubmitted?.(campaign);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>New campaign</h2>
      <form onSubmit={handleSubmit}>
        <label>Campaign name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="June promo" />

        <label>Message text (RCS)</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Your message…" />

        <ImageUpload imageUrl={imageUrl} onImageUrlChange={setImageUrl} />

        <div className="stats">
          <span className="stat">{numbers.length} numbers loaded</span>
        </div>

        {numbers.length > 0 && (
          <div className="preview-numbers" style={{ marginBottom: '1rem' }}>
            {numbers.slice(0, 20).join(', ')}
            {numbers.length > 20 ? ` … +${numbers.length - 20} more` : ''}
          </div>
        )}

        <button type="submit" disabled={loading || !numbers.length}>
          {loading ? 'Sending…' : 'Launch campaign'}
        </button>
      </form>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
    </div>
  );
}
