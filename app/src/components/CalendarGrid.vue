<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useEventsStore } from '@/stores/events';
import { useTripsStore } from '@/stores/trips';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  selectedDate: string | null;
  startDate?: string;
  endDate?: string;
}>();
const emit = defineEmits<{
  selectDate: [date: string];
}>();

const eventsStore = useEventsStore();
const { locale } = useI18n({ useScope: 'global' });

// Initialize calendar to initialDate if provided, otherwise try trip start date, fallback to today
const today = new Date();
const currentYear = ref(today.getFullYear());
const currentMonth = ref(today.getMonth());

const route = useRoute();
const tripsStore = useTripsStore();

function initFromDateString(dateString?: string) {
  if (!dateString) return;
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    currentYear.value = date.getFullYear();
    currentMonth.value = date.getMonth();
  }
}

onMounted(async () => {
  // Priority: props.startDate -> trip.start_date (fetched by route id) -> today
  if (props.startDate) {
    initFromDateString(props.startDate);
    return;
  }

  const tripId = route.params.id as string | undefined;
  if (tripId) {
    if (tripsStore.trips.length === 0) await tripsStore.fetchAll();
    const trip = tripsStore.trips.find((t) => t.id === tripId);
    if (trip) initFromDateString(trip.start_date);
  }
});

const monthLabel = computed(() => {
  const formatter = new Intl.DateTimeFormat(locale.value, {
    month: 'long',
    year: 'numeric',
  });
  return formatter.format(new Date(currentYear.value, currentMonth.value, 1));
});

const dayLabels = computed(() => {
  const formatter = new Intl.DateTimeFormat(locale.value, {
    weekday: 'short',
    timeZone: 'UTC',
  });
  // 2024-01-07 is Sunday in UTC; keep Sunday-first calendar layout.
  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(new Date(Date.UTC(2024, 0, 7 + index))),
  );
});

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
}

function dateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  const firstDow = new Date(year, month, 1).getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();

  const days: Array<{
    date: string | null;
    day: number | null;
    isToday: boolean;
    isSelected: boolean;
    isInTrip: boolean;
    isOutOfTrip: boolean;
    hasEvents: boolean;
  }> = [];

  for (let i = 0; i < firstDow; i++) {
    days.push({
      date: null,
      day: null,
      isToday: false,
      isSelected: false,
      isInTrip: false,
      isOutOfTrip: false,
      hasEvents: false,
    });
  }

  for (let d = 1; d <= lastDay; d++) {
    const date = dateStr(year, month + 1, d);

    const isInTrip =
      (!props.startDate || date >= props.startDate) && (!props.endDate || date <= props.endDate);

    const isOutOfTrip = !!(props.startDate || props.endDate) && !isInTrip;

    days.push({
      date,
      day: d,
      isToday: d === today.getDate() && month === today.getMonth() && year === today.getFullYear(),
      isSelected: date === props.selectedDate,
      isInTrip,
      isOutOfTrip,
      hasEvents: eventsStore.getByDate(date).length > 0,
    });
  }

  return days;
});
</script>

<template>
  <div class="calendar-grid">
    <div class="calendar-grid__nav">
      <button class="calendar-grid__arrow" @click="prevMonth">
        <FaIcon icon="fa-solid fa-chevron-left" />
      </button>
      <span class="calendar-grid__month">
        {{ monthLabel }}
      </span>
      <button class="calendar-grid__arrow" @click="nextMonth">
        <FaIcon icon="fa-solid fa-chevron-right" />
      </button>
    </div>

    <div class="calendar-grid__dow">
      <span v-for="label in dayLabels" :key="label">{{ label }}</span>
    </div>

    <div class="calendar-grid__cells">
      <div
        v-for="(cell, i) in calendarDays"
        :key="i"
        class="calendar-grid__cell"
        :class="{
          'calendar-grid__cell--empty': !cell.date,
          'calendar-grid__cell--today': cell.isToday,
          'calendar-grid__cell--selected': cell.isSelected,
          'calendar-grid__cell--has-events': cell.hasEvents,
          'calendar-grid__cell--in-trip': cell.isInTrip,
          'calendar-grid__cell--out-of-trip': cell.isOutOfTrip,
        }"
        @click="cell.date && !cell.isOutOfTrip && emit('selectDate', cell.date)"
      >
        <span v-if="cell.day" class="calendar-grid__day-num">{{ cell.day }}</span>
      </div>
    </div>
  </div>
</template>
