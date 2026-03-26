<script setup lang="ts">
import CalendarGrid from '@/components/CalendarGrid.vue';
import DayDetail from '@/components/DayDetail.vue';
import EventModal from '@/components/modals/EventModal.vue';
import TripModal from '@/components/modals/TripModal.vue';
import TripMembers from '@/components/TripMembers.vue';
import { useEventsStore } from '@/stores/events';
import { useLoadingStore } from '@/stores/loading';
import { useTripsStore } from '@/stores/trips';
import type { TripInput } from '@shared/types/trip';
import type { EventRow } from '@shared/types/event';
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const tripsStore = useTripsStore();
const eventsStore = useEventsStore();

const tripId = computed(() => route.params.id as string);
const trip = computed(() => tripsStore.trips.find((t) => t.id === tripId.value));
const selectedDate = ref<string | null>(null);
const modalOpen = ref(false);
const modalDate = ref<string | undefined>();
const modalEvent = ref<EventRow | undefined>();

const loadingStore = useLoadingStore();
const showEditModal = ref(false);

onMounted(async () => {
    await eventsStore.fetchByTrip(tripId.value);
    if (tripsStore.trips.length === 0) {
      await tripsStore.fetchAll();
    }
});

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

async function onEditTrip(input: TripInput) {
  await tripsStore.updateTrip(tripId.value, input);
  showEditModal.value = false;
}

async function deleteTrip() {
  if (!confirm(`Delete "${trip.value?.title}"? All events will also be deleted.`)) return;
  await tripsStore.deleteTrip(tripId.value);
  router.push({ name: 'home' });
}
</script>

<template>
  <div v-show="!loadingStore.active" class="trip-view">
    <header class="trip-view__header">
      <button class="trip-view__back" @click="router.push({ name: 'home' })">
        ← Back
      </button>
      <h1 class="trip-view__title">{{ trip?.title }}</h1>
      <button class="trip-view__edit-btn" @click="showEditModal = true">
        Edit
      </button>
    </header>

    <div class="trip-view__body">
      <aside class="trip-view__sidebar">
        <CalendarGrid
          :selected-date="selectedDate"
          :start-date="trip?.start_date"
          :end-date="trip?.end_date"
          @select-date="onSelectDate"
        />
      </aside>
      <main class="trip-view__detail">
        <div v-if="!selectedDate" class="trip-view__empty">
          Select a date to view or add events.
        </div>
        <DayDetail
          v-else
          :date="selectedDate"
          @add-event="onAddEvent"
          @edit-event="onEditEvent"
        />
        <TripMembers v-if="trip" :trip="trip" />
      </main>
    </div>

    <!-- Edit Trip Modal -->
    <Teleport to="body">
      <TripModal
        :open="showEditModal"
        title="Edit Trip"
        :initial="trip"
        submit-label="Save changes"
        @close="showEditModal = false"
        @submit="onEditTrip"
      />
    </Teleport>

    <footer class="trip-view__footer">
      <button class="trip-view__delete-btn" @click="deleteTrip">
        Delete this trip
      </button>
    </footer>

    <EventModal
      :open="modalOpen"
      :date="modalDate"
      :event="modalEvent"
      :trip-id="tripId"
      @close="onModalClose"
      @saved="onModalSaved"
    />
  </div>
</template>
