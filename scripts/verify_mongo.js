import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
const envPath = path.join(__dirname, '..', 'backend', '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && vals.length > 0) {
        process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI not found in backend/.env');
  process.exit(1);
}

console.log('Connecting to:', MONGODB_URI.replace(/:[^@/]+@/, ':****@'));

try {
  await mongoose.connect(MONGODB_URI);
  console.log('\n🟢 Connected successfully to MongoDB Cloud!');
  
  // 1. List all databases
  const admin = mongoose.connection.db.admin();
  const dbList = await admin.listDatabases();
  console.log('\n📁 Databases found on this MongoDB cluster:');
  dbList.databases.forEach(db => {
    console.log(` - ${db.name} (size: ${db.sizeOnDisk} bytes)`);
  });

  // 2. Count users in feedhope database
  const db = mongoose.connection.useDb('feedhope');
  const usersCollection = db.collection('users');
  const userCount = await usersCollection.countDocuments();
  console.log(`\n👥 Users in 'feedhope.users' collection: ${userCount}`);
  
  const sampleUsers = await usersCollection.find().limit(3).toArray();
  if (sampleUsers.length > 0) {
    console.log('📄 Sample users found:');
    sampleUsers.forEach(u => {
      console.log(`   * ${u.email} (${u.full_name})`);
    });
  } else {
    console.log('   (No users found in collection)');
  }

} catch (err) {
  console.error('\n🔴 Failed to query MongoDB:', err.message);
} finally {
  await mongoose.disconnect();
}
