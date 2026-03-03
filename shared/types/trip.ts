export interface Trip {
  id: string;
  title: string;
  start_date?: string;
  end_date?: string;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TripInput {
  title: string;
  start_date?: string;
  end_date?: string;
}
