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
  { type: EVENT_TYPE.FLIGHT, icon: 'fa-plane', label: 'Flight' },
  { type: EVENT_TYPE.TRANSPORT, icon: 'fa-train', label: 'Transport' },
  { type: EVENT_TYPE.HOTEL, icon: 'fa-bed', label: 'Hotel' },
  { type: EVENT_TYPE.RESTAURANT, icon: 'fa-utensils', label: 'Restaurant' },
  { type: EVENT_TYPE.ACTIVITY, icon: 'fa-umbrella-beach', label: 'Activity' },
  { type: EVENT_TYPE.LINK, icon: 'fa-desktop', label: 'Link' },
];

export const TRANSPORT_MODES: { value: TransportMode; label: string; icon: string }[] = [
  { value: 'train', label: 'Train', icon: 'fa-train' },
  { value: 'bus',   label: 'Bus', icon: 'fa-bus' },
  { value: 'ferry', label: 'Ferry', icon: 'fa-sailboat' },
  { value: 'car',   label: 'Car', icon: 'fa-car' },
  { value: 'other', label: 'Other', icon: 'fa-cable-car' },
];
