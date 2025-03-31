// src/components/Modal.js
import { useState } from 'react';

export default function Modal({ isOpen, onClose, config, onSubmit }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState(config.initialData || {});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(config.endpoint, {
        method: config.method || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, organization_id: config.organization_id }),
      });
      if (!response.ok) throw new Error(`Failed to ${config.action}`);
      onSubmit(await response.json());
      onClose();
    } catch (error) {
      console.error(`Error ${config.action}:`, error);
    }
  };

  return (
    <div style={{ position: 'fixed', top: '20%', left: '20%', width: '60%', background: 'white', padding: '20px', border: '1px solid #ccc' }}>
      <h3>{config.title}</h3>
      {config.fields.map((field) => (
        <div key={field.name}>
          <label>{field.label}</label>
          <input
            type={field.type}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            placeholder={field.placeholder}
          />
        </div>
      ))}
      <button onClick={handleSubmit}>{config.submitLabel || 'Submit'}</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}