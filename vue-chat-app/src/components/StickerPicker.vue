<template>
  <div 
    v-if="show"
    class="sticker-picker"
    :style="{ left: `${position.x}px`, top: `${position.y}px` }"
  >
    <div class="sticker-picker-header">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Stickers</h3>
      <button 
        @click="$emit('close')"
        class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      >
        <XMarkIcon class="w-4 h-4" />
      </button>
    </div>
    
    <div class="sticker-categories">
      <button 
        v-for="category in categories" 
        :key="category.id"
        @click="selectedCategory = category.id"
        :class="[
          'px-3 py-1.5 text-sm rounded-full transition-colors',
          selectedCategory === category.id 
            ? 'bg-primary-500 text-white' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        ]"
      >
        {{ category.name }}
      </button>
    </div>

    <div class="sticker-grid">
      <button 
        v-for="sticker in filteredStickers" 
        :key="sticker.id"
        @click="$emit('select', sticker)"
        class="sticker-item hover:scale-110 transition-transform"
      >
        <img :src="sticker.url" :alt="sticker.name" class="w-12 h-12 object-contain" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  show: Boolean,
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  }
})

const emit = defineEmits(['close', 'select'])

const selectedCategory = ref('reactions')

const categories = [
  { id: 'reactions', name: 'Reactions' },
  { id: 'animals', name: 'Animals' },
  { id: 'food', name: 'Food' },
  { id: 'objects', name: 'Objects' }
]

// Sample stickers - replace with your actual stickers
const stickers = [
  { id: 1, category: 'reactions', name: 'Happy', url: 'https://cdn.jsdelivr.net/emojione/assets/png/1f600.png' },
  { id: 2, category: 'reactions', name: 'Laugh', url: 'https://cdn.jsdelivr.net/emojione/assets/png/1f602.png' },
  { id: 3, category: 'reactions', name: 'Love', url: 'https://cdn.jsdelivr.net/emojione/assets/png/1f60d.png' },
  { id: 4, category: 'animals', name: 'Dog', url: 'https://cdn.jsdelivr.net/emojione/assets/png/1f436.png' },
  { id: 5, category: 'animals', name: 'Cat', url: 'https://cdn.jsdelivr.net/emojione/assets/png/1f431.png' },
  { id: 6, category: 'food', name: 'Pizza', url: 'https://cdn.jsdelivr.net/emojione/assets/png/1f355.png' },
  { id: 7, category: 'food', name: 'Burger', url: 'https://cdn.jsdelivr.net/emojione/assets/png/1f354.png' },
  { id: 8, category: 'objects', name: 'Gift', url: 'https://cdn.jsdelivr.net/emojione/assets/png/1f381.png' },
  { id: 9, category: 'objects', name: 'Balloon', url: 'https://cdn.jsdelivr.net/emojione/assets/png/1f388.png' }
]

const filteredStickers = computed(() => {
  return stickers.filter(sticker => sticker.category === selectedCategory.value)
})
</script>

<style scoped>
.sticker-picker {
  position: fixed;
  z-index: 50;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  width: 320px;
  animation: fadeIn 0.2s ease-out;
}

.dark .sticker-picker {
  background: rgba(31, 41, 55, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
}

.sticker-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.dark .sticker-picker-header {
  border-color: rgba(255, 255, 255, 0.1);
}

.sticker-categories {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.sticker-categories::-webkit-scrollbar {
  display: none;
}

.sticker-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  padding: 0.75rem;
  max-height: 240px;
  overflow-y: auto;
}

.sticker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.sticker-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dark .sticker-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style> 