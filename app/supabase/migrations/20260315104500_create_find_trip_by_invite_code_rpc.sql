-- Lookup trip by invite code via RPC (for authenticated users)
-- Used by server route: GET /api/trips/by-invite/:inviteCode

CREATE OR REPLACE FUNCTION public.find_trip_by_invite_code(p_invite_code TEXT)
RETURNS SETOF public.trips
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_code TEXT;
BEGIN
  normalized_code := upper(trim(p_invite_code));

  IF normalized_code IS NULL OR normalized_code = '' THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT t.*
  FROM public.trips t
  WHERE t.invite_code = normalized_code
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.find_trip_by_invite_code(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_trip_by_invite_code(TEXT) TO authenticated;
