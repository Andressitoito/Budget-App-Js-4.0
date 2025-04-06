// src/app/api/users/signin/route.js
import dbConnect from '../../../../lib/db';
import { User, Category, Transaction } from '../../../../lib/models';

export async function POST(req) {
  try {
    const { email, given_name, family_name, picture, googleToken } = await req.json();

    await dbConnect();

    let user = await User.findOne({ email }).populate('organizations.organization');
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found, please register' }), { status: 404 });
    }

    user.given_name = given_name;
    user.family_name = family_name;
    user.picture = picture;
    user.lastLogin = Date.now();
    await user.save();

    const categories = await Category.find({ organization_id: { $in: user.organizations.map(o => o.organization) } });
    const transactions = await Transaction.find({ organization_id: { $in: user.organizations.map(o => o.organization) } });

    // Derive defaultOrgName from defaultOrgId
    const defaultOrg = user.organizations.find(o => o.organization._id.toString() === user.defaultOrgId.toString());
    const defaultOrgName = defaultOrg ? defaultOrg.organization.name : 'Unknown';

    return new Response(JSON.stringify({ 
      message: 'Signed in', 
      userId: user._id, 
      defaultOrgId: user.defaultOrgId, 
      token: googleToken, 
      user: { 
        _id: user._id, 
        email: user.email, 
        given_name: user.given_name, 
        family_name: user.family_name, 
        username: user.username || user.email, 
        organizations: user.organizations.map(o => ({ 
          organization: o.organization._id, 
          role: o.role, 
          name: o.organization.name // Populate name
        })), 
        defaultOrgId: user.defaultOrgId,
        defaultOrgName, // Add derived name
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
          username: t.username
        }))
      } 
    }), { status: 200 });
  } catch (error) {
    console.error('Sign-in error:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}