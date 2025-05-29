<template>
  <div 
    v-if="show"
    class="emoji-picker"
    :style="{ left: `${position.x}px`, top: `${position.y}px` }"
  >
    <div class="emoji-picker-header">
      <div class="flex items-center space-x-2">
        <button 
          v-for="category in categories" 
          :key="category.id"
          @click="selectedCategory = category.id"
          class="p-2 rounded-lg transition-colors"
          :class="selectedCategory === category.id ? 'bg-primary-100 dark:bg-primary-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'"
        >
          <component :is="category.icon" class="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
      <button 
        @click="$emit('close')"
        class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      >
        <XMarkIcon class="w-4 h-4" />
      </button>
    </div>

    <div class="emoji-search">
      <MagnifyingGlassIcon class="w-4 h-4 text-gray-400" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search emojis..."
        class="w-full bg-transparent border-none focus:ring-0 text-sm"
      />
    </div>

    <div class="emoji-grid">
      <button 
        v-for="emoji in filteredEmojis" 
        :key="emoji"
        @click="$emit('select', emoji)"
        class="emoji-item hover:scale-110 transition-transform"
      >
        {{ emoji }}
      </button>
    </div>

    <div class="emoji-footer">
      <div class="text-xs text-gray-500 dark:text-gray-400">
        {{ selectedEmoji ? `Selected: ${selectedEmoji}` : 'Click to select an emoji' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  XMarkIcon,
  MagnifyingGlassIcon,
  FaceSmileIcon,
  HeartIcon,
  FireIcon,
  GlobeAltIcon,
  FlagIcon,
  SparklesIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  show: Boolean,
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  }
})

const emit = defineEmits(['close', 'select'])

const selectedCategory = ref('smileys')
const searchQuery = ref('')
const selectedEmoji = ref('')

const categories = [
  { id: 'smileys', name: 'Smileys', icon: FaceSmileIcon },
  { id: 'people', name: 'People', icon: HeartIcon },
  { id: 'nature', name: 'Nature', icon: GlobeAltIcon },
  { id: 'food', name: 'Food', icon: FireIcon },
  { id: 'activities', name: 'Activities', icon: SparklesIcon },
  { id: 'flags', name: 'Flags', icon: FlagIcon }
]

// Emoji data organized by categories
const emojis = {
  smileys: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
  people: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝'],
  nature: ['🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙'],
  food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔'],
  activities: ['⚽️', '🏀', '🏈', '⚾️', '🥎', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥊', '🥋', '🥅', '⛳️', '⛸️', '🎣', '🤿', '🎽', '🛹', '🛷', '⛷️', '🏂', '🏋️', '🤼', '🤸'],
  flags: ['🏳️', '🏴', '🏁', '🚩', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇦🇫', '🇦🇽', '🇦🇱', '🇩🇿', '🇦🇸', '🇦🇩', '🇦🇴', '🇦🇮', '🇦🇶', '🇦🇬', '🇦🇷', '🇦🇲', '🇦🇼', '🇦🇺', '🇦🇹', '🇦🇿', '🇧🇸', '🇧🇭', '🇧🇩', '🇧🇧', '🇧🇾', '🇧🇪', '🇧🇿']
}

const filteredEmojis = computed(() => {
  let emojiList = emojis[selectedCategory.value] || []
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    emojiList = emojiList.filter(emoji => 
      emoji.toLowerCase().includes(query)
    )
  }
  
  return emojiList
})
</script>

<style scoped>
.emoji-picker {
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

.dark .emoji-picker {
  background: rgba(31, 41, 55, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
}

.emoji-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.dark .emoji-picker-header {
  border-color: rgba(255, 255, 255, 0.1);
}

.emoji-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.dark .emoji-search {
  border-color: rgba(255, 255, 255, 0.1);
}

.emoji-search input {
  color: inherit;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.25rem;
  padding: 0.75rem;
  max-height: 240px;
  overflow-y: auto;
}

.emoji-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-size: 1.25rem;
  transition: all 0.2s ease;
}

.emoji-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: scale(1.1);
}

.dark .emoji-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.emoji-footer {
  padding: 0.75rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.dark .emoji-footer {
  border-color: rgba(255, 255, 255, 0.1);
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

/* Custom scrollbar */
.emoji-grid::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.emoji-grid::-webkit-scrollbar-track {
  background: transparent;
}

.emoji-grid::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.dark .emoji-grid::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}
</style> 