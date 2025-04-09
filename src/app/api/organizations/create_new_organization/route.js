// src/app/api/organizations/create_new_organization/route.js
import dbConnect from '../../../../lib/db';
import { User, Organization } from '../../../../lib/models';
import { getGoogleUserInfo } from '../../../../lib/google-auth';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const { code, redirectUri = 'http://localhost:3000', username, organizationName, token: verifyToken } = await req.json();

    if (!code) {
      return new Response(JSON.stringify({ error: 'Missing authorization code' }), { status: 400 });
    }

    if (!organizationName || typeof organizationName !== 'string' || organizationName.trim() === '') {
      return new Response(JSON.stringify({ error: 'Organization name is required and must be a non-empty string' }), { status: 400 });
    }

    // Optional: Verify token if your app uses it for organization creation
    if (verifyToken && verifyToken !== process.env.AUTH_TOKEN) {
      return new Response(JSON.stringify({ error: 'Invalid verification token' }), { status: 403 });
    }

    // Exchange code for Google user info
    const userInfo = await getGoogleUserInfo(code, redirectUri);
    if (!userInfo.email) {
      return new Response(JSON.stringify({ error: 'Failed to fetch user info from Google' }), { status: 400 });
    }

    console.log('Creating new organization...');
    await dbConnect();
    console.log('DB connected');

    let user = await User.findOne({ email: userInfo.email });
    const now = new Date();

    if (user) {
      const ownsOrg = user.organizations.some(org => org.role === 'owner');
      if (ownsOrg) {
        return new Response(JSON.stringify({
          error: `Sorry ${user.email}, you already own an organization. Join an existing one instead.`,
          redirect_join_organization: true
        }), { status: 403 });
      }
    } else {
      user = new User({
        username: username || userInfo.email.split('@')[0],
        email: userInfo.email,
        given_name: userInfo.given_name,
        family_name: userInfo.family_name,
        picture: userInfo.picture,
        lastLogin: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    const existingOrg = await Organization.findOne({ name: organizationName });
    if (existingOrg) {
      return new Response(JSON.stringify({ error: 'Organization name already exists' }), { status: 409 });
    }

    const org = new Organization({
      name: organizationName,
      owner: user._id,
      members: [user._id],
      createdAt: now,
      updatedAt: now,
    });
    await org.save();

    user.organizations.push({ organization: org._id, role: 'owner', name: organizationName, joinedAt: now });
    user.defaultOrgId = org._id.toString();
    user.defaultOrgName = organizationName;
    user.updatedAt = now;
    await user.save();

    // Generate JWT for session
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    const minimalUserData = {
      _id: user._id.toString(),
      email: user.email,
      given_name: user.given_name,
      family_name: user.family_name,
      username: user.username,
      defaultOrgId: user.defaultOrgId,
      defaultOrgName: user.defaultOrgName,
    };

    return new Response(JSON.stringify({
      token, // JWT, not Google token
      user: minimalUserData,
      orgId: org._id.toString(),
    }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Create org error:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}