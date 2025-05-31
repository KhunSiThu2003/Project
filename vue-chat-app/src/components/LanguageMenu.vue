<template>
  <div class="relative z-50">
    <button 
      @click="toggleMenu"
      class="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
      :class="{ 'ring-2 ring-primary-500 ring-opacity-50': isOpen }"
    >
      <img :src="`/src/assets/flags/${currentLocale}.svg`" class="w-5 h-5 rounded-sm object-cover" :alt="currentLocale" />
      <span class="text-sm font-medium">{{ $t(`profile.language${getLanguageName(currentLocale)}`) }}</span>
      <svg 
        class="w-4 h-4 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div 
        v-if="isOpen"
        class="absolute z-50 mt-2 w-56 rounded shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700"
      >
        <div class="p-2">
          <button
            v-for="lang in languages"
            :key="lang.code"
            @click="selectLanguage(lang.code)"
            class="w-full mb-0.5 rounded flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
            :class="{ 'bg-gray-50 dark:bg-gray-700/50': currentLocale === lang.code }"
          >
            <img :src="`/src/assets/flags/${lang.code}.svg`" class="w-5 h-5 rounded-sm object-cover" :alt="lang.code" />
            <span class="ml-3 rtl:ml-0 rtl:mr-3">{{ $t(`profile.language${lang.name}`) }}</span>
            <svg
              v-if="currentLocale === lang.code"
              class="ml-auto rtl:ml-0 rtl:mr-auto w-4 h-4 text-primary-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

const { currentLocale, changeLocale } = useLanguage()
const isOpen = ref(false)

const languages = [
  { code: 'en', name: 'English' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'th', name: 'Thai' },
  { code: 'ko', name: 'Korean' },
  { code: 'my', name: 'Myanmar' }
]

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const selectLanguage = (langCode) => {
  changeLocale({ target: { value: langCode } })
  isOpen.value = false
}

const getLanguageName = (code) => {
  const lang = languages.find(l => l.code === code)
  return lang ? lang.name : 'English'
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.relative {
  isolation: isolate;
}
</style> 