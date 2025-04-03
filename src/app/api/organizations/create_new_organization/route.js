// src/app/api/organizations/create_new_organization/route.js
import dbConnect from '../../../../lib/db';
import { User, Organization } from '../../../../lib/models';
import { createToken } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const { username, given_name, family_name, picture, token, organizationName } = await req.json();

    if (token !== process.env.AUTH_TOKEN) {
      return new Response(JSON.stringify({ error: 'Invalid verification token' }), { status: 403 });
    }

    console.log('Creating new organization...');
    console.log('Request data:', { username, given_name, family_name, picture, organizationName });

    await dbConnect();

    let user = await User.findOne({ username });
    if (user) {
      const ownsOrg = user.organizations.some(org => org.role === 'owner');
      if (ownsOrg) {
        return new Response(JSON.stringify({
          error: `Sorry ${user.username}, you already own an organization. Join an existing one instead.`,
          redirect_join_organization: true
        }), { status: 403 });
      }
    } else {
      user = new User({ username, given_name, family_name, picture });
    }

    const existingOrg = await Organization.findOne({ name: organizationName });
    if (existingOrg) {
      return new Response(JSON.stringify({ error: 'Organization name already exists' }), { status: 409 });
    }

    const org = new Organization({ name: organizationName, owner: user._id, members: [user._id] });
    await org.save();

    user.organizations.push({ organization: org._id, role: 'owner' });
    user.defaultOrgId = org._id;
    await user.save();

    const jwtToken = createToken(user);
    return new Response(JSON.stringify({ message: 'Organization created', userId: user._id, orgId: org._id }), {
      status: 201,
      headers: { 'Set-Cookie': `token=${jwtToken}; HttpOnly; Path=/; SameSite=Strict` },
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}