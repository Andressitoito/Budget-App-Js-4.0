// src/components/modals/Modal.js
'use client';

import { useState } from 'react';

export default function Modal({ isOpen, onClose, config, onSubmit }) {
  const [formData, setFormData] = useState(config.initialData || {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(config.endpoint, {
        method: config.method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.token}`, // Use token from config
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error(`Failed to ${config.action}`);
      const data = await res.json();
      console.log(`${config.action} response:`, data);
      onSubmit();
    } catch (error) {
      console.error(`Error ${config.action}:`, error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{config.title}</h2>
        <form onSubmit={submitHandler}>
          {config.fields.map((field) => (
            <div key={field.name} className="mb-4">
              <label className="block text-gray-700 mb-1">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name] || field.value || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
          ))}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {config.submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}