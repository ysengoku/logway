import type { EventType, TransportMode } from '@shared/types/event';

export const EVENT_TYPE = {
  FLIGHT: 'flight',
  TRANSPORT: 'transport',
  HOTEL: 'hotel',
  RESTAURANT: 'restaurant',
  ACTIVITY: 'activity',
  LINK: 'link',
} as const satisfies Record<string, EventType>;

export const EVENT_TYPE_OPTIONS: { type: EventType; icon: string; label: string }[] = [
  { type: EVENT_TYPE.FLIGHT, icon: 'flight_takeoff', label: 'Flight' },
  { type: EVENT_TYPE.TRANSPORT, icon: 'train', label: 'Transport' },
  { type: EVENT_TYPE.HOTEL, icon: 'hotel', label: 'Hotel' },
  { type: EVENT_TYPE.RESTAURANT, icon: 'restaurant', label: 'Restaurant' },
  { type: EVENT_TYPE.ACTIVITY, icon: 'beach', label: 'Activity' },
  { type: EVENT_TYPE.LINK, icon: 'devices', label: 'Link' },
];

export const TRANSPORT_MODES: { value: TransportMode; label: string; icon: string }[] = [
  { value: 'train', label: 'Train', icon: 'train' },
  { value: 'bus',   label: 'Bus', icon: 'bus' },
  { value: 'ferry', label: 'Ferry', icon: 'boat' },
  { value: 'car',   label: 'Car', icon: 'car' },
  { value: 'other', label: 'Other', icon: 'mode_of_travel' },
];
