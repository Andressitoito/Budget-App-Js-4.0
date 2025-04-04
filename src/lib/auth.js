// src/lib/auth.js
import jwt from 'jsonwebtoken';

export const authMiddleware = async (req) => {
  const authHeader = req.headers.get('authorization');
  const googleToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  console.log('Auth middleware - Headers:', { authHeader, googleToken });

  if (!googleToken) {
    console.log('No Google token found in Authorization header');
    return { error: 'Unauthorized', status: 401 };
  }

  try {
    const res = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${googleToken}`);
    if (!res.ok) throw new Error('Invalid Google token');
    const tokenData = await res.json();
    console.log('Google token verified:', tokenData);

    const User = (await import('../models/usersModel.js')).default;
    const dbConnect = (await import('../lib/db.js')).default;
    await dbConnect();
    const user = await User.findOne({ email: tokenData.email });
    if (!user) {
      console.log('User not found for email:', tokenData.email);
      return { error: 'User not found', status: 404 };
    }

    console.log('User found:', user._id);
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
  console.log('JWT created (unused for now):', token);
  return token;
};