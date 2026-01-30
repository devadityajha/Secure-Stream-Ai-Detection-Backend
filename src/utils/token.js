

require("dotenv").config()
const jwt = require("jsonwebtoken");

const tokengenerate = (payload) => {
  
  const secret = process.env.JWT_SECRET || 'examproctoring2026secretkey';
  
  return jwt.sign(payload, secret, { expiresIn: "7d" });  // ✅ Changed 15min to 7d
};

module.exports = tokengenerate;
