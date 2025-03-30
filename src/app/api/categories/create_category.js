import dbConnect from '../../../lib/db';
import { createCategory } from '../../../lib/api/categories/create_category';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 405, message: 'Method not allowed' });
  }

  const { category, organization_id, base_amount } = req.body;
  console.log('Request body:', req.body);

  try {
    await dbConnect();

    // Validate input
    if (!category || !organization_id || base_amount === undefined) {
      return res.status(400).json({
        status: 400,
        message: 'Category name, organization ID, and base amount are required',
      });
    }

    // Create new category
    const savedCategory = await createCategory({ category_name: category, organization_id, base_amount });

    return res.status(201).json({
      status: 201,
      message: `Category ${category} was successfully created and saved`,
      category: savedCategory,
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({
      status: 500,
      message: 'Error creating category',
      error: error.message,
    });
  }
}