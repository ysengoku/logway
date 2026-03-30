ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS icon TEXT,
  ADD COLUMN IF NOT EXISTS icon_color TEXT,
  ADD COLUMN IF NOT EXISTS icon_bg_color TEXT;

UPDATE public.profiles
SET icon = COALESCE(icon, 'user-secret'),
    icon_color = COALESCE(icon_color, '#b70676'),
    icon_bg_color = COALESCE(icon_bg_color, '#d2eef1')
WHERE icon IS NULL
   OR icon_color IS NULL
   OR icon_bg_color IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN icon SET DEFAULT 'face-smile',
  ALTER COLUMN icon_color SET DEFAULT '#c38e1d',
  ALTER COLUMN icon_bg_color SET DEFAULT '#1B3A5C',
  ALTER COLUMN icon SET NOT NULL,
  ALTER COLUMN icon_color SET NOT NULL,
  ALTER COLUMN icon_bg_color SET NOT NULL;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_icon_color_hex_check,
  DROP CONSTRAINT IF EXISTS profiles_icon_bg_color_hex_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_icon_color_hex_check
    CHECK (icon_color ~ '^#[0-9A-Fa-f]{6}$'),
  ADD CONSTRAINT profiles_icon_bg_color_hex_check
    CHECK (icon_bg_color ~ '^#[0-9A-Fa-f]{6}$');
