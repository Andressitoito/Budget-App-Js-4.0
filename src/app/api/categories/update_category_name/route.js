import dbConnect from '../../../../lib/db';
import { updateCategoryName } from '../../../../lib/api/categories/update_category';

export async function PUT(req) {
  try {
    const { category_id, newCategoryName, organization_id } = await req.json();

    if (!category_id || !newCategoryName || !organization_id) {
      return new Response(JSON.stringify({
        status: 400,
        message: 'Category ID, new name and organization ID are required'
      }), { status: 400 });
    }

    await dbConnect();
    const updatedCategory = await updateCategoryName(category_id, newCategoryName);

    if (global.io) {
      global.io.to(organization_id).emit('categoryNameUpdated', updatedCategory.toObject());
      console.log(`Emitted categoryNameUpdated to org ${organization_id}`);
    }

    return new Response(JSON.stringify({
      status: 200,
      message: `Category name updated to '${updatedCategory.category_name}'`,
      data: updatedCategory.toObject()
    }), { status: 200 });
  } catch (error) {
    console.error('Error updating name:', error);
    return new Response(JSON.stringify({
      status: 500,
      message: 'Error updating name',
      error: error.message
    }), { status: 500 });
  }
}
