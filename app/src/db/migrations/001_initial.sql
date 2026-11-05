CREATE TABLE trips (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  start_date    TEXT NOT NULL,
  end_date      TEXT NOT NULL,
  share_file_id TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  CHECK (end_date >= start_date)
);

CREATE TABLE events (
  id         TEXT PRIMARY KEY,
  trip_id    TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('flight','transport','hotel','restaurant','activity','link')),
  start_date TEXT NOT NULL,
  start_time TEXT,
  end_date   TEXT NOT NULL,
  note       TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (end_date >= start_date),
  CHECK (type NOT IN ('flight','transport','restaurant') OR start_time IS NOT NULL),
  CHECK (type <> 'hotel' OR end_date > start_date)
);

CREATE TABLE transport_events (
  event_id       TEXT PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  mode           TEXT NOT NULL CHECK (mode IN ('flight', 'train','bus','ferry','car','other')),
  service_number TEXT,
  booking_ref    TEXT,
  dep_place      TEXT NOT NULL,
  dep_tz_id      TEXT NOT NULL,
  arr_date       TEXT NOT NULL,
  arr_place      TEXT NOT NULL,
  arr_tz_id      TEXT NOT NULL,
  arr_time       TEXT NOT NULL,
  CHECK(mode <> 'flight' OR service_number IS NOT NULL)
);

CREATE TABLE hotel_events (
  event_id       TEXT PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  booking_ref    TEXT,
  address        TEXT,
  check_out_time TEXT,
  url            TEXT
);

CREATE TABLE place_events (
  event_id TEXT PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  name     TEXT NOT NULL,
  address  TEXT,
  url      TEXT
);

CREATE TABLE link_events (
  event_id TEXT PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  title    TEXT NOT NULL,
  url      TEXT NOT NULL
);

CREATE INDEX events_trip_id ON events(trip_id, start_date, start_time);

CREATE VIEW event_details AS
SELECT
  e.*,
  t.mode,
  t.service_number,
  t.dep_place,
  t.dep_tz_id,
  t.arr_date,
  t.arr_time,
  t.arr_place,
  t.arr_tz_id,
  h.check_out_time,
  l.title,
  COALESCE(t.booking_ref, h.booking_ref) AS booking_ref,
  COALESCE(h.name, p.name) AS name,
  COALESCE(h.address, p.address) AS address,
  COALESCE(h.url, p.url, l.url) AS url
FROM events e
LEFT JOIN transport_events t ON t.event_id = e.id
LEFT JOIN hotel_events h ON h.event_id = e.id
LEFT JOIN place_events p ON p.event_id = e.id
LEFT JOIN link_events l ON l.event_id = e.id;
