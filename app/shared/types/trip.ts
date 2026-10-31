export interface Trip {
  id: string;
  title: string;
  start_date?: string;
  end_date?: string;
  share_file_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TripInput {
  title: string;
  start_date?: string;
  end_date?: string;
}
