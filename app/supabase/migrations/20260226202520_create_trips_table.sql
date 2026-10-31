-- Trips table
CREATE TABLE trips (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  start_date  DATE,
  end_date    DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update trigger for updated_at
CREATE TRIGGER set_updated_at_trips
BEFORE UPDATE ON trips
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add foreign key constraint to events table
ALTER TABLE events
  ADD CONSTRAINT events_trip_id_fkey
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE;
