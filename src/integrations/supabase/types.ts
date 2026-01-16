export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      events: {
        Row: {
          assigned_to_id: string | null
          created_at: string
          date: string
          end_time: string
          id: string
          is_private: boolean
          location: string | null
          member_id: string
          nest_id: string
          notes: string | null
          start_time: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          assigned_to_id?: string | null
          created_at?: string
          date: string
          end_time: string
          id?: string
          is_private?: boolean
          location?: string | null
          member_id: string
          nest_id: string
          notes?: string | null
          start_time: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          assigned_to_id?: string | null
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          is_private?: boolean
          location?: string | null
          member_id?: string
          nest_id?: string
          notes?: string | null
          start_time?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_assigned_to_id_fkey"
            columns: ["assigned_to_id"]
            isOneToOne: false
            referencedRelation: "nest_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "nest_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_nest_id_fkey"
            columns: ["nest_id"]
            isOneToOne: false
            referencedRelation: "nests"
            referencedColumns: ["id"]
          },
        ]
      }
      nest_members: {
        Row: {
          avatar_url: string | null
          class: string | null
          color: string
          created_at: string
          custody_days: number[] | null
          grade: string | null
          id: string
          name: string
          nest_id: string
          role: string
          school: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          class?: string | null
          color?: string
          created_at?: string
          custody_days?: number[] | null
          grade?: string | null
          id?: string
          name: string
          nest_id: string
          role: string
          school?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          class?: string | null
          color?: string
          created_at?: string
          custody_days?: number[] | null
          grade?: string | null
          id?: string
          name?: string
          nest_id?: string
          role?: string
          school?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nest_members_nest_id_fkey"
            columns: ["nest_id"]
            isOneToOne: false
            referencedRelation: "nests"
            referencedColumns: ["id"]
          },
        ]
      }
      nests: {
        Row: {
          created_at: string
          id: string
          name: string
          share_code: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          share_code?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          share_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          nest_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          nest_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          nest_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_nest_id_fkey"
            columns: ["nest_id"]
            isOneToOne: false
            referencedRelation: "nests"
            referencedColumns: ["id"]
          },
        ]
      }
      school_menus: {
        Row: {
          child_id: string
          created_at: string
          file_url: string | null
          id: string
          month: number
          nest_id: string
          year: number
        }
        Insert: {
          child_id: string
          created_at?: string
          file_url?: string | null
          id?: string
          month: number
          nest_id: string
          year: number
        }
        Update: {
          child_id?: string
          created_at?: string
          file_url?: string | null
          id?: string
          month?: number
          nest_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "school_menus_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "nest_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_menus_nest_id_fkey"
            columns: ["nest_id"]
            isOneToOne: false
            referencedRelation: "nests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
