import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dns from 'dns';
import { fileURLToPath } from 'url';
import { User, Rescue, Notification, ChatLog } from './models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.join(__dirname, 'local_db.json');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://gunasri:gunasri@cluster0.k9ogoa5.mongodb.net/feedhope?retryWrites=true&w=majority';

// Connect to MongoDB Cloud Database asynchronously with retry & fallback
console.log('[Database] Connecting to MongoDB Cloud Database (cluster0.k9ogoa5.mongodb.net)...');

mongoose.connection.on('connected', () => {
  console.log('\n==================================================');
  console.log('[Database] SUCCESSFULLY CONNECTED TO MONGODB ATLAS!');
  console.log('==================================================\n');
});

const connectMongo = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  } catch (err) {
    // Try DNS fallback for Node on Windows if initial SRV resolution fails
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    } catch (dnsErr) {
      console.warn('[Database] Active persistence: Local JSON database (local_db.json). MongoDB Cloud fallback:', dnsErr.message);
    }
  }
};

connectMongo();

// Seed mock data when database is completely empty
const initialData = {
  users: [
    {
      user_id: 'admin-1',
      full_name: 'System Admin',
      email: 'admin@feedhope.org',
      app_role: 'admin'
    },
    {
      user_id: 'citizen-1',
      full_name: 'Jane Doe',
      email: 'citizen@feedhope.org',
      app_role: 'citizen'
    },
    {
      user_id: 'vol-puli-1',
      full_name: 'Ramu (Pulivendula Volunteer)',
      email: 'ramu.pulivendula@feedhope.org',
      app_role: 'volunteer',
      is_available: true,
      latitude: 14.4180,
      longitude: 78.2330
    },
    {
      user_id: 'vol-kadapa-1',
      full_name: 'Kiran (Kadapa Volunteer)',
      email: 'kiran.kadapa@feedhope.org',
      app_role: 'volunteer',
      is_available: true,
      latitude: 14.4670,
      longitude: 78.8240
    },
    {
      user_id: 'vol-1',
      full_name: 'Alex Volunteer',
      email: 'volunteer@feedhope.org',
      app_role: 'volunteer',
      is_available: true,
      latitude: 37.7749,
      longitude: -122.4194
    },
    {
      user_id: 'ngo-puli-1',
      full_name: 'Pulivendula Seva Manager',
      email: 'ngo.pulivendula@feedhope.org',
      app_role: 'ngo',
      ngo_name: 'Pulivendula Seva NGO',
      ngo_address: 'Near Srirama Hall, Pulivendula, AP 516390',
      ngo_latitude: 14.4172,
      ngo_longitude: 78.2319,
      total_beds: 25,
      available_beds: 10
    },
    {
      user_id: 'ngo-kadapa-1',
      full_name: 'Kadapa Care Admin',
      email: 'ngo.kadapa@feedhope.org',
      app_role: 'ngo',
      ngo_name: 'Kadapa Care Shelter',
      ngo_address: 'Main Road, Kadapa, AP 516001',
      ngo_latitude: 14.4673,
      ngo_longitude: 78.8242,
      total_beds: 40,
      available_beds: 15
    },
    {
      user_id: 'ngo-1',
      full_name: 'Hope Shelter Manager',
      email: 'ngo@feedhope.org',
      app_role: 'ngo',
      ngo_name: 'Hope Shelter SF',
      ngo_address: '123 Hope St, San Francisco, CA',
      ngo_latitude: 37.7649,
      ngo_longitude: -122.4294,
      total_beds: 50,
      available_beds: 12
    }
  ],
  rescues: [
    {
      id: 'req-1',
      description: 'Elderly man sleeping on a bench, looks very cold and unresponsive.',
      severity: 'critical',
      citizen_id: 'citizen-1',
      citizen_name: 'Jane Doe',
      latitude: 37.775,
      longitude: -122.418,
      address: 'Civic Center Plaza, San Francisco',
      status: 'ngo_assigned',
      assigned_volunteer_id: '',
      assigned_volunteer_name: '',
      assigned_ngo_id: 'ngo-1',
      assigned_ngo_name: 'Hope Shelter SF',
      ngo_address: '123 Hope St, San Francisco, CA',
      ngo_latitude: 37.7649,
      ngo_longitude: -122.4294,
      priority_score: 100,
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    },
    {
      id: 'req-2',
      description: 'Person asking for warm clothes and food.',
      severity: 'low',
      citizen_id: 'citizen-1',
      citizen_name: 'Jane Doe',
      latitude: 37.785,
      longitude: -122.408,
      address: 'Union Square, San Francisco',
      status: 'completed',
      assigned_volunteer_id: 'vol-2',
      assigned_volunteer_name: 'Sam Helper',
      assigned_ngo_id: 'ngo-2',
      assigned_ngo_name: 'Safe Haven Downtown',
      ngo_address: '456 Safe Ave, San Francisco, CA',
      ngo_latitude: 37.7949,
      ngo_longitude: -122.3994,
      priority_score: 20,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      completed_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString()
    }
  ],
  notifications: [
    {
      id: 'notif-1',
      user_id: 'ngo-1',
      title: 'New Rescue Assigned',
      message: 'A critical severity rescue has been assigned to your shelter. Please assign a volunteer.',
      type: 'urgent',
      read: false,
      rescue_request_id: 'req-1',
      created_at: new Date(Date.now() - 1000 * 60 * 14).toISOString()
    }
  ],
  chatbotLogs: []
};

