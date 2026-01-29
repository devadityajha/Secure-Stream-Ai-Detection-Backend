require("dotenv").config();
const mongoose = require("mongoose");

const attemptconnection = async () => {
  try {
    const mongourl = process.env.MONGO_URL;
    mongoose.set("strictQuery", false);
    await mongoose.connect(mongourl);
    console.log("Mongo db connected successfully");
  } catch (error) {
    console.log("db connecting error", error.message);
  }
};

module.exports = attemptconnection;
