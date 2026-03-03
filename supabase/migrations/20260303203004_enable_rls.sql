-- Enable RLS on trips and events tables
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Add owner_id to trips
ALTER TABLE trips ADD COLUMN owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Trips policies
CREATE POLICY "Users can view own trips"
  ON trips FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create own trips"
  ON trips FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE
  USING (auth.uid() = owner_id);

-- Events policies (access via trip ownership)
CREATE POLICY "Users can view own events"
  ON events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = events.trip_id
      AND trips.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own events"
  ON events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = events.trip_id
      AND trips.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = events.trip_id
      AND trips.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own events"
  ON events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = events.trip_id
      AND trips.owner_id = auth.uid()
    )
  );