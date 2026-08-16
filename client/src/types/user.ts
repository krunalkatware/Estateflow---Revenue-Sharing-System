export interface User {
  id: number;
  email: string;
  role: 'customer' | 'admin' | 'agent';
  is_active: boolean;
  is_verified: boolean;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

export interface CustomerProfile {
  user_id: number;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  avatar_url?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  preferred_cities?: string;
  preferred_budget_min?: number;
  preferred_budget_max?: number;
  preferred_property_type?: string;
  created_at: string;
}

export interface SiteVisit {
  id: number;
  property_id: number;
  property_name?: string;
  property_image?: string;
  property_locality?: string;
  property_city?: string;
  visit_date: string;
  time_slot?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}
