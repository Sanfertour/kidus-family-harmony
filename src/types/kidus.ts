// KidUs Core Types

export interface NestMember {
  id: string;
  name: string;
  role: "adult" | "child";
  color: string;
  avatar?: string; // URL to uploaded photo
  school?: string;
  grade?: string;
  class?: string;
  custodyDays?: number[]; // 0-6 representing days of week
}

export interface EventData {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  // Interesado - who the event is for (defines color)
  memberId: string;
  memberName: string;
  memberColor: string;
  // Event metadata
  type: "school" | "activity" | "medical" | "family" | "work" | "meal";
  // Responsable - who is managing logistics
  assignedToId?: string;
  assignedToName?: string;
  notes?: string;
  // Conflict detection
  hasConflict?: boolean;
  conflictWith?: string[];
  // Privacy mode
  isPrivate?: boolean;
}

export interface ConflictInfo {
  eventId: string;
  conflictingEventIds: string[];
  message: string;
}

export interface CustodyBlock {
  date: string;
  memberId: string;
  memberColor: string;
  memberName: string;
}

// Database types (maps to Supabase tables)
export interface DbNest {
  id: string;
  name: string;
  share_code: string;
  created_at: string;
  updated_at: string;
}

export interface DbNestMember {
  id: string;
  nest_id: string;
  user_id?: string;
  name: string;
  role: "adult" | "child";
  color: string;
  avatar_url?: string;
  school?: string;
  grade?: string;
  class?: string;
  custody_days?: number[];
  created_at: string;
  updated_at: string;
}

export interface DbEvent {
  id: string;
  nest_id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location?: string;
  member_id: string;
  assigned_to_id?: string;
  type: "school" | "activity" | "medical" | "family" | "work" | "meal";
  notes?: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbProfile {
  id: string;
  user_id: string;
  nest_id?: string;
  display_name?: string;
  created_at: string;
  updated_at: string;
}
