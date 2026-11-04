<script setup lang="ts">
import { EVENT_TYPE_OPTIONS } from '@/constants/events';
import { getFaIcon } from '@/lib/faIcons';
import { useEventsStore } from '@/stores/events';
import ActivityForm from '@/components/forms/ActivityForm.vue';
import AppModal from '@/components/AppModal.vue';
import FlightForm from '@/components/forms/FlightForm.vue';
import HotelForm from '@/components/forms/HotelForm.vue';
import LinkForm from '@/components/forms/LinkForm.vue';
import RestaurantForm from '@/components/forms/RestaurantForm.vue';
import TransportForm from '@/components/forms/TransportForm.vue';
import type { EventInput, EventType, TripEvent } from '@/shared/types/event';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  open: boolean;
  date?: string;
  event?: TripEvent;
  tripId: string;
}>();

const emit = defineEmits<{
  close: [];
  saved: [];
}>();

const eventsStore = useEventsStore();

const selectedType = ref<EventType>('flight');
const isEditing = ref(false);
const saving = ref(false);

const formRef = ref<{ submit: () => void } | null>(null);
const { t } = useI18n();

watch(
  () => props.open,
  (val) => {
    if (val) {
      isEditing.value = !!props.event;
      selectedType.value = props.event?.type ?? 'flight';
    }
  },
);

async function onFormSubmit(data: EventInput) {
  saving.value = true;
  try {
    if (isEditing.value && props.event) {
      await eventsStore.updateEvent(props.event.id, data);
    } else {
      await eventsStore.createEvent(props.tripId, data);
    }
    emit('saved');
  } catch (e) {
    alert(e instanceof Error ? e.message : t('common.failedToSaveEvent'));
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
    <AppModal
      :open="open"
      :title="isEditing ? $t('common.edit') + ' ' + $t('event.event') : $t('event.addEvent')"
      overlay-class="event-modal__overlay"
      modal-class="event-modal"
      title-class="event-modal__title"
      @close="emit('close')"
    >
      <div v-if="!isEditing" class="event-modal__type-grid">
        <button
          v-for="t in EVENT_TYPE_OPTIONS"
          :key="t.type"
          class="event-modal__type-opt"
          :class="{ 'event-modal__type-opt--selected': selectedType === t.type }"
          @click="selectedType = t.type"
        >
          <FaIcon :icon="getFaIcon(t.icon)" />
          <span>{{ t.label }}</span>
        </button>
      </div>

      <FlightForm
        v-if="selectedType === 'flight'"
        ref="formRef"
        :initial="event?.type === 'flight' ? event : undefined"
        :default-date="date"
        @submit="onFormSubmit"
      />
      <TransportForm
        v-else-if="selectedType === 'transport'"
        ref="formRef"
        :initial="event?.type === 'transport' ? event : undefined"
        :default-date="date"
        @submit="onFormSubmit"
      />
      <HotelForm
        v-else-if="selectedType === 'hotel'"
        ref="formRef"
        :initial="event?.type === 'hotel' ? event : undefined"
        :default-date="date"
        @submit="onFormSubmit"
      />
      <RestaurantForm
        v-else-if="selectedType === 'restaurant'"
        ref="formRef"
        :initial="event?.type === 'restaurant' ? event : undefined"
        :default-date="date"
        @submit="onFormSubmit"
      />
      <ActivityForm
        v-else-if="selectedType === 'activity'"
        ref="formRef"
        :initial="event?.type === 'activity' ? event : undefined"
        :default-date="date"
        @submit="onFormSubmit"
      />
      <LinkForm
        v-else-if="selectedType === 'link'"
        ref="formRef"
        :initial="event?.type === 'link' ? event : undefined"
        :default-date="date"
        @submit="onFormSubmit"
      />

      <div class="event-modal__actions">
        <button class="button-secondary" @click="emit('close')">{{ $t('common.cancel') }}</button>
        <button class="button-primary" :disabled="saving" @click="onSaveClick">
          {{ saving ? $t('common.saving') : $t('common.save') }}
        </button>
      </div>
    </AppModal>
  </Teleport>
</template>
