export type AppRole = 'citizen' | 'volunteer' | 'ngo' | 'admin';

export interface UserProfile {
  user_id: string;
  full_name: string;
  email: string;
  app_role?: AppRole;
  phone?: string;
  is_available?: boolean;
  latitude?: number;
  longitude?: number;
  ngo_name?: string;
  ngo_address?: string;
  ngo_latitude?: number;
  ngo_longitude?: number;
  total_beds?: number;
  available_beds?: number;
}

export type RescueStatus =
'reported' |
'ngo_assigned' |
'rejected' |
'volunteer_en_route' |
'person_located' |
'person_picked_up' |
'traveling_to_ngo' |
'arrived_at_ngo' |
'ngo_verified' |
'completed' |
'cancelled';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface RescueRequest {
  id: string;
  image_url?: string;
  description: string;
  severity: Severity;
  notes?: string;
  citizen_id: string;
  citizen_name: string;
  latitude: number;
  longitude: number;
  address: string;
  status: RescueStatus;

  assigned_volunteer_id?: string;
  assigned_volunteer_name?: string;
  assigned_ngo_id?: string;
  assigned_ngo_name?: string;
  ngo_address?: string;
  ngo_latitude?: number;
  ngo_longitude?: number;

  priority_score: number;
  created_at: string;
  completed_at?: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'urgent';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  rescue_request_id?: string;
  created_at: string;
}

export interface ChatbotLog {
  id: string;
  user_id: string;
  user_role: AppRole;
  user_message: string;
  bot_response: string;
  timestamp: string;
}