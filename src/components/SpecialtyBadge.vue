<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
    :class="badgeClass"
  >
    {{ specialty || 'Unspecified' }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  specialty: { type: String, default: null }
})

const badgeClass = computed(() => {
  if (!props.specialty) return 'bg-gray-100 text-gray-800'
  const s = props.specialty.toLowerCase()
  if (s.includes('backend') || s.includes('engineer') && !s.includes('staff')) return 'bg-blue-100 text-blue-800'
  if (s.includes('staff')) return 'bg-purple-100 text-purple-800'
  if (s === 'qe') return 'bg-teal-100 text-teal-800'
  if (s === 'ui' || s === 'bff') return 'bg-pink-100 text-pink-800'
  if (s.includes('manager') || s.includes('operations')) return 'bg-amber-100 text-amber-800'
  if (s.includes('architect')) return 'bg-indigo-100 text-indigo-800'
  if (s.includes('agilist')) return 'bg-green-100 text-green-800'
  return 'bg-gray-100 text-gray-800'
})
</script>
