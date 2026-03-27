<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue';
import EventMetaHotel from '@/components/eventCards/EventMetaHotel.vue';
import EventMetaTransport from '@/components/eventCards/EventMetaTransport.vue';
import { EVENT_TYPE, EVENT_TYPE_OPTIONS, TRANSPORT_MODES } from '@/constants/events';
import type { EventRow } from '@shared/types/event';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  event: EventRow;
  date: string;
  mode: 'timeline' | 'type';
}>();

const emit = defineEmits<{
  edit: [event: EventRow];
  delete: [id: string];
}>();

const eventIcon = computed(() => {
  const mode = EVENT_TYPE_OPTIONS.find((eventType) => eventType.type === props.event.type);
  console.log(mode);
  if (mode?.type === EVENT_TYPE.TRANSPORT) {
    const transportMode = TRANSPORT_MODES.find((m) => m.value === props.event.transport_mode);
    return transportMode?.icon ?? '';
  }
  return mode?.icon ?? '';
});

const { t } = useI18n();

function getEventTitle(event: EventRow): string {
  switch (event.type) {
    case EVENT_TYPE.FLIGHT:
      return event.flight_number ?? t('event.type.flight');
    case EVENT_TYPE.TRANSPORT:
      return event.service_number ?? event.transport_mode ?? t('event.type.transport');
    case EVENT_TYPE.HOTEL:
      return event.name ?? t('event.type.hotel');
    case EVENT_TYPE.RESTAURANT:
      return event.name ?? t('event.type.restaurant');
    case EVENT_TYPE.ACTIVITY:
      return event.name ?? t('event.type.activity');
    case EVENT_TYPE.LINK:
      return event.link_title ?? t('event.type.link');
    default:
      return '';
  }
}

function getEventTime(event: EventRow): string | null {
  switch (event.type) {
    case EVENT_TYPE.FLIGHT:
    case EVENT_TYPE.TRANSPORT:
      return event.dep_local_time?.slice(0, 5) ?? null;
    case EVENT_TYPE.HOTEL:
      if (event.check_in_date === props.date) {
        return event.check_in_time?.slice(0, 5) ?? null;
      }
      if (event.check_out_date === props.date) {
        return event.check_out_time?.slice(0, 5) ?? null;
      }
      return null;
    case EVENT_TYPE.RESTAURANT:
      return event.reservation_time?.slice(0, 5) ?? null;
    case EVENT_TYPE.ACTIVITY:
      return event.schedule_time?.slice(0, 5) ?? null;
    default:
      return null;
  }
}
</script>

<template>
  <div
    class="day-detail__card"
    :class="`day-detail__card--${event.type}`"
  >
    <div class="day-detail__card-time">
      {{ getEventTime(event) ?? '—' }}
    </div>
    <div class="day-detail__card-content">
      <div class="day-detail__card-title">
        <AppIcon v-if="mode === 'timeline'" :name="eventIcon" class="day-detail__card-icon material-icons" />
        {{ getEventTitle(event) }}
      </div>
      <div class="day-detail__card-meta">
        <EventMetaTransport v-if="event.type === EVENT_TYPE.FLIGHT || event.type === EVENT_TYPE.TRANSPORT" 
          :event="event"
        />
        <EventMetaHotel v-else-if="event.type === EVENT_TYPE.HOTEL" 
          :event="event"
          :date="date"
        />
        <div v-if="event.address" class="day-detail__card-meta-address">
          <AppIcon name="location" :size="16" />
          {{ event.address }}
        </div>
        <div v-if="event.link_url || event.url" class="day-detail__card-meta-link">
          <a v-if="event.link_url" :href="event.link_url" target="_blank" rel="noopener">
            <span>{{ event.link_url }}</span>
            <AppIcon name="link" :size="14" />
          </a>
          <a v-else-if="event.url" :href="event.url" target="_blank" rel="noopener">
            <span>{{ event.url }}</span>
            <AppIcon name="link" :size="14" />
          </a>
        </div>
        <div v-if="event.booking_ref" class="day-detail__tag">
          {{ $t('event.ref', { ref: event.booking_ref }) }}
        </div>
        <p v-if="event.note" class="day-detail__note">
          {{ event.note }}
        </p>
      </div>
    </div>
    <div class="day-detail__card-actions">
      <button @click="emit('edit', event)">
        <AppIcon name="edit" :size="20" />
      </button>
      <button @click="emit('delete', event.id)">
        <AppIcon name="delete" :size="20" />
      </button>
    </div>
  </div>
</template>