// src/app/pages/home/configs.js
export const createTransactionConfig = (selectedCategory, selectedOrgId) => ({
  title: 'New Transaction',
  fields: [
    { label: 'Item', name: 'item', type: 'text', placeholder: 'Item' },
    { label: 'Price', name: 'price', type: 'number', placeholder: 'Price' },
  ],
  endpoint: '/api/transactions/create_transaction',
  method: 'POST',
  action: 'create transaction',
  initialData: { category_id: selectedCategory?._id, username: 'Andrew' },
  organization_id: selectedOrgId,
  submitLabel: 'Add',
});

export const createCategoryConfig = (selectedOrgId) => ({
  title: 'Create Category',
  fields: [
    { label: 'Name', name: 'name', type: 'text', placeholder: 'Category Name' },
    { label: 'Base Amount', name: 'base_amount', type: 'number', placeholder: 'Base Amount' },
  ],
  endpoint: '/api/categories/create_category',
  method: 'POST',
  action: 'create category',
  initialData: { name: '', base_amount: 0 },
  organization_id: selectedOrgId,
  submitLabel: 'Create',
});

export const editCategoryConfig = (selectedCategory, selectedOrgId) => ({
  title: 'Edit Category',
  fields: [
    { label: 'Name', name: 'name', type: 'text', value: selectedCategory?.name },
    { label: 'Base Amount', name: 'base_amount', type: 'number', value: selectedCategory?.base_amount },
  ],
  endpoint: '/api/categories/update_category',
  method: 'POST',
  action: 'update category',
  initialData: { category_id: selectedCategory?._id, name: selectedCategory?.name, base_amount: selectedCategory?.base_amount },
  organization_id: selectedOrgId,
  submitLabel: 'Save',
});

export const deleteCategoryConfig = (selectedCategory, selectedOrgId) => ({
  title: 'Confirm Delete Category',
  fields: [],
  endpoint: '/api/categories/delete_category',
  method: 'DELETE',
  action: 'delete category',
  initialData: { category_id: selectedCategory?._id, organization_id: selectedOrgId },
  organization_id: selectedOrgId,
  submitLabel: 'Delete',
});