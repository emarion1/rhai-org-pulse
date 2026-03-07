<template>
  <div
    class="bg-white rounded-lg border border-gray-200 p-5 cursor-pointer hover:border-primary-300 hover:shadow-md transition-all"
    @click="$emit('select', team)"
  >
    <div class="flex items-start justify-between mb-3">
      <h3 class="text-base font-semibold text-gray-900">{{ team.displayName }}</h3>
      <div class="flex items-center gap-2">
        <svg
          v-if="isUnassigned"
          class="h-4 w-4 text-amber-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          title="Members not yet assigned to a team"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span class="text-sm text-gray-500">{{ uniqueCount }} members</span>
      </div>
    </div>
    <div class="flex flex-wrap gap-1.5">
      <span
        v-for="(count, specialty) in specialtyBreakdown"
        :key="specialty"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
        :class="specialtyClass(specialty)"
      >
        {{ count }} {{ specialty }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  team: { type: Object, required: true }
})
defineEmits(['select'])

const uniqueMembers = computed(() => {
  const seen = new Set()
  return props.team.members.filter(m => {
    if (seen.has(m.jiraDisplayName)) return false
    seen.add(m.jiraDisplayName)
    return true
  })
})

const uniqueCount = computed(() => uniqueMembers.value.length)

const isUnassigned = computed(() => props.team.key.endsWith('::_unassigned'))

const specialtyBreakdown = computed(() => {
  const counts = {}
  for (const m of uniqueMembers.value) {
    const s = normalizeSpecialty(m.specialty)
    counts[s] = (counts[s] || 0) + 1
  }
  return counts
})

function normalizeSpecialty(s) {
  if (!s) return 'Other'
  const lower = s.toLowerCase()
  if (lower.includes('backend') || (lower.includes('engineer') && !lower.includes('staff'))) return 'Backend'
  if (lower.includes('staff')) return 'Staff'
  if (lower === 'qe') return 'QE'
  if (lower === 'ui' || lower === 'bff') return 'UI'
  if (lower.includes('manager') || lower.includes('operations')) return 'Mgmt'
  if (lower.includes('architect')) return 'Arch'
  if (lower.includes('agilist')) return 'Agile'
  return 'Other'
}

function specialtyClass(specialty) {
  switch (specialty) {
    case 'Backend': return 'bg-blue-50 text-blue-700'
    case 'Staff': return 'bg-purple-50 text-purple-700'
    case 'QE': return 'bg-teal-50 text-teal-700'
    case 'UI': return 'bg-pink-50 text-pink-700'
    case 'Mgmt': return 'bg-amber-50 text-amber-700'
    case 'Arch': return 'bg-indigo-50 text-indigo-700'
    case 'Agile': return 'bg-green-50 text-green-700'
    default: return 'bg-gray-50 text-gray-700'
  }
}
</script>
