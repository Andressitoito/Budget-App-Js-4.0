// src/app/dashboard/configs.js
export const createTransactionConfig = (category, organizationId) => ({
  title: 'Create Transaction',
  fields: [
    { label: 'Item', name: 'item', type: 'text' },
    { label: 'Price', name: 'price', type: 'number' },
  ],
  endpoint: '/api/transactions/create_transaction',
  method: 'POST',
  action: 'create transaction',
  initialData: { category_id: category._id, organization_id: organizationId },
  organization_id: organizationId,
  submitLabel: 'Create',
});

export const createCategoryConfig = (organizationId) => ({
  title: 'Create Category',
  fields: [
    { label: 'Name', name: 'name', type: 'text' },
    { label: 'Base Amount', name: 'base_amount', type: 'number' },
  ],
  endpoint: '/api/categories/create_category',
  method: 'POST',
  action: 'create category',
  initialData: { organization_id: organizationId },
  organization_id: organizationId,
  submitLabel: 'Create',
});

export const editCategoryConfig = (category, organizationId) => ({
  title: 'Edit Category',
  fields: [
    { label: 'Name', name: 'name', type: 'text', value: category.name },
    { label: 'Base Amount', name: 'base_amount', type: 'number', value: category.base_amount },
  ],
  endpoint: '/api/categories/update_category',
  method: 'POST',
  action: 'update category',
  initialData: { category_id: category._id, organization_id: organizationId },
  organization_id: organizationId,
  submitLabel: 'Save',
});

export const deleteCategoryConfig = (category, organizationId) => ({
  title: 'Confirm Delete Category',
  fields: [],
  endpoint: '/api/categories/delete_category',
  method: 'DELETE',
  action: 'delete category',
  initialData: { category_id: category._id, organization_id: organizationId },
  organization_id: organizationId,
  submitLabel: 'Delete',
});