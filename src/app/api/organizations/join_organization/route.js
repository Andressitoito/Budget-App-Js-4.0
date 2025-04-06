// src/app/api/organizations/join_organization/route.js
import dbConnect from '../../../../lib/db';
import { User, Organization, Category, Transaction } from '../../../../lib/models';

export async function POST(req) {
  try {
    const { username, email, given_name, family_name, picture, organizationId, token, googleToken } = await req.json();

    if (token !== process.env.AUTH_TOKEN) {
      return new Response(JSON.stringify({ error: 'Invalid verification token' }), { status: 403 });
    }

    await dbConnect();

    let user = await User.findOne({ email });
    if (user) {
      const alreadyInOrg = user.organizations.some(org => org.organization.toString() === organizationId);
      if (alreadyInOrg) {
        const org = await Organization.findById(organizationId);
        const categories = await Category.find({ organization_id: organizationId });
        const transactions = await Transaction.find({ organization_id: organizationId });
        return new Response(JSON.stringify({ 
          message: 'User already in organization', 
          userId: user._id, 
          orgId: organizationId, 
          token: googleToken, 
          user: { 
            _id: user._id, 
            email: user.email, 
            given_name: user.given_name, 
            family_name: user.family_name, 
            username: user.username || user.email, 
            organizations: user.organizations.map(o => ({ ...o.toObject(), name: o.organization.toString() === organizationId ? org.name : null })), 
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
      }
    } else {
      user = new User({ username, email, given_name, family_name, picture });
      await user.save();
    }

    const org = await Organization.findById(organizationId);
    if (!org) {
      return new Response(JSON.stringify({ error: 'Organization not found' }), { status: 404 });
    }

    user.organizations.push({ organization: org._id, role: 'member' });
    if (!user.defaultOrgId) user.defaultOrgId = org._id;
    org.members.push(user._id);
    await Promise.all([user.save(), org.save()]);

    const categories = await Category.find({ organization_id: organizationId });
    const transactions = await Transaction.find({ organization_id: organizationId });

    return new Response(JSON.stringify({ 
      message: 'Joined organization', 
      userId: user._id, 
      orgId: org._id, 
      token: googleToken, 
      user: { 
        _id: user._id, 
        email: user.email, 
        given_name: user.given_name, 
        family_name: user.family_name, 
        username: user.username || user.email, 
        organizations: user.organizations.map(o => ({ ...o.toObject(), name: o.organization.toString() === organizationId ? org.name : null })), 
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
    }), { status: 201 });
  } catch (error) {
    console.error('Join org error:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}