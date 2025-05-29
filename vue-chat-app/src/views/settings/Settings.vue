<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <!-- Settings Header -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ $t('settings.title') }}
          </h1>
        </div>

        <!-- Settings Content -->
        <div class="p-6 space-y-6">
          <!-- Notifications -->
          <div class="space-y-4">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ $t('settings.notifications') }}
            </h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ $t('settings.newMessages') }}
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ $t('settings.newMessagesDesc') }}
                  </p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="settings.notifications.newMessages"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ $t('settings.friendRequests') }}
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ $t('settings.friendRequestsDesc') }}
                  </p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="settings.notifications.friendRequests"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ $t('settings.sound') }}
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ $t('settings.soundDesc') }}
                  </p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="settings.notifications.sound"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          <!-- Privacy -->
          <div class="space-y-4">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ $t('settings.privacy') }}
            </h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ $t('settings.onlineStatus') }}
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ $t('settings.onlineStatusDesc') }}
                  </p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="settings.privacy.onlineStatus"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ $t('settings.readReceipts') }}
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ $t('settings.readReceiptsDesc') }}
                  </p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="settings.privacy.readReceipts"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          <!-- Chat -->
          <div class="space-y-4">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ $t('settings.chat') }}
            </h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ $t('settings.messageFontSize') }}
                </label>
                <select
                  v-model="settings.chat.fontSize"
                  class="input mt-1"
                >
                  <option value="small">{{ $t('settings.fontSizeSmall') }}</option>
                  <option value="medium">{{ $t('settings.fontSizeMedium') }}</option>
                  <option value="large">{{ $t('settings.fontSizeLarge') }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ $t('settings.messagePreview') }}
                </label>
                <select
                  v-model="settings.chat.messagePreview"
                  class="input mt-1"
                >
                  <option value="full">{{ $t('settings.previewFull') }}</option>
                  <option value="partial">{{ $t('settings.previewPartial') }}</option>
                  <option value="none">{{ $t('settings.previewNone') }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Save Button -->
          <div class="flex justify-end">
            <button
              class="btn btn-primary"
              @click="saveSettings"
              :disabled="loading"
            >
              {{ $t('common.save') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import Swal from 'sweetalert2'

const authStore = useAuthStore()
const { t } = useI18n()
const loading = ref(false)

const settings = ref({
  notifications: {
    newMessages: true,
    friendRequests: true,
    sound: true
  },
  privacy: {
    onlineStatus: true,
    readReceipts: true
  },
  chat: {
    fontSize: 'medium',
    messagePreview: 'partial'
  }
})

const saveSettings = async () => {
  try {
    loading.value = true
    await updateDoc(doc(db, 'users', authStore.user.uid), {
      settings: settings.value,
      updatedAt: new Date()
    })

    Swal.fire({
      icon: 'success',
      title: t('settings.saved'),
      text: t('settings.savedMessage')
    })
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

onMounted(() => {
  // Load user settings
  if (authStore.user.settings) {
    settings.value = {
      ...settings.value,
      ...authStore.user.settings
    }
  }
})
</script> 