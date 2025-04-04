// src/app/api/organizations/create_new_organization/route.js
import dbConnect from '../../../../lib/db';
import { User, Organization } from '../../../../lib/models';

export async function POST(req) {
  try {
    const { username, email, given_name, family_name, picture, token, organizationName, googleToken } = await req.json();

    console.log('Create org request:', { username, email, organizationName });

    if (token !== process.env.AUTH_TOKEN) {
      console.log('Invalid token:', token);
      return new Response(JSON.stringify({ error: 'Invalid verification token' }), { status: 403 });
    }

    if (!organizationName || typeof organizationName !== 'string' || organizationName.trim() === '') {
      console.log('Invalid organizationName:', organizationName);
      return new Response(JSON.stringify({ error: 'Organization name is required and must be a non-empty string' }), { status: 400 });
    }

    await dbConnect();
    console.log('DB connected');

    let user = await User.findOne({ email });
    if (user) {
      const ownsOrg = user.organizations.some(org => org.role === 'owner');
      if (ownsOrg) {
        console.log('User already owns org:', user._id);
        return new Response(JSON.stringify({
          error: `Sorry ${user.email}, you already own an organization. Join an existing one instead.`,
          redirect_join_organization: true
        }), { status: 403 });
      }
    } else {
      user = new User({ username, email, given_name, family_name, picture });
      await user.save();
      console.log('New user created:', user._id);
    }

    const existingOrg = await Organization.findOne({ name: organizationName });
    if (existingOrg) {
      console.log('Org already exists:', existingOrg._id);
      return new Response(JSON.stringify({ error: 'Organization name already exists' }), { status: 409 });
    }

    const org = new Organization({ name: organizationName, owner: user._id, members: [user._id] });
    await org.save();
    console.log('Org created:', org._id);

    user.organizations.push({ organization: org._id, role: 'owner' });
    user.defaultOrgId = org._id;
    await user.save();
    console.log('User updated with org:', user._id);

    return new Response(JSON.stringify({ 
      message: 'Organization created', 
      userId: user._id, 
      orgId: org._id, 
      token: googleToken, 
      user: { 
        _id: user._id, 
        email: user.email, 
        given_name: user.given_name, 
        family_name: user.family_name, 
        username: user.username || user.email, 
        organizations: [{ organization: org._id, role: 'owner', name: organizationName }], 
        defaultOrgId: org._id,
        categories: [], // Empty initially
        transactions: [] // Empty initially
      } 
    }), { status: 201 });
  } catch (error) {
    console.error('Create org error:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}