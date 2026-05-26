import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "8.8.4.4"]); // fixes querySrv ECONNREFUSED on some Windows setups

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error(
      "DB Connection Error: MONGODB_URI is missing. Copy server/.env.example to server/.env and add your Atlas connection string."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log(`Database Connected (${mongoose.connection.name})`);
  } catch (error) {
    console.error("DB Connection Error:", error.message);

    if (error.message.includes("bad auth")) {
      console.error(`
MongoDB Atlas login failed. Check:
  1. Database Access → user password matches server/.env
  2. If the password has special characters (@ # %), URL-encode it in MONGODB_URI
  3. Network Access → add your IP or 0.0.0.0/0 for testing
`);
    }

    process.exit(1);
  }
};

export default connectDB;
