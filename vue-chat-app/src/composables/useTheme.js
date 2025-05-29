import { ref, watch } from 'vue'
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)

export function useTheme() {
  const isDarkMode = ref(isDark.value)

  watch(isDark, (newValue) => {
    isDarkMode.value = newValue
  })

  const toggleTheme = () => {
    toggleDark()
  }

  return {
    isDarkMode,
    toggleTheme
  }
} 