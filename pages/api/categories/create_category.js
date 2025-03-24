import dbConnect from '../../../lib/db';
import { createCategory } from '../../../lib/api/categories/create_category';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { category } = req.body;

    // Connect to the database
    await dbConnect();

    // Create new category
    const savedCategory = await createCategory(category);

    return res.status(201).json({
      status: 201,
      message: `Category: ${category.category_name} was successfully created and saved`,
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
