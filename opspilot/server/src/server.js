import app from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';
import { seedDatabase } from './utils/seed.js';

const startServer = async () => {
  try {
    // 1. Connect to Database (or initialize in-memory fallback)
    await connectDB();

    // 2. Seed initial users, knowledge articles, and requests
    await seedDatabase();

    // 3. Start Express HTTP Server
    const server = app.listen(ENV.PORT, () => {
      console.log(`🚀 OpsPilot Server running on http://localhost:${ENV.PORT} [${ENV.NODE_ENV}]`);
      console.log(`⚡ Health check available at http://localhost:${ENV.PORT}/health`);
    });

    return server;
  } catch (error) {
    console.error('Fatal Server Startup Error:', error);
    process.exit(1);
  }
};

startServer();
