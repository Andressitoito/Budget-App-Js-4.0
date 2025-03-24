import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export default function handler(req, res) {
 if (req.method === 'POST') {
  const { token } = req.body;

  try {
   const decoded = jwt.verify(token, JWT_SECRET);
   res.status(200).json({ valid: true, user: decoded });
  } catch (error) {
   if (error.name === 'TokenExpiredError') {
    res.status(401).json({ valid: false, message: 'Token has expired' });
   } else if (error.name === 'JsonWebTokenError') {
    res.status(401).json({ valid: false, message: 'Invalid token' });
   } else {
    res.status(401).json({ valid: false, message: 'Token validation failed' });
   }
  }
 } else {
  res.status(405).json({ message: 'Method Not Allowed' });
 }
}
