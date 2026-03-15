-- Allow all members of a trip to read that trip's member list.
-- Previous policy only allowed reading own membership row.

DROP POLICY IF EXISTS "trip_members_select" ON trip_members;

CREATE POLICY "trip_members_select"
  ON trip_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM trips t
      WHERE t.id = trip_members.trip_id
    )
  );
