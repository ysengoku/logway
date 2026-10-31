-- Recreate trip_members table and RLS policies

CREATE TABLE IF NOT EXISTS trip_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id    UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('owner', 'member')) DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (trip_id, user_id)
);

ALTER TABLE trip_members ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "trip_members_select" ON trip_members;
CREATE POLICY "trip_members_select"
  ON trip_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "trip_members_insert" ON trip_members;
CREATE POLICY "trip_members_insert"
  ON trip_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "trip_members_delete" ON trip_members;
CREATE POLICY "trip_members_delete"
  ON trip_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
