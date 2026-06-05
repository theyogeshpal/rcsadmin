import { useRef, useState } from 'react';
import { uploadImage } from '../api/client';

export default function ImageUpload({ imageUrl, onImageUrlChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    setFileName(file.name);
    try {
      const { url } = await uploadImage(file);
      onImageUrlChange(url);
    } catch (err) {
      setError(err.message || 'Upload failed');
      onImageUrlChange('');
    } finally {
      setUploading(false);
    }
  }

  function clearImage() {
    onImageUrlChange('');
    setFileName('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div>
      <label>Campaign image (optional)</label>
      <div className="upload-actions">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFile}
          disabled={uploading}
        />
        {imageUrl && (
          <button type="button" className="secondary" onClick={clearImage}>
            Remove image
          </button>
        )}
      </div>
      {uploading && <div style={{ color: '#9aa0a6', fontSize: '0.9rem' }}>Uploading…</div>}
      {fileName && !uploading && <div className="stat">Uploaded: {fileName}</div>}
      {imageUrl && (
        <div className="image-preview">
          <img src={imageUrl} alt="Campaign preview" />
        </div>
      )}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
