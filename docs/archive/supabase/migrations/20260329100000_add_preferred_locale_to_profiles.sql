-- Add preferred locale to profiles for i18n persistence.
-- Backfill existing rows, then enforce default and not-null.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_locale TEXT;

UPDATE public.profiles
SET preferred_locale = 'en'
WHERE preferred_locale IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN preferred_locale SET DEFAULT 'en',
  ALTER COLUMN preferred_locale SET NOT NULL;