// local JSON database state
let memoryDb = {
  users: [...initialData.users],
  rescues: [...initialData.rescues],
  notifications: [...initialData.notifications],
  chatbotLogs: []
};

function loadMemoryDb() {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const rawData = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      memoryDb = JSON.parse(rawData);
      if (initialData && initialData.users) {
        initialData.users.forEach((seedUser) => {
          const exists = memoryDb.users.some(u => u.user_id === seedUser.user_id);
          if (!exists) {
            memoryDb.users.push(seedUser);
          }
        });
      }
    }
  } catch (err) {
    console.error('Failed to read local JSON database:', err);
  }
}

function saveMemoryDb() {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(memoryDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local JSON database:', err);
  }
}

// Initial load
loadMemoryDb();

// Database Interface Implementation (Dual Persistence: MongoDB Cloud + Local JSON File)
export const database = {
  // 1. Users Operations
  getUsers: async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        return await User.find().lean();
      }
    } catch (e) {}
    loadMemoryDb();
    return memoryDb.users;
  },

  getUserById: async (id) => {
    try {
      if (mongoose.connection.readyState === 1) {
        const userDoc = await User.findOne({ user_id: id }).lean();
        if (userDoc) return userDoc;
      }
    } catch (e) {}
    loadMemoryDb();
    return memoryDb.users.find(u => u.user_id === id) || null;
  },

  getUserByEmail: async (email) => {
    try {
      if (mongoose.connection.readyState === 1) {
        const doc = await User.findOne({ email }).lean();
        if (doc) return doc;
      }
    } catch (e) {}
    loadMemoryDb();
    return memoryDb.users.find(u => u.email && u.email.toLowerCase() === (email || '').toLowerCase()) || null;
  },

  saveUser: async (user) => {
    let savedUser = null;
    try {
      if (mongoose.connection.readyState === 1) {
        const { _id, __v, ...updateData } = user;
        savedUser = await User.findOneAndUpdate(
          { user_id: user.user_id },
          updateData,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean();
      }
    } catch (e) {
      console.error('MongoDB saveUser error:', e);
    }

    loadMemoryDb();
    const idx = memoryDb.users.findIndex(u => u.user_id === user.user_id);
    const userToSave = savedUser || { ...user };
    delete userToSave._id;
    delete userToSave.__v;

    if (idx >= 0) {
      memoryDb.users[idx] = { ...memoryDb.users[idx], ...userToSave };
      saveMemoryDb();
      return memoryDb.users[idx];
    } else {
      memoryDb.users.push(userToSave);
      saveMemoryDb();
      return userToSave;
    }
  },

  // 2. Rescues Operations
  getRescues: async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        return await Rescue.find().lean();
      }
    } catch (e) {}
    loadMemoryDb();
    return memoryDb.rescues;
  },

  getRescueById: async (id) => {
    try {
      if (mongoose.connection.readyState === 1) {
        const doc = await Rescue.findOne({ id }).lean();
        if (doc) return doc;
      }
    } catch (e) {}
    loadMemoryDb();
    return memoryDb.rescues.find(r => r.id === id) || null;
  },

  saveRescue: async (rescue) => {
    let savedRescue = null;
    try {
      if (mongoose.connection.readyState === 1) {
        const { _id, __v, ...updateData } = rescue;
        savedRescue = await Rescue.findOneAndUpdate(
          { id: rescue.id },
          updateData,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean();
      }
    } catch (e) {
      console.error('MongoDB saveRescue error:', e);
    }

    loadMemoryDb();
    const idx = memoryDb.rescues.findIndex(r => r.id === rescue.id);
    const rescueToSave = savedRescue || { ...rescue };
    delete rescueToSave._id;
    delete rescueToSave.__v;

    if (idx >= 0) {
      memoryDb.rescues[idx] = { ...memoryDb.rescues[idx], ...rescueToSave };
      saveMemoryDb();
      return memoryDb.rescues[idx];
    } else {
      memoryDb.rescues.push(rescueToSave);
      saveMemoryDb();
      return rescueToSave;
    }
  },

  // 3. Notifications Operations
  getNotifications: async (userId = null) => {
    try {
      if (mongoose.connection.readyState === 1) {
        let query = {};
        if (userId) {
          query.user_id = userId;
        }
        const list = await Notification.find(query).lean();
        if (list && list.length > 0) {
          return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
      }
    } catch (e) {}

    loadMemoryDb();
    let list = memoryDb.notifications;
    if (userId) {
      list = list.filter(n => n.user_id === userId);
    }
    return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  saveNotification: async (notification) => {
    let savedNotif = null;
    try {
      if (mongoose.connection.readyState === 1) {
        const doc = new Notification({
          id: notification.id || `notif-${Date.now()}`,
          created_at: notification.created_at || new Date().toISOString(),
          ...notification
        });
        const savedDoc = await doc.save();
        savedNotif = savedDoc.toObject ? savedDoc.toObject() : savedDoc;
      }
    } catch (e) {
      console.error('MongoDB saveNotification error:', e);
    }

    const notifToSave = savedNotif || {
      id: notification.id || `notif-${Date.now()}`,
      created_at: notification.created_at || new Date().toISOString(),
      read: false,
      ...notification
    };
    delete notifToSave._id;
    delete notifToSave.__v;

    loadMemoryDb();
    memoryDb.notifications.push(notifToSave);
    saveMemoryDb();
    return notifToSave;
  },

  markNotificationRead: async (id) => {
    let updatedNotif = null;
    try {
      if (mongoose.connection.readyState === 1) {
        updatedNotif = await Notification.findOneAndUpdate(
          { id },
          { read: true },
          { new: true }
        ).lean();
      }
    } catch (e) {
      console.error('MongoDB markNotificationRead error:', e);
    }

    loadMemoryDb();
    const idx = memoryDb.notifications.findIndex(n => n.id === id);
    if (idx >= 0) {
      memoryDb.notifications[idx].read = true;
      saveMemoryDb();
      return memoryDb.notifications[idx];
    }
    return updatedNotif;
  },

  // 4. Chatbot Operations
  getChatbotLogs: async (userId = null) => {
    try {
      if (mongoose.connection.readyState === 1) {
        let query = {};
        if (userId) {
          query.user_id = userId;
        }
        const logs = await ChatLog.find(query).lean();
        if (logs && logs.length > 0) return logs;
      }
    } catch (e) {}

    loadMemoryDb();
    let list = memoryDb.chatbotLogs || [];
    if (userId) {
      list = list.filter(l => l.user_id === userId);
    }
    return list;
  },

  saveChatbotLog: async (log) => {
    let savedLog = null;
    try {
      if (mongoose.connection.readyState === 1) {
        const doc = new ChatLog({
          id: log.id || `chat-${Date.now()}`,
          timestamp: log.timestamp || new Date().toISOString(),
          ...log
        });
        const savedDoc = await doc.save();
        savedLog = savedDoc.toObject ? savedDoc.toObject() : savedDoc;
      }
    } catch (e) {
      console.error('MongoDB saveChatbotLog error:', e);
    }

    const logToSave = savedLog || {
      id: log.id || `chat-${Date.now()}`,
      timestamp: log.timestamp || new Date().toISOString(),
      ...log
    };
    delete logToSave._id;
    delete logToSave.__v;

    loadMemoryDb();
    if (!memoryDb.chatbotLogs) memoryDb.chatbotLogs = [];
    memoryDb.chatbotLogs.push(logToSave);
    saveMemoryDb();
    return logToSave;
  }
};
