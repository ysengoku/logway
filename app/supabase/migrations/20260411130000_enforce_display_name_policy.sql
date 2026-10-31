-- Enforce display name policy at database level.
-- Policy:
-- - 2 to 16 chars
-- - allowed chars: A-Z a-z 0-9 space _ -
-- - no leading/trailing spaces
-- - no consecutive spaces
-- - reserved words blocked

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_display_name_policy_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_display_name_policy_check
  CHECK (
    char_length(display_name) BETWEEN 2 AND 16
    AND display_name = btrim(display_name)
    AND display_name !~ '  +'
    AND display_name ~ '^[A-Za-z0-9 _-]+$'
    AND lower(display_name) NOT IN ('admin', 'system', 'support')
  );

-- Make auth trigger resilient: fallback to user id prefix when metadata/email local part
-- does not satisfy profile display_name policy.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  icon_options text[] := ARRAY[
    'cat',
    'dog',
    'dove',
    'fish',
    'frog',
    'shrimp',
    'apple-whole',
    'seedling',
    'user-astronaut',
    'user-secret',
    'chess-knight',
    'face-grin-hearts',
    'face-grin-squint-tears',
    'face-smile',
    'face-smile-wink'
  ];
  default_icon_color text := '#c38e1d';
  default_icon_bg_color text := '#1B3A5C';
  fallback_display_name text := 'user_' || left(replace(NEW.id::text, '-', ''), 8);
  raw_display_name text := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    split_part(COALESCE(NEW.email, ''), '@', 1)
  );
  final_display_name text;
BEGIN
  IF raw_display_name IS NULL OR raw_display_name = '' THEN
    final_display_name := fallback_display_name;
  ELSE
    final_display_name := raw_display_name;
  END IF;

  IF char_length(final_display_name) < 2
     OR char_length(final_display_name) > 16
     OR final_display_name <> btrim(final_display_name)
     OR final_display_name ~ '  +'
     OR final_display_name !~ '^[A-Za-z0-9 _-]+$'
     OR lower(final_display_name) IN ('admin', 'system', 'support') THEN
    final_display_name := fallback_display_name;
  END IF;

  INSERT INTO public.profiles (id, display_name, icon, icon_color, icon_bg_color)
  VALUES (
    NEW.id,
    final_display_name,
    icon_options[1 + floor(random() * array_length(icon_options, 1))::int],
    default_icon_color,
    default_icon_bg_color
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$function$;
