require("dotenv").config();
const jwt = require("jsonwebtoken");

const tokengenerate = (payload) => {
  return jwt.sign(payload, process.env.jwt, { expiresIn: "15min" });
};

module.exports = tokengenerate;
