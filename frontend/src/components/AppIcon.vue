<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
	name: string;
	size?: number;
	color?: string;
	label?: string;
}>(), {
	size: 24,
	color: 'currentColor',
	label: '',
});

const style = computed(() => ({
	width: `${props.size}px`,
	height: `${props.size}px`,
	backgroundColor: props.color,
	WebkitMaskImage: `url(/icons/${props.name}.svg)`,
	maskImage: `url(/icons/${props.name}.svg)`,
}));
</script>

<template>
	<span
		class="app-icon"
		:style="style"
		:aria-label="label || undefined"
		:role="label ? 'img' : undefined"
		:aria-hidden="label ? undefined : 'true'"
	/>
</template>

<style scoped lang="scss">
.app-icon {
	display: inline-block;
	flex: 0 0 auto;
	mask-repeat: no-repeat;
	mask-position: center;
	mask-size: contain;
	-webkit-mask-repeat: no-repeat;
	-webkit-mask-position: center;
	-webkit-mask-size: contain;
}
</style>
