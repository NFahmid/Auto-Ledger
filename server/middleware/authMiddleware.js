const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Auth Middleware: Header received:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Auth Middleware: No valid Bearer token, returning 401.");
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Auth Middleware: Token decoded successfully:", decoded);
    req.user = { id: decoded.userId };
    console.log("Auth Middleware: req.user set to:", req.user);
    next();
  } catch (err) {
    console.log("Auth Middleware: Token verification failed:", err.message);
    res.status(403).json({ error: "Invalid token" });
  }
};

module.exports = requireAuth;
