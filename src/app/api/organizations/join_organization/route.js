// src/app/api/organizations/join_organization/route.js
import dbConnect from '../../../../lib/db';
import  {User, Organization} from '../../../../lib/models';

export async function POST(req) {
  try {
    const { username, email, given_name, family_name, picture, organizationId, token, googleToken } = await req.json();

    console.log('Join org request:', { email, organizationId });

    if (token !== process.env.AUTH_TOKEN) {
      console.log('Invalid token:', token);
      return new Response(JSON.stringify({ error: 'Invalid verification token' }), { status: 403 });
    }

    await dbConnect();
    console.log('DB connected');

    let user = await User.findOne({ email });
    if (user) {
      const alreadyInOrg = user.organizations.some(org => org.organization.toString() === organizationId);
      if (alreadyInOrg) {
        console.log('User already in org:', user._id);
        const org = await Organization.findById(organizationId);
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
            organizations: user.organizations.map(o => ({ ...o.toObject(), name: o.organization.toString() === organizationId ? org.name : null })), 
            defaultOrgId: user.defaultOrgId 
          } 
        }), { status: 200 });
      }
    } else {
      user = new User({ username, email, given_name, family_name, picture });
      await user.save();
      console.log('New user created:', user._id);
    }

    const org = await Organization.findById(organizationId);
    if (!org) {
      console.log('Org not found:', organizationId);
      return new Response(JSON.stringify({ error: 'Organization not found' }), { status: 404 });
    }

    user.organizations.push({ organization: org._id, role: 'member' });
    if (!user.defaultOrgId) user.defaultOrgId = org._id;
    org.members.push(user._id);
    await Promise.all([user.save(), org.save()]);
    console.log('User and org updated:', user._id, org._id);

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
        organizations: user.organizations.map(o => ({ ...o.toObject(), name: o.organization.toString() === organizationId ? org.name : null })), 
        defaultOrgId: user.defaultOrgId 
      } 
    }), { status: 201 });
  } catch (error) {
    console.error('Join org error:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}