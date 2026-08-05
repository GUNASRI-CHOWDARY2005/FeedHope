import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auto-load backend/.env configuration file into process.env
try {
  const envPath = path.join(__dirname, '.env');
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
    console.log(`[Server] Loaded environment configuration from: ${envPath}`);
    if (process.env.GMAIL_USER) {
      console.log(`[Email Service] GMAIL_USER active: ${process.env.GMAIL_USER}`);
    }
  }
} catch (e) { }

import { database } from './database.js';
import { assignRescueEngine } from './services/assignEngine.js';
import { generateChatbotResponse } from './services/chatbot.js';
import { sendVerificationEmail } from './services/email.js';

const app = express();
const PORT = process.env.PORT || 5000;
// Backend Server Entry Point - Live Dual Persistence & SSL Port 465 Transport Fallback

app.use(cors());
app.use(express.json());

// Root health check route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Feedhope Backend API Server is running.',
    frontend_url: 'http://localhost:5173',
    api_endpoints: ['/api/users', '/api/rescues', '/api/notifications', '/api/chatbot']
  });
});

// Helper wrapper for async routes to catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error('API Error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  });
};

// 1. Users Routes
app.get('/api/users', asyncHandler(async (req, res) => {
  const users = await database.getUsers();
  res.json(users);
}));

app.get('/api/users/:id', asyncHandler(async (req, res) => {
  const user = await database.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
}));

app.post('/api/users', asyncHandler(async (req, res) => {
  const userPayload = req.body;
  if (!userPayload.email) {
    return res.status(400).json({ error: 'email is required' });
  }

  // Normalize email
  userPayload.email = userPayload.email.toLowerCase().trim();

  // Look up user by email
  let existing = await database.getUserByEmail(userPayload.email);

  if (existing) {
    if (userPayload.password && existing.password && existing.password !== userPayload.password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }
    const updatedUser = { ...existing, ...userPayload };
    if (updatedUser.email === 'gunasrichowdary86@gmail.com') {
      updatedUser.app_role = 'admin';
    }
    const saved = await database.saveUser(updatedUser);
    res.json(saved);
  } else {
    const newUser = {
      user_id: userPayload.user_id || `user-${Date.now()}`,
      full_name: userPayload.full_name || userPayload.email.split('@')[0],
      email: userPayload.email,
      password: userPayload.password || '',
      ...userPayload
    };
    if (newUser.email === 'gunasrichowdary86@gmail.com') {
      newUser.app_role = 'admin';
    }
    const saved = await database.saveUser(newUser);
    res.json(saved);
  }
}));

// 2. Rescues Routes
app.get('/api/rescues', asyncHandler(async (req, res) => {
  const rescues = await database.getRescues();
  res.json(rescues);
}));

app.get('/api/rescues/:id', asyncHandler(async (req, res) => {
  const rescue = await database.getRescueById(req.params.id);
  if (!rescue) return res.status(404).json({ error: 'Rescue not found' });
  res.json(rescue);
}));

app.post('/api/rescues', asyncHandler(async (req, res) => {
  const newRescue = req.body;

  const rescue = {
    ...newRescue,
    id: `req-${Date.now()}`,
    status: 'reported',
    priority_score: 0,
    created_at: new Date().toISOString()
  };

  await database.saveRescue(rescue);

  // Trigger routing engine (assigns closest NGO)
  const assignedRescue = await assignRescueEngine(rescue.id);
  res.status(201).json(assignedRescue || rescue);
}));

app.put('/api/rescues/:id', asyncHandler(async (req, res) => {
  const existing = await database.getRescueById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Rescue not found' });

  const updates = req.body;

  // Check state transitions to create relevant notifications
  const isNewVolunteer = updates.assigned_volunteer_id && updates.assigned_volunteer_id !== existing.assigned_volunteer_id;
  const isDeclined = (updates.assigned_volunteer_id === null || updates.assigned_volunteer_id === '') && existing.assigned_volunteer_id;
  const isAccepted = updates.status === 'volunteer_en_route' && existing.status === 'ngo_assigned';
  const isStatusUpdated = updates.status && updates.status !== existing.status;

  const updated = { ...existing, ...updates };
  if (updates.status === 'completed') {
    updated.completed_at = new Date().toISOString();
  }

  await database.saveRescue(updated);

  // Create notifications
  if (isNewVolunteer) {
    await database.saveNotification({
      id: `notif-${Date.now()}-vol`,
      user_id: updates.assigned_volunteer_id,
      title: 'Rescue Mission Requested',
      message: `You have been requested for a ${existing.severity} severity rescue mission by ${existing.assigned_ngo_name}.`,
      type: existing.severity === 'critical' || existing.severity === 'high' ? 'urgent' : 'info',
      read: false,
      rescue_request_id: existing.id
    });
  } else if (isDeclined) {
    if (existing.assigned_ngo_id) {
      await database.saveNotification({
        id: `notif-${Date.now()}-ngo-decline`,
        user_id: existing.assigned_ngo_id,
        title: 'Volunteer Declined Request',
        message: `Volunteer ${existing.assigned_volunteer_name} declined the request. Please assign another volunteer.`,
        type: 'warning',
        read: false,
        rescue_request_id: existing.id
      });
    }
  }

  if (isAccepted && existing.assigned_ngo_id) {
    await database.saveNotification({
      id: `notif-${Date.now()}-ngo-accept`,
      user_id: existing.assigned_ngo_id,
      title: 'Mission Accepted',
      message: `Volunteer ${existing.assigned_volunteer_name} has accepted the mission and is en route.`,
      type: 'success',
      read: false,
      rescue_request_id: existing.id
    });
  }

  if (isStatusUpdated) {
    if (existing.citizen_id) {
      await database.saveNotification({
        id: `notif-${Date.now()}-cit-status`,
        user_id: existing.citizen_id,
        title: `Rescue Status Updated`,
        message: `Your report status updated to: ${updates.status.replace(/_/g, ' ')}.`,
        type: 'info',
        read: false,
        rescue_request_id: existing.id
      });
    }
  }

  res.json(updated);
}));

// 3. Notifications Routes
app.get('/api/notifications', asyncHandler(async (req, res) => {
  const { userId } = req.query;
  const list = await database.getNotifications(userId);
  res.json(list);
}));

app.post('/api/notifications', asyncHandler(async (req, res) => {
  const newNotif = await database.saveNotification(req.body);
  res.status(201).json(newNotif);
}));

app.put('/api/notifications/:id/read', asyncHandler(async (req, res) => {
  const notif = await database.markNotificationRead(req.params.id);
  if (!notif) return res.status(404).json({ error: 'Notification not found' });
  res.json(notif);
}));

// 4. Chatbot Routes
app.get('/api/chatbot', asyncHandler(async (req, res) => {
  const { userId } = req.query;
  const logs = await database.getChatbotLogs(userId);
  res.json(logs);
}));

app.post('/api/chatbot', asyncHandler(async (req, res) => {
  const { userId, role, message } = req.body;
  if (!userId || !role || !message) {
    return res.status(400).json({ error: 'userId, role, and message are required' });
  }

  const response = generateChatbotResponse(role, message);

  await database.saveChatbotLog({
    user_id: userId,
    user_role: role,
    user_message: message,
    bot_response: response
  });

  res.json({ response });
}));

// 5. Auth OTP Email Dispatch Route
app.post('/api/auth/send-otp', asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'email and otp are required' });
  }

  const result = await sendVerificationEmail(email, otp);
  res.json({ success: true, ...result });
}));

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server is running on port ${PORT}`);
});
