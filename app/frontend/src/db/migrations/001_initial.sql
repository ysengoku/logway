CREATE TABLE trips (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  start_date    TEXT,
  end_date      TEXT,
  share_file_id TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE TABLE events (
  id               TEXT PRIMARY KEY,
  trip_id          TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  type             TEXT NOT NULL CHECK (type IN ('flight','transport','hotel','restaurant','activity','link')),
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL,
  flight_number    TEXT,
  service_number   TEXT,
  transport_mode   TEXT CHECK (transport_mode IN ('train','bus','ferry','car','other')),
  booking_ref      TEXT,
  dep_place        TEXT,
  dep_tz_id        TEXT,
  dep_local_date   TEXT,
  dep_local_time   TEXT,
  dep_utc          TEXT,
  arr_place        TEXT,
  arr_tz_id        TEXT,
  arr_local_date   TEXT,
  arr_local_time   TEXT,
  arr_utc          TEXT,
  name             TEXT,
  address          TEXT,
  url              TEXT,
  check_in_date    TEXT,
  check_in_time    TEXT,
  check_out_date   TEXT,
  check_out_time   TEXT,
  reservation_date TEXT,
  reservation_time TEXT,
  schedule_date    TEXT,
  schedule_time    TEXT,
  link_title       TEXT,
  link_url         TEXT,
  related_date     TEXT,
  note             TEXT
);

CREATE INDEX events_trip_id ON events(trip_id);

CREATE TABLE profile (
  id               INTEGER PRIMARY KEY CHECK (id = 1),
  display_name     TEXT NOT NULL,
  icon             TEXT NOT NULL,
  icon_color       TEXT NOT NULL,
  icon_bg_color    TEXT NOT NULL,
  preferred_locale TEXT,
  updated_at       TEXT NOT NULL
);
