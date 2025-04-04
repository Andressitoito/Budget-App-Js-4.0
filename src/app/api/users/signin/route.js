// src/app/api/users/signin/route.js
import dbConnect from '../../../../lib/db';
import { User } from '../../../../lib/models';

export async function POST(req) {
  try {
    const { email, given_name, family_name, picture, googleToken } = await req.json();

    console.log('Sign-in request:', { email });

    await dbConnect();
    console.log('DB connected');

    let user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return new Response(JSON.stringify({ error: 'User not found, please register' }), { status: 404 });
    }

    user.given_name = given_name;
    user.family_name = family_name;
    user.picture = picture;
    user.lastLogin = Date.now();
    await user.save();
    console.log('User updated:', user._id);

    return new Response(JSON.stringify({ 
      message: 'Signed in', 
      userId: user._id, 
      defaultOrgId: user.defaultOrgId, 
      token: googleToken, 
      user: { 
        _id: user._id, 
        email: user.email, 
        given_name: user.given_name, 
        family_name: user.family_name, 
        username: user.username
        organizations: user.organizations.map(o => ({ ...o.toObject(), name: null })), 
        defaultOrgId: user.defaultOrgId 
      } 
    }), { status: 200 });
  } catch (error) {
    console.error('Sign-in error:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}