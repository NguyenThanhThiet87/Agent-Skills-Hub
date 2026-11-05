import mongoose from 'mongoose';
import { config } from './env.js';

let isMongoConnected = false;
let mongoError = null;

export async function connectDB() {
  if (!config.mongoUri) {
    console.warn('⚠️ [MongoDB] MONGODB_URI not specified in .env. Falling back to local file storage.');
    isMongoConnected = false;
    mongoError = 'MONGODB_URI not specified';
    return false;
  }

  try {
    // Attempt connection with reasonable timeout for cloud PaaS environments (e.g. Render)
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000
    });
    isMongoConnected = true;
    mongoError = null;
    console.log('✅ [MongoDB] Connected successfully to database:', mongoose.connection.name);
    return true;
  } catch (err) {
    isMongoConnected = false;
    mongoError = err.message;
    console.warn(`⚠️ [MongoDB] Could not connect to MongoDB: ${err.message}`);
    console.log('🔄 [Storage] Seamlessly operating in Local Filesystem Mode (D:\\AgentSkillHub\\skills).');
    return false;
  }
}

export function getDBStatus() {
  return {
    connected: isMongoConnected,
    mode: isMongoConnected ? 'MongoDB' : 'Local File Storage',
    databaseName: isMongoConnected ? mongoose.connection.name : null,
    skillsDir: config.skillsDir,
    connectionError: mongoError
  };
}
