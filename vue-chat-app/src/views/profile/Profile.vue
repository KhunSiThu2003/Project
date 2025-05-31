<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <!-- Profile Header -->
        <div class="text-center mb-8">
          <div class="relative inline-block">
            <img
              :src="user.photoURL || 'https://via.placeholder.com/150'"
              :alt="user.displayName"
              class="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <button
              class="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full hover:bg-primary-600"
              @click="triggerFileInput"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handlePhotoUpload"
            />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ user.displayName }}
          </h1>
          <p class="text-gray-500 dark:text-gray-400">{{ user.email }}</p>
        </div>

        <!-- Profile Form -->
        <form @submit.prevent="updateProfile" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ $t('profile.displayName') }}
            </label>
            <input
              v-model="form.displayName"
              type="text"
              class="input mt-1"
              :placeholder="$t('profile.displayNamePlaceholder')"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ $t('profile.bio') }}
            </label>
            <textarea
              v-model="form.bio"
              rows="3"
              class="input mt-1"
              :placeholder="$t('profile.bioPlaceholder')"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ $t('profile.status') }}
            </label>
            <select v-model="form.status" class="input mt-1">
              <option value="online">{{ $t('profile.statusOnline') }}</option>
              <option value="away">{{ $t('profile.statusAway') }}</option>
              <option value="busy">{{ $t('profile.statusBusy') }}</option>
              <option value="offline">{{ $t('profile.statusOffline') }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ $t('profile.theme') }}
            </label>
            <select v-model="form.theme" class="input mt-1">
              <option value="light">{{ $t('profile.themeLight') }}</option>
              <option value="dark">{{ $t('profile.themeDark') }}</option>
              <option value="system">{{ $t('profile.themeSystem') }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ $t('profile.language') }}
            </label>
            <select v-model="form.language" class="input mt-1">
              <option value="en">{{ $t('profile.languageEnglish') }}</option>
              <option value="es">{{ $t('profile.languageSpanish') }}</option>
              <option value="fr">{{ $t('profile.languageFrench') }}</option>
              <option value="my">{{ $t('profile.languageMyanmar') }}</option>
            </select>
          </div>

          <div class="flex justify-end space-x-4">
            <button
              type="button"
              class="btn btn-secondary"
              @click="resetForm"
              :disabled="loading"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="loading"
            >
              {{ $t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import { useLanguage } from '@/composables/useLanguage'
import Swal from 'sweetalert2'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

const authStore = useAuthStore()
const { t } = useI18n()
const { setTheme } = useTheme()
const { setLanguage } = useLanguage()

const fileInput = ref(null)
const loading = ref(false)

const form = ref({
  displayName: '',
  bio: '',
  status: 'online',
  theme: 'system',
  language: 'en'
})

const user = computed(() => authStore.user)

const triggerFileInput = () => {
  fileInput.value.click()
}

const handlePhotoUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    loading.value = true
    const storage = getStorage()
    const photoRef = storageRef(storage, `profile_photos/${user.value.uid}`)
    
    await uploadBytes(photoRef, file)
    const photoURL = await getDownloadURL(photoRef)
    
    await authStore.updateProfile({ photoURL })
    Swal.fire({
      icon: 'success',
      title: t('profile.photoUpdated'),
      text: t('profile.photoUpdatedMessage')
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

const updateProfile = async () => {
  try {
    loading.value = true
    
    // Update auth profile
    await authStore.updateProfile({
      displayName: form.value.displayName
    })

    // Update user document
    await updateDoc(doc(db, 'users', user.value.uid), {
      bio: form.value.bio,
      status: form.value.status,
      updatedAt: new Date()
    })

    // Update theme and language
    setTheme(form.value.theme)
    setLanguage(form.value.language)

    Swal.fire({
      icon: 'success',
      title: t('profile.updated'),
      text: t('profile.updatedMessage')
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

const resetForm = () => {
  form.value = {
    displayName: user.value.displayName || '',
    bio: user.value.bio || '',
    status: user.value.status || 'online',
    theme: user.value.theme || 'system',
    language: user.value.language || 'en'
  }
}

onMounted(() => {
  resetForm()
})
</script> 