<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-7xl mx-auto">
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {{ $t('admin.totalUsers') }}
          </h3>
          <p class="text-3xl font-bold text-primary-600">
            {{ stats.totalUsers }}
          </p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {{ $t('admin.activeUsers') }}
          </h3>
          <p class="text-3xl font-bold text-primary-600">
            {{ stats.activeUsers }}
          </p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {{ $t('admin.totalMessages') }}
          </h3>
          <p class="text-3xl font-bold text-primary-600">
            {{ stats.totalMessages }}
          </p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {{ $t('admin.totalChats') }}
          </h3>
          <p class="text-3xl font-bold text-primary-600">
            {{ stats.totalChats }}
          </p>
        </div>
      </div>

      <!-- User Management -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ $t('admin.userManagement') }}
            </h2>
            <div class="flex space-x-4">
              <input
                v-model="searchQuery"
                type="text"
                class="input"
                :placeholder="$t('admin.searchUsers')"
                @input="handleSearch"
              />
              <select
                v-model="userFilter"
                class="input"
                @change="handleFilter"
              >
                <option value="all">{{ $t('admin.allUsers') }}</option>
                <option value="active">{{ $t('admin.activeUsers') }}</option>
                <option value="inactive">{{ $t('admin.inactiveUsers') }}</option>
                <option value="banned">{{ $t('admin.bannedUsers') }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {{ $t('admin.user') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {{ $t('admin.status') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {{ $t('admin.role') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {{ $t('admin.lastActive') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {{ $t('admin.actions') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="user in filteredUsers" :key="user.uid">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img
                      :src="user.photoURL || 'https://via.placeholder.com/40'"
                      :alt="user.displayName"
                      class="w-10 h-10 rounded-full"
                    />
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ user.displayName }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ user.email }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-green-100 text-green-800': user.status === 'active',
                      'bg-yellow-100 text-yellow-800': user.status === 'inactive',
                      'bg-red-100 text-red-800': user.status === 'banned'
                    }"
                  >
                    {{ $t(`admin.status${user.status}`) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ $t(`admin.role${user.role}`) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(user.lastActive) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button
                      v-if="user.status !== 'banned'"
                      class="text-red-600 hover:text-red-900"
                      @click="banUser(user.uid)"
                    >
                      {{ $t('admin.ban') }}
                    </button>
                    <button
                      v-else
                      class="text-green-600 hover:text-green-900"
                      @click="unbanUser(user.uid)"
                    >
                      {{ $t('admin.unban') }}
                    </button>
                    <button
                      v-if="user.role !== 'admin'"
                      class="text-blue-600 hover:text-blue-900"
                      @click="makeAdmin(user.uid)"
                    >
                      {{ $t('admin.makeAdmin') }}
                    </button>
                    <button
                      v-else
                      class="text-yellow-600 hover:text-yellow-900"
                      @click="removeAdmin(user.uid)"
                    >
                      {{ $t('admin.removeAdmin') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ $t('admin.showing') }} {{ pagination.start }} - {{ pagination.end }} {{ $t('admin.of') }} {{ pagination.total }}
            </div>
            <div class="flex space-x-2">
              <button
                class="btn btn-secondary"
                :disabled="pagination.currentPage === 1"
                @click="changePage(pagination.currentPage - 1)"
              >
                {{ $t('admin.previous') }}
              </button>
              <button
                class="btn btn-secondary"
                :disabled="pagination.currentPage === pagination.totalPages"
                @click="changePage(pagination.currentPage + 1)"
              >
                {{ $t('admin.next') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { collection, query, where, orderBy, limit, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import Swal from 'sweetalert2'
import debounce from 'lodash/debounce'

const { t } = useI18n()

// State
const users = ref([])
const searchQuery = ref('')
const userFilter = ref('all')
const loading = ref(false)

const stats = ref({
  totalUsers: 0,
  activeUsers: 0,
  totalMessages: 0,
  totalChats: 0
})

const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
  totalPages: 1,
  start: 1,
  end: 10
})

// Computed
const filteredUsers = computed(() => {
  let filtered = users.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.displayName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  }

  // Apply status filter
  if (userFilter.value !== 'all') {
    filtered = filtered.filter(user => user.status === userFilter.value)
  }

  // Apply pagination
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize

  pagination.value.total = filtered.length
  pagination.value.totalPages = Math.ceil(filtered.length / pagination.value.pageSize)
  pagination.value.start = start + 1
  pagination.value.end = Math.min(end, filtered.length)

  return filtered.slice(start, end)
})

// Methods
const fetchUsers = async () => {
  try {
    loading.value = true
    const usersRef = collection(db, 'users')
    const q = query(usersRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    
    users.value = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: t('common.error'),
      text: error.message
    })
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const usersRef = collection(db, 'users')
    const messagesRef = collection(db, 'messages')
    const chatsRef = collection(db, 'chats')

    const [usersSnapshot, messagesSnapshot, chatsSnapshot] = await Promise.all([
      getDocs(usersRef),
      getDocs(messagesRef),
      getDocs(chatsRef)
    ])

    stats.value = {
      totalUsers: usersSnapshot.size,
      activeUsers: usersSnapshot.docs.filter(doc => doc.data().status === 'active').length,
      totalMessages: messagesSnapshot.size,
      totalChats: chatsSnapshot.size
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: t('common.error'),
      text: error.message
    })
  }
}

const handleSearch = debounce(() => {
  pagination.value.currentPage = 1
}, 300)

const handleFilter = () => {
  pagination.value.currentPage = 1
}

const changePage = (page) => {
  pagination.value.currentPage = page
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('default', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date.toDate())
}

const banUser = async (uid) => {
  const result = await Swal.fire({
    title: t('admin.banUser'),
    text: t('admin.banUserConfirm'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel')
  })

  if (result.isConfirmed) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        status: 'banned',
        updatedAt: new Date()
      })
      await fetchUsers()
      Swal.fire({
        icon: 'success',
        title: t('admin.userBanned'),
        text: t('admin.userBannedMessage')
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('common.error'),
        text: error.message
      })
    }
  }
}

const unbanUser = async (uid) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      status: 'active',
      updatedAt: new Date()
    })
    await fetchUsers()
    Swal.fire({
      icon: 'success',
      title: t('admin.userUnbanned'),
      text: t('admin.userUnbannedMessage')
    })
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: t('common.error'),
      text: error.message
    })
  }
}

const makeAdmin = async (uid) => {
  const result = await Swal.fire({
    title: t('admin.makeAdmin'),
    text: t('admin.makeAdminConfirm'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel')
  })

  if (result.isConfirmed) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        role: 'admin',
        updatedAt: new Date()
      })
      await fetchUsers()
      Swal.fire({
        icon: 'success',
        title: t('admin.adminGranted'),
        text: t('admin.adminGrantedMessage')
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('common.error'),
        text: error.message
      })
    }
  }
}

const removeAdmin = async (uid) => {
  const result = await Swal.fire({
    title: t('admin.removeAdmin'),
    text: t('admin.removeAdminConfirm'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel')
  })

  if (result.isConfirmed) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        role: 'user',
        updatedAt: new Date()
      })
      await fetchUsers()
      Swal.fire({
        icon: 'success',
        title: t('admin.adminRemoved'),
        text: t('admin.adminRemovedMessage')
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('common.error'),
        text: error.message
      })
    }
  }
}

// Lifecycle hooks
onMounted(async () => {
  await Promise.all([fetchUsers(), fetchStats()])
})
</script> 