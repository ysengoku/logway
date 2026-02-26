<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTripsStore } from '@/stores/trips';
import type { TripInput } from '@shared/types/trip';
import NewTripForm from '@/components/NewTripForm.vue';

const router = useRouter();
const tripsStore = useTripsStore();
const showNewTripModal = ref(false);

onMounted(async () => {
  await tripsStore.fetchAll();
});

async function createTrip(input: TripInput) {
  const trip = await tripsStore.createTrip(input);
  showNewTripModal.value = false;
  router.push({ name: 'trip', params: { id: trip.id } });
}
</script>

<template>
  <div class="home">
    <header class="home__header">
      <h1 class="home__title">LogWay</h1>
      <button class="home__new-btn" @click="showNewTripModal = true">
        + New Trip
      </button>
    </header>

    <main class="home__main">
      <div v-if="tripsStore.loading" class="home__state">
        Loading...
      </div>
      <div v-else-if="tripsStore.trips.length === 0" class="home__state">
        No trips yet. Create your first trip!
      </div>
      <div v-else class="home__trips">
        <div
          v-for="trip in tripsStore.trips"
          :key="trip.id"
          class="home__trip-card"
          @click="router.push({ name: 'trip', params: { id: trip.id } })"
        >
          <div class="home__trip-title">{{ trip.title }}</div>
          <div class="home__trip-dates">
            <span v-if="trip.start_date">{{ trip.start_date }}</span>
            <span v-if="trip.start_date && trip.end_date"> → </span>
            <span v-if="trip.end_date">{{ trip.end_date }}</span>
          </div>
        </div>
      </div>
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
