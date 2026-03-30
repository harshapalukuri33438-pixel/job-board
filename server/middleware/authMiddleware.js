const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("❌ No Authorization header");
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Expecting format: Bearer <token>
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.log("❌ Invalid Authorization format:", authHeader);
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const token = parts[1];

    if (!token) {
      console.log("❌ Token missing after Bearer");
      return res.status(401).json({ message: 'Token missing' });
    }

    // 🔥 DEBUG LOGS
    console.log("🔍 TOKEN RECEIVED:", token);
    console.log("🔍 SECRET USED:", process.env.JWT_SECRET);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("✅ TOKEN VERIFIED:", decoded);

    req.user = decoded;
    next();

  } catch (err) {
    console.log("❌ AUTH ERROR:", err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth;