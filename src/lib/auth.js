// src/lib/auth.js
import jwt from 'jsonwebtoken';
import { User } from './models';
import dbConnect from './db.js';

export const authMiddleware = async (req) => {
  const authHeader = req.headers.get('authorization');
  const googleToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!googleToken) {
    return { error: 'Unauthorized', status: 401 };
  }

  try {
    const res = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${googleToken}`);
    if (!res.ok) {
      const errorData = await res.json();
      console.error('Tokeninfo error response:', errorData);
      throw new Error('Invalid Google token');
    }
    const tokenData = await res.json();

    await dbConnect();
    const user = await User.findOne({ email: tokenData.email });
    if (!user) {
      return { error: 'User not found', status: 404 };
    }

    return { user: { id: user._id, email: user.email, organizations: user.organizations, defaultOrgId: user.defaultOrgId } };
  } catch (error) {
    console.error('Token verification failed:', error);
    return { error: 'Invalid token', status: 401 };
  }
};

export const createToken = (user) => {
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.getRoleInOrganization(user.organizations[0]?.organization) },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  return token;
};