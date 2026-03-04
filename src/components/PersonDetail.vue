<template>
  <div class="container mx-auto px-6 py-6">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-sm text-gray-500 mb-4">
      <button @click="$emit('go-dashboard')" class="hover:text-primary-600 transition-colors">Dashboard</button>
      <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <button @click="$emit('back')" class="hover:text-primary-600 transition-colors">{{ teamName }}</button>
      <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-gray-900 font-medium">{{ person.name }}</span>
    </nav>

    <!-- Person header -->
    <div class="bg-white rounded-lg border border-gray-200 p-5 mb-6">
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-900 mb-1">{{ person.name }}</h2>
          <div class="flex items-center gap-2 flex-wrap">
            <SpecialtyBadge :specialty="person.specialty" />
            <span v-if="person.manager" class="text-sm text-gray-500">
              Mgr: {{ person.manager }}
            </span>
            <span v-if="person.jiraComponent" class="text-sm text-gray-500">
              | {{ person.jiraComponent }}
            </span>
          </div>
          <div v-if="personTeams.length > 1" class="mt-2 flex flex-wrap gap-1">
            <span
              v-for="t in personTeams"
              :key="t.key"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
            >
              {{ t.displayName }}
            </span>
          </div>
        </div>
        <button
          @click="loadMetrics(true)"
          :disabled="isLoading"
          class="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
        >
          <svg class="h-4 w-4" :class="{ 'animate-spin': isLoading }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading && !metrics" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-700 text-sm">{{ error }}</p>
    </div>

    <!-- Metrics content -->
    <template v-else-if="metrics">
      <!-- Metric cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Issues Resolved"
          :value="metrics.resolved.count"
          :subtitle="`Last ${metrics.lookbackDays} days`"
        />
        <MetricCard
          label="Story Points"
          :value="metrics.resolved.storyPoints"
          unit="pts"
          :subtitle="`Last ${metrics.lookbackDays} days`"
        />
        <MetricCard
          label="In Progress"
          :value="metrics.inProgress.count"
          :warning="metrics.inProgress.count > 5"
        />
        <MetricCard
          label="Avg Cycle Time"
          :value="metrics.cycleTime.avgDays"
          unit="days"
          :subtitle="metrics.cycleTime.medianDays != null ? `Median: ${metrics.cycleTime.medianDays}d` : ''"
        />
      </div>

      <!-- Fetched timestamp -->
      <p v-if="metrics.fetchedAt" class="text-xs text-gray-400 mb-4">
        Data fetched: {{ new Date(metrics.fetchedAt).toLocaleString() }}
      </p>

      <!-- Resolved Issues Table -->
      <div v-if="metrics.resolved.issues.length > 0" class="bg-white rounded-lg border border-gray-200 mb-6">
        <h3 class="px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
          Resolved Issues ({{ metrics.resolved.issues.length }})
          <span class="font-normal text-gray-400 ml-1">— last {{ metrics.lookbackDays }} days</span>
        </h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Summary</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cycle Time</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Resolved</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="issue in metrics.resolved.issues" :key="issue.key" class="hover:bg-gray-50">
                <td class="px-4 py-2 text-sm">
                  <a
                    :href="`https://issues.redhat.com/browse/${issue.key}`"
                    target="_blank"
                    class="text-primary-600 hover:underline"
                  >
                    {{ issue.key }}
                  </a>
                </td>
                <td class="px-4 py-2 text-sm text-gray-900 max-w-md truncate">{{ issue.summary }}</td>
                <td class="px-4 py-2 text-sm text-gray-500">{{ issue.issueType }}</td>
                <td class="px-4 py-2 text-sm text-gray-500">{{ issue.storyPoints || '—' }}</td>
                <td class="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">
                  {{ issue.cycleTimeDays != null ? `${Math.round(issue.cycleTimeDays)}d` : '—' }}
                </td>
                <td class="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">
                  {{ issue.resolutionDate ? new Date(issue.resolutionDate).toLocaleDateString() : '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- In-Progress Issues Table -->
      <div v-if="metrics.inProgress.issues.length > 0" class="bg-white rounded-lg border border-gray-200">
        <h3 class="px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
          In Progress ({{ metrics.inProgress.issues.length }})
        </h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Summary</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="issue in metrics.inProgress.issues" :key="issue.key" class="hover:bg-gray-50">
                <td class="px-4 py-2 text-sm">
                  <a
                    :href="`https://issues.redhat.com/browse/${issue.key}`"
                    target="_blank"
                    class="text-primary-600 hover:underline"
                  >
                    {{ issue.key }}
                  </a>
                </td>
                <td class="px-4 py-2 text-sm text-gray-900 max-w-md truncate">{{ issue.summary }}</td>
                <td class="px-4 py-2 text-sm text-gray-500">{{ issue.issueType }}</td>
                <td class="px-4 py-2 text-sm text-gray-500">{{ issue.status }}</td>
                <td class="px-4 py-2 text-sm text-gray-500">{{ issue.storyPoints || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SpecialtyBadge from './SpecialtyBadge.vue'
import MetricCard from './MetricCard.vue'
import { useRoster } from '../composables/useRoster'
import { getPersonMetrics } from '../services/api'

const props = defineProps({
  person: { type: Object, required: true },
  teamName: { type: String, default: '' }
})
defineEmits(['back', 'go-dashboard'])

const { getTeamsForPerson } = useRoster()

const metrics = ref(null)
const isLoading = ref(false)
const error = ref(null)

const personTeams = getTeamsForPerson(props.person.jiraDisplayName)

async function loadMetrics(refresh = false) {
  isLoading.value = true
  error.value = null
  try {
    metrics.value = await getPersonMetrics(props.person.jiraDisplayName, { refresh })
  } catch (err) {
    error.value = err.message
    console.error('Failed to load person metrics:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => loadMetrics())
</script>
