// src/app/api/users/signin/route.js
import dbConnect from '../../../../lib/db';
import User from '../../../../lib/models/usersModel';
import { createToken } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const { email, given_name, family_name, picture } = await req.json();

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

    const jwtToken = createToken(user);
    console.log('Setting cookie with token:', jwtToken);
    return new Response(JSON.stringify({ message: 'Signed in', userId: user._id, defaultOrgId: user.defaultOrgId }), {
      status: 200,
      headers: { 'Set-Cookie': `token=${jwtToken}; HttpOnly; Path=/; SameSite=Lax; Max-Age=3600` },
    });
  } catch (error) {
    console.error('Sign-in error:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}