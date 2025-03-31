import dbConnect from '../../../../lib/db';
import { updateCategoryBaseAmount } from '../../../../lib/api/categories/update_category';

export async function PUT(req) {
  try {
    const { category_id, new_base_amount, organization_id } = await req.json();

    if (!category_id || typeof new_base_amount !== 'number' || !organization_id) {
      return new Response(JSON.stringify({
        status: 400,
        message: 'Category ID, organization ID and valid base amount are required'
      }), { status: 400 });
    }

    await dbConnect();
    const updatedCategory = await updateCategoryBaseAmount(category_id, new_base_amount);

    if (global.io) {
      global.io.to(organization_id).emit('categoryBaseAmountUpdated', updatedCategory.toObject());
      console.log(`Emitted categoryBaseAmountUpdated to org ${organization_id}`);
    }

    return new Response(JSON.stringify({
      status: 200,
      message: 'Base amount updated successfully',
      data: updatedCategory.toObject()
    }), { status: 200 });
  } catch (error) {
    console.error('Error updating base amount:', error);
    return new Response(JSON.stringify({
      status: 500,
      message: 'Error updating base amount',
      error: error.message
    }), { status: 500 });
  }
}