// src/app/api/users/signin/route.js
import dbConnect from '../../../../lib/db';
import { User, Category, Transaction } from '../../../../lib/models';

export async function POST(req) {
  try {
    const { email, given_name, family_name, picture, googleToken } = await req.json();

    console.log('Sign-in request:', { email });

    await dbConnect();
    console.log('DB connected');

    let user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return new Response(JSON.stringify({ error: 'User not found, please register' }), { status: 404 });
    }

    user.given_name = given_name;
    user.family_name = family_name;
    user.picture = picture;
    user.lastLogin = Date.now();
    await user.save();
    console.log('User updated:', user._id);

    const categories = await Category.find({ organization_id: { $in: user.organizations.map(o => o.organization) } });
    const transactions = await Transaction.find({ organization_id: { $in: user.organizations.map(o => o.organization) } });

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
        organizations: user.organizations.map(o => ({ ...o.toObject(), name: null })), 
        defaultOrgId: user.defaultOrgId,
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