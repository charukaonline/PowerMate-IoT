const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Check if MongoDB URI is available
    if (!process.env.MONGO_URI) {
      console.error("MongoDB URI is not defined in environment variables");
      return false;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    return false;
  }
};

module.exports = connectDB;
