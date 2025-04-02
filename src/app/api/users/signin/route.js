// src/app/api/users/signin/route.js
import { google } from 'googleapis';
import { createToken } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const { code } = await req.json();
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/auth/callback'
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    const { name, email, given_name, family_name, picture } = data;
    const jwtToken = createToken({ email, name, given_name, family_name, picture });
    return new Response(JSON.stringify({ message: 'Signed in', user: data }), {
      status: 200,
      headers: { 'Set-Cookie': `token=${jwtToken}; HttpOnly; Path=/; SameSite=Strict` },
    });
  } catch (error) {
    console.error('Error signing in:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}