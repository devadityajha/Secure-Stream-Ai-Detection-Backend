require("dotenv").config();
const jwt = require("jsonwebtoken");

const isloggedin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "token missing, login required" });
    }

    const decoded = jwt.verify(token, process.env.jwt);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error.message);
    res.status(401).json({ message: "token missing, login again" });
  }
};

module.exports = isloggedin;
