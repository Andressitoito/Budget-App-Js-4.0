import dbConnect from '../../../../lib/db';
import { createCategory } from '../../../../lib/api/categories/create_category';

export async function POST(req) {
  try {
    const { category, organization_id, base_amount } = await req.json();
    await dbConnect();

    if (!category || !organization_id || base_amount === undefined) {
      return new Response(JSON.stringify({
        status: 400,
        message: 'Category name, organization ID, and base amount are required',
      }), { status: 400 });
    }

    const savedCategory = await createCategory({ category_name: category, organization_id, base_amount });

    if (global.io) {
      global.io.to(organization_id).emit('categoryCreated', savedCategory.toObject());
      console.log(`Emitted categoryCreated to org ${organization_id}`);
    }

    return new Response(JSON.stringify({
      status: 201,
      message: `Category ${category} was successfully created`,
      category: savedCategory.toObject(),
    }), { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return new Response(JSON.stringify({
      status: 500,
      message: 'Error creating category',
      error: error.message,
    }), { status: 500 });
  }
}