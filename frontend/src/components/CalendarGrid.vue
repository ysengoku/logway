<script setup lang="ts">
import AppIcon from './AppIcon.vue';
import { ref, computed } from 'vue';
import { useEventsStore } from '@/stores/events';

const props = defineProps<{
  selectedDate: string | null;
  initialDate?: string;
  startDate?: string;
  endDate?: string;
}>();
const emit = defineEmits<{
  selectDate: [date: string];
}>();

const eventsStore = useEventsStore();

// Initialize calendar to initialDate if provided, otherwise today
const today = new Date();
const initialD = props.initialDate ? new Date(props.initialDate) : today;
const currentYear = ref(initialD.getFullYear());
const currentMonth = ref(initialD.getMonth());

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
    eventTypes: string[];
  }> = [];

  for (let i = 0; i < firstDow; i++) {
    days.push({ date: null, day: null, isToday: false, isSelected: false, isInTrip: false, isOutOfTrip: false, eventTypes: [] });
  }

  for (let d = 1; d <= lastDay; d++) {
    const date = dateStr(year, month + 1, d);
    const events = eventsStore.getByDate(date);
    const types = [...new Set(events.map((e) => e.type))].slice(0, 4);

    const isInTrip =
      (!props.startDate || date >= props.startDate) &&
      (!props.endDate || date <= props.endDate);

    const isOutOfTrip = !!(props.startDate || props.endDate) && !isInTrip;

    days.push({
      date,
      day: d,
      isToday:
        d === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear(),
      isSelected: date === props.selectedDate,
      isInTrip,
      isOutOfTrip,
      eventTypes: types,
    });
  }

  return days;
});
</script>

<template>
  <div class="calendar-grid">
    <div class="calendar-grid__nav">
      <button class="calendar-grid__arrow" @click="prevMonth">
        <AppIcon name="arrow_back" :size="20" />
      </button>
      <span class="calendar-grid__month">
        {{ MONTHS[currentMonth] }} {{ currentYear }}
      </span>
      <button class="calendar-grid__arrow" @click="nextMonth">
        <AppIcon name="arrow_forward" :size="20" />
      </button>
    </div>

    <div class="calendar-grid__dow">
      <span v-for="d in DAYS" :key="d">{{ d }}</span>
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
          'calendar-grid__cell--has-events': cell.eventTypes.length > 0,
          'calendar-grid__cell--in-trip': cell.isInTrip,
          'calendar-grid__cell--out-of-trip': cell.isOutOfTrip,
        }"
        @click="cell.date && !cell.isOutOfTrip && emit('selectDate', cell.date)"
      >
        <span v-if="cell.day" class="calendar-grid__day-num">{{ cell.day }}</span>
        <div v-if="cell.eventTypes.length" class="calendar-grid__dots">
          <span
            v-for="type in cell.eventTypes"
            :key="type"
            class="calendar-grid__dot"
            :class="`calendar-grid__dot--${type}`"
          />
        </div>
      </div>
    </div>
  </div>
</template>
