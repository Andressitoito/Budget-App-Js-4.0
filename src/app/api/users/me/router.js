// src/app/api/users/me/route.js
import dbConnect from '../../../../../lib/db';
import { User } from '../../../../../lib/models';
import { authMiddleware } from '../../../../../lib/auth';

export async function GET(req) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult.error) {
      return new Response(JSON.stringify({ error: authResult.error }), { status: authResult.status });
    }

    await dbConnect();
    const user = await User.findById(authResult.user.id).populate('organizations.organization');
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    console.log('User fetched:', user._id);
    return new Response(JSON.stringify({ 
      user: { 
        _id: user._id, 
        email: user.email, 
        given_name: user.given_name, 
        family_name: user.family_name, 
        username: user.username, 
        organizations: user.organizations.map(o => ({ 
          organization: o.organization._id, 
          role: o.role, 
          name: o.organization.name 
        })), 
        defaultOrgId: user.defaultOrgId 
      } 
    }), { status: 200 });
  } catch (error) {
    console.error('Get user error:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}