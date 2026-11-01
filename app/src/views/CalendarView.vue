<script setup lang="ts">
import { ref } from 'vue';
import CalendarGrid from '@/components/CalendarGrid.vue';
import DayDetail from '@/components/DayDetail.vue';
import EventModal from '@/components/modals/EventModal.vue';
import type { EventRow } from '@/shared/types/event';

const selectedDate = ref<string | null>(null);
const modalOpen = ref(false);
const modalDate = ref<string | undefined>();
const modalEvent = ref<EventRow | undefined>();

function onSelectDate(date: string) {
  selectedDate.value = date;
}

function onAddEvent(date: string) {
  modalDate.value = date;
  modalEvent.value = undefined;
  modalOpen.value = true;
}

function onEditEvent(event: EventRow) {
  modalDate.value = undefined;
  modalEvent.value = event;
  modalOpen.value = true;
}

function onModalClose() {
  modalOpen.value = false;
}

function onModalSaved() {
  modalOpen.value = false;
}
</script>

<template>
  <div class="calendar-view">
    <aside class="calendar-view__sidebar">
      <CalendarGrid :selected-date="selectedDate" @select-date="onSelectDate" />
    </aside>
    <main class="calendar-view__detail">
      <div v-if="!selectedDate" class="calendar-view__empty">
        {{ $t('calendar.selectDate') }}
      </div>
      <DayDetail v-else :date="selectedDate" @add-event="onAddEvent" @edit-event="onEditEvent" />
    </main>

    <EventModal
      :open="modalOpen"
      :date="modalDate"
      :event="modalEvent"
      @close="onModalClose"
      @saved="onModalSaved"
    />
  </div>
</template>
