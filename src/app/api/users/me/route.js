// src/app/api/users/me/route.js
import dbConnect from '../../../../lib/db';
import { User, Category, Transaction } from '../../../../lib/models';
import { authMiddleware } from '../../../../lib/auth';

export async function GET(req) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult.error) {
      return new Response(JSON.stringify({ error: authResult.error }), { status: authResult.status });
    }

    await dbConnect();
    const user = await User.findById(authResult.user.id).populate('organizations.organization');
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    const categories = await Category.find({ organization_id: { $in: user.organizations.map(o => o.organization) } });
    const transactions = await Transaction.find({ organization_id: { $in: user.organizations.map(o => o.organization) } });

    const defaultOrg = user.organizations.find(o => o.organization._id.toString() === user.defaultOrgId.toString());
    const defaultOrgName = defaultOrg ? defaultOrg.organization.name : 'Unknown';

    return new Response(JSON.stringify({ 
      user: { 
        _id: user._id, 
        email: user.email, 
        given_name: user.given_name, 
        family_name: user.family_name, 
        username: user.username || user.email, 
        organizations: user.organizations.map(o => ({ 
          organization: o.organization._id, 
          role: o.role, 
          name: o.organization.name 
        })), 
        defaultOrgId: user.defaultOrgId,
        defaultOrgName,
        categories: categories.map(c => ({
          _id: c._id,
          name: c.name,
          base_amount: c.base_amount,
          remaining_budget: c.remaining_budget,
          organization_id: c.organization_id
        })),
        transactions: transactions.map(t => ({
          _id: t._id,
          item: t.item,
          price: t.price,
          category_id: t.category_id,
          organization_id: t.organization_id,
          username: t.username,
          date: t.date // Added date field
        }))
      } 
    }), { status: 200 });
  } catch (error) {
    console.error('Get user error:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}