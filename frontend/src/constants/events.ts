import type { EventType } from '@shared/types/event';

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
  { type: EVENT_TYPE.ACTIVITY, icon: 'beach_access', label: 'Activity' },
  { type: EVENT_TYPE.LINK, icon: 'devices', label: 'Link' },
];