import { useState } from 'react';
import { uploadToCloudinary } from '../lib/cloudinary';

export default function ImageUploader({ label = 'Image', value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="form-group">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label
          className="btn secondary"
          style={{ padding: '10px 16px', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          <i className="fa-solid fa-cloud-arrow-up"></i>{' '}
          {uploading ? 'Uploading...' : 'Upload to Cloudinary'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>

        <input
          type="url"
          className="form-control"
          style={{ flex: 1, minWidth: '220px' }}
          placeholder="Or paste image URL..."
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      {error && (
        <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '6px' }}>{error}</p>
      )}

      {value && (
        <div style={{ marginTop: '10px' }}>
          <img
            src={value}
            alt="Preview"
            style={{
              maxHeight: '120px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              objectFit: 'contain',
            }}
          />
        </div>
      )}
    </div>
  );
}