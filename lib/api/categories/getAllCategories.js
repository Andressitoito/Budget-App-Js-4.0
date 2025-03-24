export const getAllCategories = async (organization_id) => {
 const organizationData = {
  organization_id: organization_id,
 };

 const response = await fetch(`/api/database/categories/get_all_categories`, {
  method: "POST",
  body: JSON.stringify(organizationData),
  headers: {
   "Content-Type": "application/json",
  },
 });

 const data = await response.json();
 return data.categoriesArray
};