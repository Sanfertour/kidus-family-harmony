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
  memberId: string;
  memberName: string;
  memberColor: string;
  type: "school" | "activity" | "medical" | "family" | "work";
  assignedToId?: string;
  assignedToName?: string;
  notes?: string;
  hasConflict?: boolean;
  conflictWith?: string[];
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
