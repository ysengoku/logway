-- Event table to store all types of events (flight, transport, hotel, restaurant, activity, link)
CREATE TABLE events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL CHECK (type IN ('flight','transport','hotel','restaurant','activity','link')),
  trip_id     UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Flight, transport
  flight_number   TEXT,
  service_number  TEXT,
  transport_mode  TEXT CHECK (transport_mode IN ('train','bus','ferry','car','other')),
  booking_ref     TEXT,

  -- Departure
  dep_place       TEXT,
  dep_tz_id       TEXT,
  dep_local_date  DATE,
  dep_local_time  TIME,
  dep_utc         TIMESTAMPTZ,

  -- Arrival
  arr_place       TEXT,
  arr_tz_id       TEXT,
  arr_local_date  DATE,
  arr_local_time  TIME,
  arr_utc         TIMESTAMPTZ,

  -- Accommodation, restaurant, activity
  name            TEXT,
  address         TEXT,
  nearest_station TEXT,
  url             TEXT,

  -- Accommodation
  check_in_date   DATE,
  check_in_time   TIME,
  check_out_date  DATE,

  -- Restaurent
  reservation_date DATE,
  reservation_time TIME,

  -- Activity
  schedule_date   DATE,
  schedule_time   TIME,

  -- Link
  link_title      TEXT,
  link_url        TEXT,
  related_date    DATE,

  -- Memo
  note            TEXT
);

-- updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
