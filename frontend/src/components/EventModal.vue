<script setup lang="ts">
import { ref, watch } from 'vue';
import type { EventRow, EventType } from '@shared/types/event';
import { useEventsStore } from '@/stores/events';
import FlightForm from '@/components/forms/FlightForm.vue';
import TransportForm from '@/components/forms/TransportForm.vue';
import HotelForm from '@/components/forms/HotelForm.vue';
import RestaurantForm from '@/components/forms/RestaurantForm.vue';
import ActivityForm from '@/components/forms/ActivityForm.vue';
import LinkForm from '@/components/forms/LinkForm.vue';

const props = defineProps<{
  open: boolean;
  date?: string;
  event?: EventRow;
}>();

const emit = defineEmits<{
  close: [];
  saved: [event: EventRow];
}>();

const eventsStore = useEventsStore();

const EVENT_TYPES: { type: EventType; icon: string; label: string }[] = [
  { type: 'flight',     icon: '✈️', label: 'Flight' },
  { type: 'transport',  icon: '🚆', label: 'Transport' },
  { type: 'hotel',      icon: '🏨', label: 'Hotel' },
  { type: 'restaurant', icon: '🍽', label: 'Restaurant' },
  { type: 'activity',   icon: '🎯', label: 'Activity' },
  { type: 'link',       icon: '🔗', label: 'Link' },
];

const selectedType = ref<EventType>('flight');
const isEditing = ref(false);
const saving = ref(false);

const formRef = ref<{ submit: () => void } | null>(null);

watch(
  () => props.open,
  (val) => {
    if (val) {
      isEditing.value = !!props.event;
      selectedType.value = props.event?.type ?? 'flight';
    }
  },
);

async function onFormSubmit(data: Partial<EventRow>) {
  saving.value = true;
  try {
    let saved: EventRow;
    if (isEditing.value && props.event) {
      saved = await eventsStore.updateEvent(props.event.id, data);
    } else {
      saved = await eventsStore.createEvent(data);
    }
    emit('saved', saved);
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to save event.');
  } finally {
    saving.value = false;
  }
}

function onSaveClick() {
  formRef.value?.submit();
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="event-modal__overlay" @click.self="emit('close')">
      <div class="event-modal">
        <div class="event-modal__title">
          {{ isEditing ? 'Edit Event' : 'Add Event' }}
        </div>

        <div v-if="!isEditing" class="event-modal__type-grid">
          <button
            v-for="t in EVENT_TYPES"
            :key="t.type"
            class="event-modal__type-opt"
            :class="{ 'event-modal__type-opt--selected': selectedType === t.type }"
            @click="selectedType = t.type"
          >
            <span>{{ t.icon }}</span>
            <span>{{ t.label }}</span>
          </button>
        </div>

        <FlightForm
          v-if="selectedType === 'flight'"
          ref="formRef"
          :initial="event"
          :default-date="date"
          @submit="onFormSubmit"
        />
        <TransportForm
          v-else-if="selectedType === 'transport'"
          ref="formRef"
          :initial="event"
          :default-date="date"
          @submit="onFormSubmit"
        />
        <HotelForm
          v-else-if="selectedType === 'hotel'"
          ref="formRef"
          :initial="event"
          :default-date="date"
          @submit="onFormSubmit"
        />
        <RestaurantForm
          v-else-if="selectedType === 'restaurant'"
          ref="formRef"
          :initial="event"
          :default-date="date"
          @submit="onFormSubmit"
        />
        <ActivityForm
          v-else-if="selectedType === 'activity'"
          ref="formRef"
          :initial="event"
          :default-date="date"
          @submit="onFormSubmit"
        />
        <LinkForm
          v-else-if="selectedType === 'link'"
          ref="formRef"
          :initial="event"
          :default-date="date"
          @submit="onFormSubmit"
        />

        <div class="event-modal__actions">
          <button class="event-modal__btn" @click="emit('close')">Cancel</button>
          <button
            class="event-modal__btn event-modal__btn--primary"
            :disabled="saving"
            @click="onSaveClick"
          >
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
