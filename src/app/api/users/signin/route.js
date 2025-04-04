// src/app/api/users/signin/route.js
import dbConnect from '../../../../lib/db';
import { User } from '../../../../lib/models';
import { createToken } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const { username, given_name, family_name, picture } = await req.json();

    await dbConnect();

    let user = await User.findOne({ username });
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found, please register' }), { status: 404 });
    }

    // Update user details if changed
    user.given_name = given_name;
    user.family_name = family_name;
    user.picture = picture;
    user.lastLogin = Date.now();
    await user.save();

    const jwtToken = createToken(user);
    return new Response(JSON.stringify({ message: 'Signed in', userId: user._id, defaultOrgId: user.defaultOrgId }), {
      status: 200,
      headers: { 'Set-Cookie': `token=${jwtToken}; HttpOnly; Path=/; SameSite=Strict` },
    });
  } catch (error) {
    console.error('Error signing in:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}