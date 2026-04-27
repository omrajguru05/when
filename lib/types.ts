export type CustomQuestion = {
  id: string;
  label: string;
  type: 'text' | 'textarea';
  required: boolean;
};

export type Profile = {
  id: string;
  username: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  timezone: string;
  accent_color: string;
  created_at: string;
  updated_at: string;
};

export type EventType = {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  duration_mins: number;
  description: string | null;
  color: string;
  is_active: boolean;
  buffer_mins: number;
  min_notice_mins: number;
  custom_questions: CustomQuestion[];
  created_at: string;
  updated_at: string;
};

export type Availability = {
  id: string;
  user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: string;
};

export type BlockedSlot = {
  id: string;
  user_id: string;
  start_at: string;
  end_at: string;
  reason: string | null;
  created_at: string;
};

export type BookingStatus = 'confirmed' | 'cancelled';

export type Booking = {
  id: string;
  event_type_id: string;
  user_id: string;
  invitee_name: string;
  invitee_email: string;
  invitee_note: string | null;
  custom_answers: Record<string, string>;
  start_at: string;
  end_at: string;
  status: BookingStatus;
  cancellation_token: string;
  google_event_id: string | null;
  created_at: string;
  updated_at: string;
};

export type IntegrationProvider = 'google';

export type Integration = {
  id: string;
  user_id: string;
  provider: IntegrationProvider;
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  scope: string | null;
  calendar_id: string | null;
  created_at: string;
  updated_at: string;
};

export type BusyInterval = {
  start: Date;
  end: Date;
};

export type Slot = {
  start: string;
  end: string;
};

/**
 * Loose database type used by the Supabase clients. We rely on explicit
 * generics like `.maybeSingle<Profile>()` on the read side, and just trust
 * inserts/updates as plain objects on the write side. A fully typed Database
 * shape can be regenerated later via `supabase gen types typescript`.
 */
type Tbl<Row> = {
  Row: Row;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Tbl<Profile>;
      event_types: Tbl<EventType>;
      availability: Tbl<Availability>;
      blocked_slots: Tbl<BlockedSlot>;
      bookings: Tbl<Booking>;
      integrations: Tbl<Integration>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: { booking_status: BookingStatus; integration_provider: IntegrationProvider };
    CompositeTypes: Record<string, never>;
  };
};
