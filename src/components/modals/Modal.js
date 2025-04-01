// src/components/modals/Modal.js
import { useForm } from 'react-hook-form';

export default function Modal({ isOpen, onClose, config, onSubmit }) {
  if (!isOpen) return null;

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: config.initialData || {},
  });

  const submitHandler = async (data) => {
    try {
      const response = await fetch(config.endpoint, {
        method: config.method || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, organization_id: config.organization_id }),
      });
      if (!response.ok) throw new Error(`Failed to ${config.action}`);
      onSubmit(await response.json());
      onClose();
    } catch (error) {
      console.error(`Error ${config.action}:`, error);
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
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
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