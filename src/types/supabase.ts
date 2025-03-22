
// Database types
export type Database = {
  public: {
    Tables: {
      messages: {
        Row: {
          id: string;
          content: string;
          user_id: string;
          group_id: string;
          created_at: string;
          profiles?: {
            name: string;
            avatar: string | null;
          } | null;
        };
      };
      group_members: {
        Row: {
          id: string;
          user_id: string;
          group_id: string;
          role: string;
          joined_at: string;
          profiles?: {
            name: string;
            avatar: string | null;
          } | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar: string | null;
          academic_level: string | null;
          subject_interests: string[] | null;
          bio: string | null;
          study_preferences: {
            timeOfDay: string;
            groupSize: number;
          } | null;
          created_at: string;
          updated_at: string;
        };
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          subject: string;
          subject_tags: string[] | null;
          is_public: boolean;
          invitation_code: string | null;
          capacity: number;
          created_at: string;
          updated_at: string;
        };
      };
      resources: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          file_url: string;
          file_type: string;
          group_id: string;
          user_id: string;
          created_at: string;
          tags: string[] | null;
        };
      };
      sessions: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          start_time: string;
          end_time: string;
          location: string | null;
          group_id: string;
          host_id: string;
          created_at: string;
        };
      };
      session_attendees: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          status: 'confirmed' | 'tentative' | 'declined';
          created_at: string;
        };
      };
    };
    Functions: {};
    Enums: {};
  };
};

// Derived types
export type Message = Database['public']['Tables']['messages']['Row'];
export type GroupMember = Database['public']['Tables']['group_members']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row']; 
export type Group = Database['public']['Tables']['groups']['Row'];
export type Resource = Database['public']['Tables']['resources']['Row'];
export type Session = Database['public']['Tables']['sessions']['Row'];
export type SessionAttendee = Database['public']['Tables']['session_attendees']['Row'];

// JSON type from Supabase
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
