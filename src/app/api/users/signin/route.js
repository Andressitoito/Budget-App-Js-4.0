// src/app/api/users/signin/route.js
import dbConnect from '../../../../lib/db';
import { User, Organization } from '../../../../lib/models';
import { getGoogleUserInfo } from '../../../../lib/google-auth';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const { code, redirectUri = 'http://localhost:3000', username, organizationId, organizationName, token: verifyToken } = await req.json();

    if (!code) {
      return new Response(JSON.stringify({ error: 'Missing authorization code' }), { status: 400 });
    }

    // Get user info from Google
    const userInfo = await getGoogleUserInfo(code, redirectUri);
    if (!userInfo.email) {
      return new Response(JSON.stringify({ error: 'Failed to fetch user info from Google' }), { status: 400 });
    }

    await dbConnect();

    let user = await User.findOne({ email: userInfo.email });
    const now = new Date();

    if (!user) {
      if (organizationId) {
        // Join organization
        const org = await Organization.findById(organizationId);
        if (!org) {
          return new Response(JSON.stringify({ error: 'Organization not found' }), { status: 404 });
        }
        // Add verifyToken validation if required
        if (verifyToken && org.verifyToken !== verifyToken) { // Example check
          return new Response(JSON.stringify({ error: 'Invalid verification token' }), { status: 403 });
        }
        user = new User({
          username: username || userInfo.email.split('@')[0],
          email: userInfo.email,
          given_name: userInfo.given_name,
          family_name: userInfo.family_name,
          picture: userInfo.picture,
          defaultOrgId: organizationId,
          defaultOrgName: org.name,
          organizations: [{
            organization: organizationId,
            role: 'member',
            name: org.name,
            joinedAt: now,
          }],
          lastLogin: now,
          createdAt: now,
          updatedAt: now,
        });
      } else {
        // Create new organization
        const organization = new Organization({
          name: organizationName || `${userInfo.given_name}'s Organization`,
          createdAt: now,
          updatedAt: now,
        });
        await organization.save();

        user = new User({
          username: username || userInfo.email.split('@')[0],
          email: userInfo.email,
          given_name: userInfo.given_name,
          family_name: userInfo.family_name,
          picture: userInfo.picture,
          defaultOrgId: organization._id.toString(),
          defaultOrgName: organization.name,
          organizations: [{
            organization: organization._id,
            role: 'owner',
            name: organization.name,
            joinedAt: now,
          }],
          lastLogin: now,
          createdAt: now,
          updatedAt: now,
        });
      }
      await user.save();
    } else {
      // Update existing user
      user.lastLogin = now;
      user.updatedAt = now;
      await user.save();
    }

    // Generate JWT
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

    return new Response(JSON.stringify({ token, user: minimalUserData, orgId: user.defaultOrgId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Sign-in error:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}