// Base
export type EventType =
  | 'flight'
  | 'transport'
  | 'hotel'
  | 'restaurant'
  | 'activity'
  | 'link'

export type TransportMode = 'train' | 'bus' | 'ferry' | 'car' | 'other'

export interface BaseEvent {
  id: string
  type: EventType
  trip_id?: string
  created_at: string
  updated_at: string
  note?: string
}

// Flight
export interface FlightLeg {
  place?: string
  tz_id?: string
  local_date?: string   // YYYY-MM-DD
  local_time?: string   // HH:MM
  utc?: string          // ISO8601
}

export interface FlightEvent extends BaseEvent {
  type: 'flight'
  flight_number: string
  booking_ref?: string
  departure: FlightLeg
  arrival: FlightLeg
}

// Transport
export interface TransportEvent extends BaseEvent {
  type: 'transport'
  transport_mode: TransportMode
  service_number?: string
  booking_ref?: string
  departure: FlightLeg
  arrival: FlightLeg
}

// Hotel
export interface HotelEvent extends BaseEvent {
  type: 'hotel'
  name: string
  booking_ref?: string
  address?: string
  nearest_station?: string
  url?: string
  check_in_date: string
  check_in_time?: string
  check_out_date?: string
}

// Restaurant
export interface RestaurantEvent extends BaseEvent {
  type: 'restaurant'
  name: string
  address?: string
  nearest_station?: string
  url?: string
  reservation_date: string
  reservation_time: string
}

// Activity
export interface ActivityEvent extends BaseEvent {
  type: 'activity'
  name: string
  address?: string
  nearest_station?: string
  url?: string
  schedule_date: string
  schedule_time?: string
}

// Link
export interface LinkEvent extends BaseEvent {
  type: 'link'
  link_title: string
  link_url: string
  related_date?: string
}

// Union
export type TripEvent =
  | FlightEvent
  | TransportEvent
  | HotelEvent
  | RestaurantEvent
  | ActivityEvent
  | LinkEvent

// DB row (flat, as stored in Supabase)
export interface EventRow {
  id: string
  type: EventType
  trip_id?: string
  created_at: string
  updated_at: string
  note?: string

  flight_number?: string
  service_number?: string
  transport_mode?: TransportMode
  booking_ref?: string

  dep_place?: string
  dep_tz_id?: string
  dep_local_date?: string
  dep_local_time?: string
  dep_utc?: string

  arr_place?: string
  arr_tz_id?: string
  arr_local_date?: string
  arr_local_time?: string
  arr_utc?: string

  name?: string
  address?: string
  nearest_station?: string
  url?: string

  check_in_date?: string
  check_in_time?: string
  check_out_date?: string

  reservation_date?: string
  reservation_time?: string

  schedule_date?: string
  schedule_time?: string

  link_title?: string
  link_url?: string
  related_date?: string
}
