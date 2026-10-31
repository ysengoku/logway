-- Allow authenticated users to read trips they belong to via trip_members

DROP POLICY IF EXISTS "Users can view member trips" ON trips;

CREATE POLICY "Users can view member trips"
  ON trips FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM trip_members
      WHERE trip_members.trip_id = trips.id
      AND trip_members.user_id = auth.uid()
    )
  );
