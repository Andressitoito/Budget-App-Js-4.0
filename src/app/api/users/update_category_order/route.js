// src/app/api/users/update_category_order/route.js
import dbConnect from '../../../../lib/db';
import { User } from '../../../../lib/models';
import { authMiddleware } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult.error) {
      return new Response(JSON.stringify({ error: authResult.error }), { status: authResult.status });
    }

    const { organization_id, categoryOrder } = await req.json();

    if (!organization_id || !Array.isArray(categoryOrder)) {
      return new Response(JSON.stringify({ error: 'Organization ID and category order array are required' }), { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(authResult.userId);
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    const orderEntry = user.categoryOrder.find(o => o.organizationId.toString() === organization_id);
    if (orderEntry) {
      orderEntry.order = categoryOrder;
    } else {
      user.categoryOrder.push({ organizationId: organization_id, order: categoryOrder });
    }
    await user.save();

    return new Response(JSON.stringify({ message: 'Category order updated' }), { status: 200 });
  } catch (error) {
    console.error('Update category order error:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}