<template>
  <div class="container mx-auto px-4 py-6 sm:py-8">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header Section -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div class="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                </svg>
              </div>
              {{ $t('activity.title') }}
            </h1>
            <p class="text-gray-600 dark:text-gray-300 mt-2">
              {{ $t('activity.description') }}
            </p>
          </div>
          <div class="flex gap-3">
            <select 
              v-model="filterType" 
              class="form-select rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">{{ $t('activity.filters.all') }}</option>
              <option value="messages">{{ $t('activity.filters.messages') }}</option>
              <option value="friends">{{ $t('activity.filters.friends') }}</option>
              <option value="requests">{{ $t('activity.filters.requests') }}</option>
            </select>
            <select 
              v-model="timeRange" 
              class="form-select rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="today">{{ $t('activity.filters.today') }}</option>
              <option value="week">{{ $t('activity.filters.week') }}</option>
              <option value="month">{{ $t('activity.filters.month') }}</option>
              <option value="all">{{ $t('activity.filters.allTime') }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Activity List -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div class="divide-y divide-gray-100 dark:divide-gray-700">
          <div v-if="activityStore.loading" class="p-8 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p class="mt-2 text-gray-500 dark:text-gray-400">{{ $t('activity.loading') }}</p>
          </div>
          <div v-else-if="filteredActivities.length === 0" class="p-8 text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-gray-500 dark:text-gray-400">{{ $t('activity.noActivities') }}</p>
          </div>
          <div v-else>
            <div
              v-for="activity in paginatedActivities"
              :key="activity.id"
              class="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
            >
              <div class="flex items-start gap-4">
                <div class="relative">
                  <img
                    :src="activity.userPhotoURL"
                    :alt="activity.userName"
                    class="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                  />
                  <div 
                    class="absolute -bottom-1 -right-1 p-1 rounded-full bg-white dark:bg-gray-800"
                    :class="getActivityIconClass(activity.type)"
                  >
                    <component :is="getActivityIcon(activity.type)" class="w-4 h-4" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-900 dark:text-white">
                    <span class="font-semibold">{{ activity.userName }}</span>
                    <span class="text-gray-600 dark:text-gray-300">{{ activity.message }}</span>
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                    </svg>
                    {{ formatDate(activity.timestamp) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ $t('activity.showing', { from: paginationStart, to: paginationEnd, total: filteredActivities.length }) }}
            </div>
            <div class="flex gap-2">
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ $t('activity.previous') }}
              </button>
              <button
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ $t('activity.next') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useActivityStore } from '@/stores/activity'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const activityStore = useActivityStore()
const authStore = useAuthStore()
const { t } = useI18n()

const filterType = ref('all')
const timeRange = ref('all')
const currentPage = ref(1)
const itemsPerPage = 10

// Computed properties for filtering and pagination
const filteredActivities = computed(() => {
  let activities = activityStore.activities

  // Filter by type
  if (filterType.value !== 'all') {
    activities = activities.filter(activity => activity.type === filterType.value)
  }

  // Filter by time range
  const now = new Date()
  if (timeRange.value !== 'all') {
    const timeRanges = {
      today: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    }
    const cutoffTime = now.getTime() - timeRanges[timeRange.value]
    activities = activities.filter(activity => 
      activity.timestamp.toDate().getTime() > cutoffTime
    )
  }

  return activities
})

const totalPages = computed(() => 
  Math.ceil(filteredActivities.value.length / itemsPerPage)
)

const paginatedActivities = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredActivities.value.slice(start, end)
})

const paginationStart = computed(() => 
  (currentPage.value - 1) * itemsPerPage + 1
)

const paginationEnd = computed(() => 
  Math.min(currentPage.value * itemsPerPage, filteredActivities.value.length)
)

// Helper functions
const formatDate = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('default', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date.toDate())
}

const getActivityIcon = (type) => {
  const icons = {
    message: 'MessageIcon',
    friend: 'UserIcon',
    request: 'BellIcon'
  }
  return icons[type] || 'ClockIcon'
}

const getActivityIconClass = (type) => {
  const classes = {
    message: 'text-blue-600 dark:text-blue-400',
    friend: 'text-green-600 dark:text-green-400',
    request: 'text-amber-600 dark:text-amber-400'
  }
  return classes[type] || 'text-gray-600 dark:text-gray-400'
}

// Watch for filter changes
watch([filterType, timeRange], () => {
  currentPage.value = 1
})

onMounted(async () => {
  if (authStore.user?.uid) {
    await activityStore.fetchActivities(authStore.user.uid)
  }
})
</script>

<style scoped>
.form-select {
  @apply px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500;
}
</style> 