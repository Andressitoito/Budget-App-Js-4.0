// src/app/api/users/orgs/route.js
import dbConnect from '../../../../lib/db';
import { User, Organization } from '../../../../lib/models';
import { authMiddleware } from '../../../../lib/auth';

export async function GET(req) {
  const auth = await authMiddleware(req);
  if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

  try {
    await dbConnect();
    const user = await User.findById(auth.user.id).populate('organizations.organization');
    if (!user) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });

    const orgs = await Promise.all(
      user.organizations.map(async (org) => {
        const orgData = await Organization.findById(org.organization)
          .populate('owner', 'username')
          .populate('members', 'username');
        return {
          _id: orgData._id,
          name: orgData.name,
          owner: orgData.owner._id,
          ownerUsername: orgData.owner.username,
          members: orgData.members.map(m => ({ _id: m._id, username: m.username })),
          role: org.role,
        };
      })
    );

    return new Response(JSON.stringify({ orgs }), { status: 200 });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}