import dbConnect from '../../../lib/db';
import { get_all_categories } from '../../../lib/api/categories/get_all_categories';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { organization_id } = req.query;
		console.log(organization_id);

    if (!organization_id) {
      return res.status(400).json({
        status: 400,
        message: 'Organization ID is required'
      });
    }

    // Connect to the database
    await dbConnect();

    // Get all categories for the organization
    const categories = await get_all_categories(organization_id);

		console.log("categories" ,categories);



    return res.status(200).json({
      status: 200,
      message: 'Categories retrieved successfully',
      data: {
        categories,
        count: categories.length
      }
    });

  } catch (error) {
    console.error('Error retrieving categories:', error);
    return res.status(500).json({
      status: 500,
      message: 'Error retrieving categories',
      error: error.message
    });
  }
}
