-- Fix RLS recursion between trips and trip_members policies.
-- Use SECURITY DEFINER helper to check membership without policy recursion.

CREATE OR REPLACE FUNCTION public.is_trip_member(target_trip_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.trip_members tm
    WHERE tm.trip_id = target_trip_id
      AND tm.user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_trip_member(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_trip_member(UUID) TO authenticated;

DROP POLICY IF EXISTS "trip_members_select" ON trip_members;
CREATE POLICY "trip_members_select"
  ON trip_members FOR SELECT
  TO authenticated
  USING (public.is_trip_member(trip_id));
