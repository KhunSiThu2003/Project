import { ref } from 'vue'
import Swal from 'sweetalert2'

export function useToast() {
  const showToast = (type, title, message) => {
    Swal.fire({
      icon: type,
      title: title,
      text: message,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    })
  }

  return {
    showToast
  }
} 