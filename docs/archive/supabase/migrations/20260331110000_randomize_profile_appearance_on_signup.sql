-- Assign random profile appearance on signup via auth.users trigger.

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
BEGIN
  INSERT INTO public.profiles (id, display_name, icon, icon_color, icon_bg_color)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    icon_options[1 + floor(random() * array_length(icon_options, 1))::int],
    default_icon_color,
    default_icon_bg_color
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$function$;
