// src/lib/auth.js
import jwt from 'jsonwebtoken';

export async function authMiddleware(req) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'No token provided', status: 401 };
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return { userId: decoded.userId, email: decoded.email };
  } catch (error) {
    return { error: 'Invalid token', status: 401 };
  }
}