<script setup lang="ts">
import { getFaIcon } from '@/lib/faIcons';
import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    inputId: string;
    label: string;
    placeholder?: string;
    hasError?: boolean;
    showAriaLabel?: string;
    hideAriaLabel?: string;
    autocomplete?: string;
  }>(),
  {
    placeholder: '',
    hasError: false,
    showAriaLabel: 'Show password',
    hideAriaLabel: 'Hide password',
    autocomplete: 'current-password',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'input'): void;
}>();

const isVisible = ref(false);
const inputType = computed(() => (isVisible.value ? 'text' : 'password'));
const currentAriaLabel = computed(() =>
  isVisible.value ? props.hideAriaLabel : props.showAriaLabel,
);

function handleInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  emit('update:modelValue', value);
  emit('input');
}
</script>

<template>
  <div class="form-row password-field">
    <label :for="inputId">{{ label }}</label>
    <div class="password-field__input-wrap">
      <input
        :id="inputId"
        :value="modelValue"
        :type="inputType"
        :placeholder="placeholder"
        class="password-field__input"
        :class="{ is_error: hasError }"
        :aria-invalid="hasError"
        :autocomplete="autocomplete"
        @input="handleInput"
      />
      <button
        type="button"
        class="password-field__toggle"
        :aria-label="currentAriaLabel"
        :aria-pressed="isVisible"
        @click="isVisible = !isVisible"
      >
        <FaIcon
          :icon="getFaIcon(isVisible ? 'eye-slash' : 'eye')"
          class="password-field__toggle-icon"
        />
      </button>
    </div>
  </div>
</template>

<style scoped>
.password-field__input-wrap {
  position: relative;
}

.password-field__input {
  padding-right: 2.5rem;
}

.password-field__toggle {
  position: absolute;
  top: 50%;
  right: 0.5rem;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 0;
}
</style>
