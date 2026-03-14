export interface Trip {
  id: string;
  title: string;
  start_date?: string;
  end_date?: string;
  owner_id?: string;
  invite_code: string;
  created_at: string;
  updated_at: string;
}

export interface TripInput {
  title: string;
  start_date?: string;
  end_date?: string;
}

export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string;
  role: 'owner' | 'member';
  created_at: string;
}
