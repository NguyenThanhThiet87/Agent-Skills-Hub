import mongoose from 'mongoose';
import { config } from './env.js';

let isMongoConnected = false;

export async function connectDB() {
  if (!config.mongoUri) {
    console.warn('⚠️ [MongoDB] MONGODB_URI not specified in .env. Falling back to local file storage.');
    isMongoConnected = false;
    return false;
  }

  try {
    // Attempt connection with short timeout so server startup isn't blocked if offline
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500
    });
    isMongoConnected = true;
    console.log('✅ [MongoDB] Connected successfully to database:', mongoose.connection.name);
    return true;
  } catch (err) {
    isMongoConnected = false;
    console.warn(`⚠️ [MongoDB] Could not connect to MongoDB (${err.message}).`);
    console.log('🔄 [Storage] Seamlessly operating in Local Filesystem Mode (D:\\AgentSkillHub\\skills).');
    console.log('💡 [Tip] To enable MongoDB, paste your connection string into D:\\AgentSkillHub\\.env');
    return false;
  }
}

export function getDBStatus() {
  return {
    connected: isMongoConnected,
    mode: isMongoConnected ? 'MongoDB' : 'Local File Storage',
    databaseName: isMongoConnected ? mongoose.connection.name : null,
    skillsDir: config.skillsDir
  };
}
