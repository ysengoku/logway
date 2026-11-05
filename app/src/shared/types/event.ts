export type EventType = 'flight' | 'transport' | 'hotel' | 'restaurant' | 'activity' | 'link';

export type TransportMode = 'train' | 'bus' | 'ferry' | 'car' | 'other';

// Field names match the columns of `events` and the type-specific detail tables.
interface EventFields {
  start_date: string;
  start_time: string | null;
  // Last day the event is shown on the calendar; differs from start_date only for hotels.
  end_date: string;
  note: string | null;
}

interface TransportFields extends EventFields {
  start_time: string;
  service_number: string | null;
  booking_ref: string | null;
  dep_place: string;
  dep_tz_id: string;
  arr_date: string;
  arr_time: string;
  arr_place: string;
  arr_tz_id: string;
}

interface PlaceFields extends EventFields {
  name: string;
  address: string | null;
  url: string | null;
}

export interface FlightEventInput extends TransportFields {
  type: 'flight';
  mode: 'flight';
  service_number: string;
}

export interface TransportEventInput extends TransportFields {
  type: 'transport';
  mode: TransportMode;
}

export interface HotelEventInput extends PlaceFields {
  type: 'hotel';
  booking_ref: string | null;
  check_out_time: string | null;
}

export interface RestaurantEventInput extends PlaceFields {
  type: 'restaurant';
  start_time: string;
}

export interface ActivityEventInput extends PlaceFields {
  type: 'activity';
}

export interface LinkEventInput extends EventFields {
  type: 'link';
  title: string;
  url: string;
}

// What a form submits.
export type EventInput =
  | FlightEventInput
  | TransportEventInput
  | HotelEventInput
  | RestaurantEventInput
  | ActivityEventInput
  | LinkEventInput;

export type TripEvent = EventInput & {
  id: string;
  trip_id: string;
  created_at: string;
  updated_at: string;
};

export type EventOfType<T extends EventType> = Extract<TripEvent, { type: T }>;
