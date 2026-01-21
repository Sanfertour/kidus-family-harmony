export type UserRole = 'autonomous' | 'dependent';

export interface EventData {
  id: string;
  nest_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  is_private: boolean;
  category?: string;
  assigned_to?: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  nest_id: string | null;
  role: UserRole;
  display_name: string;
  avatar_url?: string;
}
