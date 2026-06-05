import { useRef, useState } from 'react';
import { parseExcelFile } from '../utils/parseExcel';
import { downloadSampleExcel } from '../utils/downloadSampleExcel';

export default function ExcelUpload({ onNumbersParsed }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setLoading(true);
    setFileName(file.name);
    try {
      const numbers = await parseExcelFile(file);
      if (numbers.length === 0) {
        setError('No valid phone numbers found in sheet.');
        onNumbersParsed([]);
      } else {
        onNumbersParsed(numbers);
      }
    } catch (err) {
      setError(err.message || 'Failed to parse Excel');
      onNumbersParsed([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>1. Upload Excel (.xlsx)</h2>
      <p style={{ color: '#9aa0a6', fontSize: '0.9rem' }}>
        First column or column named phone/mobile/number will be parsed into an array.
      </p>
      <div className="upload-actions">
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFile}
        />
        <button
          type="button"
          className="secondary"
          onClick={() => downloadSampleExcel()}
        >
          Download sample Excel
        </button>
      </div>
      <p style={{ color: '#9aa0a6', fontSize: '0.85rem', marginTop: '0.5rem' }}>
        Sample file columns: <strong>phone</strong> (required), <strong>name</strong> (optional).
      </p>
      {fileName && <div className="stat">File: {fileName}</div>}
      {loading && <div>Parsing…</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
