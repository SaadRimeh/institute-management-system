import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

const startServer = async () => {
  const server = app.listen(env.port, () => {
    console.log(`🚀 Institute Management Server listening on port ${env.port}`);
    console.log(`📡 Health Check URL: http://localhost:${env.port}/health`);
  });

  try {
    await connectDatabase();
    console.log("✅ MongoDB connected successfully!");
  } catch (error) {
    console.warn("⚠️ MongoDB is not currently running locally or not reachable at:", env.mongoUri);
    console.warn("   The Express server remains active for /health and API requests.");
  }
};

startServer();

