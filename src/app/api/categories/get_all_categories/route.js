import dbConnect from '../../../../lib/db';
import { get_all_categories } from '../../../../lib/api/categories/get_all_categories';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const organization_id = searchParams.get('organization_id');

    if (!organization_id) {
      return new Response(JSON.stringify({
        status: 400,
        message: 'Organization ID is required'
      }), { status: 400 });
    }

    await dbConnect();
    const categories = await get_all_categories(organization_id);

    return new Response(JSON.stringify({
      status: 200,
      message: 'Categories retrieved successfully',
      data: {
        categories,
        count: categories.length
      }
    }), { status: 200 });
  } catch (error) {
    console.error('Error retrieving categories:', error);
    return new Response(JSON.stringify({
      status: 500,
      message: 'Error retrieving categories',
      error: error.message
    }), { status: 500 });
  }
}