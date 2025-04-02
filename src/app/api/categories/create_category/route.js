// src/app/api/categories/create_category/route.js
import dbConnect from '../../../../lib/db';
import { Category } from '../../../../lib/models';

export async function POST(req) {
  try {
    await dbConnect();
    const { name, base_amount, organization_id } = await req.json();

    console.log('Creating category:', { name, organization_id, base_amount });

    if (!name || !organization_id || base_amount === undefined) {
      return new Response(JSON.stringify({ error: 'Name, base amount, and organization ID required' }), { status: 400 });
    }

    const category = new Category({
      name,
      base_amount,
      spent_amount: 0,
      remaining_budget: base_amount,
      organization_id,
    });
    await category.save();

    if (global.io) {
      global.io.to(organization_id).emit('newCategory', category.toObject());
      console.log(`Emitted newCategory to org ${organization_id}`);
    }

    return new Response(JSON.stringify({
      message: `Category ${name} was successfully created`,
      category: category.toObject(),
    }), { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}