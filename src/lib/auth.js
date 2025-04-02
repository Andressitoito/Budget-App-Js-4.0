// src/lib/auth.js
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

export const authMiddleware = async (req) => {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.token;

  if (!token) {
    return { error: 'Unauthorized', status: 401 };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { user: decoded };
  } catch (error) {
    return { error: 'Invalid token', status: 401 };
  }
};

export const createToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.getRoleInOrganization(user.organizations[0]?.organization) },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};