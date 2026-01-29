require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usermodel = require("../models/user.model");
const tokengenerate = require("../utils/token");

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Both are required" });
    }

    const existinguser = await usermodel.findOne({ email });
    if (existinguser) {
      return res.status(409).json({ message: "user already exist" });
    }

    const hashedpassword = await bcrypt.hash(password, 10);

    const user = await usermodel.create({
      name,
      email,
      password: hashedpassword,
      role: "user",
    });
    const payload = {
      id: user._id,
      role: user.role,
    };
    const token = tokengenerate(payload);
    res.status(201).json({
      message: "Signup successfully",
      token,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.log("signup error", error);

    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existinguser = await usermodel.findOne({ email });
    if (!existinguser) {
      return res.status(404).json({ message: "Email id not found " });
    }

    const ispassword = await bcrypt.compare(password, existinguser.password);
    if (!ispassword) {
      return res
        .status(400)
        .json({ message: "password does not matched, try something else" });
    }

    const payload = {
      email: existinguser.email,
      id: existinguser._id,
      role: existinguser.role,
    };
    const token = tokengenerate(payload);

    res.status(200).json({
      message: "Login successfully",
      user: {
        name: existinguser.name,
        email: existinguser.email,
        role: existinguser.role,
      },
      token,
    });
  } catch (error) {
    console.log(error.message);
    res.status(501).json({ message: "Login error" });
  }
};

module.exports = { signup, login };
