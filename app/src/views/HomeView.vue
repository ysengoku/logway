<script setup lang="ts">
import TripModal from '@/components/modals/TripModal.vue';
import { useLoadingStore } from '@/stores/loading';
import { useTripsStore } from '@/stores/trips';
import type { TripInput } from '@/shared/types/trip';
import type { Trip } from '@/shared/types/trip';
import { onMounted, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const PREVIEW_COUNT = 3;

const router = useRouter();
const tripsStore = useTripsStore();
const loadingStore = useLoadingStore();
const { d, t } = useI18n({ useScope: 'global' });
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
  showAllPast.value ? tripsStore.pastTrips : tripsStore.pastTrips.slice(0, PREVIEW_COUNT),
);

async function createTrip(input: TripInput) {
  try {
    const trip = await tripsStore.createTrip(input);
    showNewTripModal.value = false;
    router.push({ name: 'trip', params: { id: trip.id } });
  } catch (e) {
    alert(e instanceof Error ? e.message : t('common.errorOccurred'));
  }
}

function goToTrip(trip: Trip) {
  router.push({ name: 'trip', params: { id: trip.id } });
}

function formatDates(trip: Trip): string {
  return `${formatDate(trip.start_date)} → ${formatDate(trip.end_date)}`;
}

function formatDate(date: string): string {
  return d(new Date(`${date}T00:00:00`), 'short');
}
</script>

<template>
  <div class="home">
    <main class="home__main">
      <section v-if="tripsStore.error" v-show="!loadingStore.active" class="home__section">
        <h1 class="page-title">{{ $t('home.myTrips') }}</h1>
        <div class="home__state">{{ $t('home.loadFailed') }}</div>
      </section>
      <div v-else v-show="!loadingStore.active">
        <!-- Upcoming Trips -->
        <section class="home__section">
          <h1 class="page-title">{{ $t('home.myTrips') }}</h1>
          <div class="home__btn-group">
            <button class="home__new-btn button-accent" @click="showNewTripModal = true">
              {{ $t('common.newTrip') }}
            </button>
          </div>
          <div class="home__section-header">
            <h2 class="section-title">{{ $t('home.upcoming') }}</h2>
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
              {{
                showAllUpcoming
                  ? $t('home.showLess')
                  : $t('home.showAll', { count: tripsStore.upcomingTrips.length })
              }}
            </button>
          </template>
        </section>

        <!-- Past Trips -->
        <section class="home__section">
          <div class="home__section-header">
            <h2 class="section-title">{{ $t('home.past') }}</h2>
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
              {{
                showAllPast
                  ? $t('home.showLess')
                  : $t('home.showAll', { count: tripsStore.pastTrips.length })
              }}
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
    </Teleport>
  </div>
</template>
