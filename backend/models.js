import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  full_name: { type: String, required: true },
  email: { type: String, required: true },
  app_role: { type: String, enum: ['citizen', 'volunteer', 'ngo', 'admin'] },
  phone: String,
  is_available: Boolean,
  latitude: Number,
  longitude: Number,
  ngo_name: String,
  ngo_address: String,
  ngo_latitude: Number,
  ngo_longitude: Number,
  total_beds: Number,
  available_beds: Number
});

const RescueSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  image_url: String,
  description: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  notes: String,
  citizen_id: { type: String, required: true },
  citizen_name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: { type: String, required: true },
  status: { 
    type: String, 
    enum: [
      'reported', 'ngo_assigned', 'rejected', 'volunteer_en_route', 
      'person_located', 'person_picked_up', 'traveling_to_ngo', 
      'arrived_at_ngo', 'ngo_verified', 'completed', 'cancelled'
    ],
    default: 'reported'
  },
  assigned_volunteer_id: String,
  assigned_volunteer_name: String,
  assigned_ngo_id: String,
  assigned_ngo_name: String,
  ngo_address: String,
  ngo_latitude: Number,
  ngo_longitude: Number,
  priority_score: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  completed_at: Date
});

const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'urgent'], default: 'info' },
  read: { type: Boolean, default: false },
  rescue_request_id: String,
  created_at: { type: Date, default: Date.now }
});

const ChatLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  user_role: { type: String, required: true },
  user_message: { type: String, required: true },
  bot_response: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', UserSchema);
export const Rescue = mongoose.model('Rescue', RescueSchema);
export const Notification = mongoose.model('Notification', NotificationSchema);
export const ChatLog = mongoose.model('ChatLog', ChatLogSchema);
