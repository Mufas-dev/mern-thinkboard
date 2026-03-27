import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error(
        "Missing env var MONGO_URI. Create backend/.env with MONGO_URI=<your mongodb connection string> (or set it in your shell)."
      );
    }

    await mongoose.connect(mongoUri);
    console.log("MONGODB CONNECTED SUCCESSFULLY!");
  } catch (error) {
    console.error("Error connecting to MONGODB", error);
    process.exit(1); // exit with failure
  }
};
