<script setup lang="ts">
import JoinTripModal from '@/components/modals/JoinTripModal.vue';
import TripModal from '@/components/modals/TripModal.vue';
import { ApiError } from '@/api/client';
import { ERROR_CODE_ALREADY_JOINED } from '@shared/constants/errorCodes';
import { useLoadingStore } from '@/stores/loading';
import { useTripsStore } from '@/stores/trips';
import type { TripInput } from '@shared/types/trip';
import type { Trip } from '@shared/types/trip';
import { onMounted, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const PREVIEW_COUNT = 3;

const router = useRouter();
const tripsStore = useTripsStore();
const loadingStore = useLoadingStore();
const { d } = useI18n({ useScope: 'global' });
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
      joinTripMessage.value = 'form.join.alreadyJoined';
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
  if (trip.start_date && trip.end_date) return `${formatDate(trip.start_date)} → ${formatDate(trip.end_date)}`;
  return trip.start_date ? formatDate(trip.start_date) : formatDate(trip.end_date ?? '');
}

function formatDate(date: string): string {
  if (!date) return '';
  return d(new Date(`${date}T00:00:00`), 'short');
}
</script>

<template>
  <div class="home">
    <main class="home__main">
      <div v-show="!loadingStore.active">
        <!-- Upcoming Trips -->
        <section class="home__section">
          <h1 class="home__title">{{ $t('home.myTrips') }}</h1>
          <div class="home__btn-group">
            <button class="home__new-btn button-accent" @click="showNewTripModal = true">
              {{ $t('common.newTrip') }}
            </button>
            <button class="button-secondary2" @click="openJoinTripModal">
              {{ $t('common.joinTrip') }}
            </button>
          </div>
          <div class="home__section-header">
            <h2 class="home__section-title">{{ $t('home.upcoming') }}</h2>
          </div>
          <div v-if="tripsStore.upcomingTrips.length === 0" class="home__state">
            {{ $t('home.noUpcoming') }}
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
              {{ showAllUpcoming ? $t('home.showLess') : $t('home.showAll', { count: tripsStore.upcomingTrips.length }) }}
            </button>
          </template>
        </section>

        <!-- Past Trips -->
        <section class="home__section">
          <div class="home__section-header">
            <h2 class="home__section-title">{{ $t('home.past') }}</h2>
          </div>
          <div v-if="tripsStore.pastTrips.length === 0" class="home__state">
            {{ $t('home.noPast') }}
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
              {{ showAllPast ? $t('home.showLess') : $t('home.showAll', { count: tripsStore.pastTrips.length }) }}
            </button>
          </template>
        </section>
      </div>
    </main>

    <Teleport to="body">
      <TripModal
        :open="showNewTripModal"
        :title="$t('common.newTrip')"
        @close="showNewTripModal = false"
        @submit="createTrip"
      />

      <JoinTripModal
        :open="showJoinTripModal"
        :message="joinTripMessage ? $t(joinTripMessage) : null"
        @close="closeJoinTripModal"
        @submit="joinTrip"
      />
    </Teleport>
  </div>
</template>
