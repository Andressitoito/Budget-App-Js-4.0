// src/components/modals/Modal.js
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function Modal({ isOpen, onClose, config, onSubmit }) {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: config.initialData || {},
  });

  const submitHandler = async (data) => {
    setIsLoading(true);
    try {
      const res = await fetch(config.endpoint, {
        method: config.method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Failed to ${config.action}`);
      const responseData = await res.json();
      console.log(`${config.action} response:`, responseData);
      onSubmit();
    } catch (error) {
      console.error(`Error ${config.action}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{config.title}</h2>
        <form onSubmit={handleSubmit(submitHandler)}>
          {config.fields.map((field) => (
            <div key={field.name} className="mb-4">
              <label className="block text-gray-700 mb-1">{field.label}</label>
              <input
                type={field.type}
                {...register(field.name, { 
                  required: `${field.label} is required`,
                  validate: value => field.type === 'number' && (value === '' || isNaN(value)) ? `${field.label} must be a valid number` : true
                })}
                defaultValue={field.value}
                className={`w-full p-2 border rounded-md ${errors[field.name] ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isLoading}
              />
              {errors[field.name] && (
                <p className="text-red-500 text-sm mt-1">{errors[field.name].message}</p>
              )}
            </div>
          ))}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                config.submitLabel
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}