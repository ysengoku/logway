<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTripsStore } from '@/stores/trips';
import type { TripInput } from '@shared/types/trip';
import type { Trip } from '@shared/types/trip';
import NewTripForm from '@/components/NewTripForm.vue';

const PREVIEW_COUNT = 3;

const router = useRouter();
const tripsStore = useTripsStore();
const showNewTripModal = ref(false);
const showAllUpcoming = ref(false);
const showAllPast = ref(false);

onMounted(async () => {
  await tripsStore.fetchAll();
});

const visibleUpcoming = computed(() =>
  showAllUpcoming.value
    ? tripsStore.upcomingTrips
    : tripsStore.upcomingTrips.slice(0, PREVIEW_COUNT),
);

const visiblePast = computed(() =>
  showAllPast.value
    ? tripsStore.pastTrips
    : tripsStore.pastTrips.slice(0, PREVIEW_COUNT),
);

async function createTrip(input: TripInput) {
  const trip = await tripsStore.createTrip(input);
  showNewTripModal.value = false;
  router.push({ name: 'trip', params: { id: trip.id } });
}

function goToTrip(trip: Trip) {
  router.push({ name: 'trip', params: { id: trip.id } });
}

function formatDates(trip: Trip): string {
  if (!trip.start_date && !trip.end_date) return '';
  if (trip.start_date && trip.end_date) return `${trip.start_date} → ${trip.end_date}`;
  return trip.start_date ?? trip.end_date ?? '';
}
</script>

<template>
  <div class="home">
    <main class="home__main">
      <div v-if="tripsStore.loading" class="home__state">
        Loading...
      </div>

      <template v-else>
        <!-- Upcoming Trips -->
        <section class="home__section">
          <div class="home__section-header">
            <h2 class="home__section-title">Upcoming Trips</h2>
            <button class="home__new-btn" @click="showNewTripModal = true">
              + New Trip
            </button>
          </div>
          <div v-if="tripsStore.upcomingTrips.length === 0" class="home__state">
            No upcoming trips. Plan your next adventure!
          </div>
          <template v-else>
            <div class="home__trips">
              <div
                v-for="trip in visibleUpcoming"
                :key="trip.id"
                class="home__trip-card"
                @click="goToTrip(trip)"
              >
                <div class="home__trip-title">{{ trip.title }}</div>
                <div class="home__trip-dates">{{ formatDates(trip) }}</div>
              </div>
            </div>
            <button
              v-if="tripsStore.upcomingTrips.length > PREVIEW_COUNT"
              class="home__show-more"
              @click="showAllUpcoming = !showAllUpcoming"
            >
              {{ showAllUpcoming ? 'Show less' : `Show all (${tripsStore.upcomingTrips.length})` }}
            </button>
          </template>
        </section>

        <!-- Past Trips -->
        <section class="home__section">
          <div class="home__section-header">
            <h2 class="home__section-title">Past Trips</h2>
          </div>
          <div v-if="tripsStore.pastTrips.length === 0" class="home__state">
            No past trips yet.
          </div>
          <template v-else>
            <div class="home__trips">
              <div
                v-for="trip in visiblePast"
                :key="trip.id"
                class="home__trip-card home__trip-card--past"
                @click="goToTrip(trip)"
              >
                <div class="home__trip-title">{{ trip.title }}</div>
                <div class="home__trip-dates">{{ formatDates(trip) }}</div>
              </div>
            </div>
            <button
              v-if="tripsStore.pastTrips.length > PREVIEW_COUNT"
              class="home__show-more"
              @click="showAllPast = !showAllPast"
            >
              {{ showAllPast ? 'Show less' : `Show all (${tripsStore.pastTrips.length})` }}
            </button>
          </template>
        </section>
      </template>
    </main>

    <!-- New Trip Modal -->
    <Teleport to="body">
      <div v-if="showNewTripModal" class="new-trip-modal__overlay" @click.self="showNewTripModal = false">
        <div class="new-trip-modal">
          <div class="new-trip-modal__title">New Trip</div>
          <NewTripForm @submit="createTrip" @cancel="showNewTripModal = false" />
        </div>
      </div>
    </Teleport>
  </div>
</template>
