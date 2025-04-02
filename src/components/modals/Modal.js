// src/components/modals/Modal.js
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function Modal({ isOpen, onClose, config, onSubmit }) {
  if (!isOpen) return null;

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: config.initialData || {},
  });
  const [isLoading, setIsLoading] = useState(false);

  const submitHandler = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch(config.endpoint, {
        method: config.method || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config.initialData, ...data, organization_id: config.organization_id }),
      });
      if (!response.ok) throw new Error(`Failed to ${config.action}`);
      const result = await response.json();
      onSubmit(result);
      onClose();
    } catch (error) {
      console.error(`Error ${config.action}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-gray-800">{config.title}</h3>
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
          {config.fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700">{field.label}</label>
              <input
                type={field.type}
                {...register(field.name, {
                  required: `${field.label} is required`,
                  valueAsNumber: field.type === 'number',
                  validate: field.type === 'text' ? (value) => value.trim().length > 0 || 'Cannot be empty or just spaces' : null,
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={field.placeholder}
                defaultValue={field.value}
              />
              {errors[field.name] && (
                <p className="text-red-500 text-sm mt-1">{errors[field.name].message}</p>
              )}
            </div>
          ))}
          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-blue-600 text-white px-4 py-2 rounded-md flex items-center justify-center ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
                </svg>
              ) : null}
              {config.submitLabel || 'Submit'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}