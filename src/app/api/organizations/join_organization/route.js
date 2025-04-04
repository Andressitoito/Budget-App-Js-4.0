// src/app/api/organizations/join_organization/route.js
import dbConnect from '../../../../lib/db';
import { User, Organization } from '../../../../lib/models';
import { createToken } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const { username, given_name, family_name, picture, organizationId, token } = await req.json();

    if (token !== process.env.AUTH_TOKEN) {
      return new Response(JSON.stringify({ error: 'Invalid verification token' }), { status: 403 });
    }

    console.log('Joining organization:', { username, organizationId });

    await dbConnect();

    let user = await User.findOne({ username });
    if (user) {
      const alreadyInOrg = user.organizations.some(org => org.organization.toString() === organizationId);
      if (alreadyInOrg) {
        const jwtToken = createToken(user);
        return new Response(JSON.stringify({ message: 'User already in organization', userId: user._id, orgId: organizationId }), {
          status: 200,
          headers: { 'Set-Cookie': `token=${jwtToken}; HttpOnly; Path=/; SameSite=Strict` },
        });
      }
    } else {
      user = new User({ username, given_name, family_name, picture });
      await user.save();
      console.log('New user created:', user._id);
    }

    const org = await Organization.findById(organizationId);
    if (!org) {
      return new Response(JSON.stringify({ error: 'Organization not found' }), { status: 404 });
    }

    user.organizations.push({ organization: org._id, role: 'member' });
    if (!user.defaultOrgId) user.defaultOrgId = org._id;
    org.members.push(user._id);
    await Promise.all([user.save(), org.save()]);

    const jwtToken = createToken(user);
    return new Response(JSON.stringify({ message: 'Joined organization', userId: user._id, orgId: org._id }), {
      status: 201,
      headers: { 'Set-Cookie': `token=${jwtToken}; HttpOnly; Path=/; SameSite=Strict` },
    });
  } catch (error) {
    console.error('Error joining organization:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}