// src/app/api/users/create_new_user/route.js
import dbConnect from '../../../../lib/db';
import {User, Organization} from '../../../../lib/models';
import { createToken } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const { name, email, given_name, family_name, picture, organizationId, organizationName, token, joinOrg } = await req.json();

    if (token !== process.env.AUTH_TOKEN) {
      return new Response(JSON.stringify({ error: 'Invalid verification token' }), { status: 403 });
    }

    await dbConnect();

    let user = await User.findOne({ email });
    if (user) {
      const jwtToken = createToken(user);
      const orgId = user.organizations[0]?.organization || organizationId;
      return new Response(JSON.stringify({ message: 'User exists', userId: user._id, orgId }), {
        status: 200,
        headers: { 'Set-Cookie': `token=${jwtToken}; HttpOnly; Path=/; SameSite=Strict` },
      });
    }

    user = new User({ name, email, given_name, family_name, picture });
    let org;

    if (joinOrg) {
      org = await Organization.findById(organizationId);
      if (!org) {
        return new Response(JSON.stringify({ error: 'Organization not found' }), { status: 404 });
      }
      user.organizations.push({ organization: org._id, role: 'member' });
    } else {
      org = new Organization({ name: organizationName, owner: user._id });
      await org.save();
      user.organizations.push({ organization: org._id, role: 'owner' });
      user.defaultOrgId = org._id;
    }

    await user.save();

    const jwtToken = createToken(user);
    return new Response(JSON.stringify({ message: 'User created', userId: user._id, orgId: org._id }), {
      status: 201,
      headers: { 'Set-Cookie': `token=${jwtToken}; HttpOnly; Path=/; SameSite=Strict` },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}