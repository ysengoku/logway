-- Update trips INSERT policy to allow authenticated users to create trips

DROP POLICY IF EXISTS "trips_insert" ON trips;

CREATE POLICY "trips_insert"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
