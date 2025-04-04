// src/app/api/organizations/join_organization/route.js
import dbConnect from '../../../../lib/db';
import User from '../../../../lib/models/usersModel';
import Organization from '../../../../lib/models/organizationModel';
import { createToken } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const { username, email, given_name, family_name, picture, organizationId, token } = await req.json();

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
        const jwtToken = createToken(user);
        console.log('User already in org:', user._id);
        return new Response(JSON.stringify({ message: 'User already in organization', userId: user._id, orgId: organizationId }), {
          status: 200,
          headers: { 'Set-Cookie': `token=${jwtToken}; HttpOnly; Path=/; SameSite=Lax; Max-Age=3600` },
        });
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

    const jwtToken = createToken(user);
    console.log('Setting cookie with token:', jwtToken);
    return new Response(JSON.stringify({ message: 'Joined organization', userId: user._id, orgId: org._id }), {
      status: 201,
      headers: { 'Set-Cookie': `token=${jwtToken}; HttpOnly; Path=/; SameSite=Lax; Max-Age=3600` },
    });
  } catch (error) {
    console.error('Join org error:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}