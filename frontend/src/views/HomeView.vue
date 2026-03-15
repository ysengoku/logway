<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTripsStore } from '@/stores/trips';
import { ApiError } from '@/api/client';
import { JOIN_TRIP_ALREADY_JOINED_MESSAGE } from '@/constants/messages';
import { ERROR_CODE_ALREADY_JOINED } from '@shared/constants/errorCodes';
import type { TripInput } from '@shared/types/trip';
import type { Trip } from '@shared/types/trip';
import NewTripForm from '@/components/NewTripForm.vue';
import JoinTripForm from '@/components/JoinTripForm.vue';
import AppModal from '@/components/AppModal.vue';

const PREVIEW_COUNT = 3;

const router = useRouter();
const tripsStore = useTripsStore();
const showNewTripModal = ref(false);
const showJoinTripModal = ref(false);
const joinTripMessage = ref<string | null>(null);
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

async function joinTrip(inviteCode: string) {
  joinTripMessage.value = null;
  try {
    const trip = await tripsStore.joinTrip(inviteCode);
    showJoinTripModal.value = false;
    router.push({ name: 'trip', params: { id: trip.id } });
  } catch (error) {
    if (error instanceof ApiError && error.code === ERROR_CODE_ALREADY_JOINED) {
      joinTripMessage.value = JOIN_TRIP_ALREADY_JOINED_MESSAGE;
      return;
    }
    throw error;
  }
}

function openJoinTripModal() {
  joinTripMessage.value = null;
  showJoinTripModal.value = true;
}

function closeJoinTripModal() {
  joinTripMessage.value = null;
  showJoinTripModal.value = false;
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
          <h1 class="home__title">My Trips</h1>
          <div class="home__btn-group">
            <button class="home__new-btn button-accent" @click="showNewTripModal = true">
              + New Trip
            </button>
            <button class="button-secondary2" @click="openJoinTripModal">
              Join Trip
            </button>
          </div>
          <div class="home__section-header">
            <h2 class="home__section-title">Upcoming Trips</h2>
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

    <!-- New Trip / Join Trip Modals -->
    <Teleport to="body">
      <AppModal :open="showNewTripModal" title="New Trip" @close="showNewTripModal = false">
        <NewTripForm @submit="createTrip" @cancel="showNewTripModal = false" />
      </AppModal>

      <AppModal :open="showJoinTripModal" title="Join Trip" @close="closeJoinTripModal">
        <JoinTripForm :message="joinTripMessage" @submit="joinTrip" @cancel="closeJoinTripModal" />
      </AppModal>
    </Teleport>
  </div>
</template>
