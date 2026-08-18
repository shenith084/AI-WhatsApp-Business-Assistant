import Swal from 'sweetalert2';

const swalConfig = {
  customClass: {
    popup: 'my-moon-swal',
    title: 'my-moon-title',
    htmlContainer: 'my-moon-text',
    confirmButton: 'my-moon-confirm',
    cancelButton: 'my-moon-cancel'
  },
  buttonsStyling: false
};

export const showToast = (title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success', text?: string) => {
  return Swal.fire({
    ...swalConfig,
    title,
    text,
    icon,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
  });
};

export const showAlert = (title: string, text?: string, icon: 'success' | 'error' | 'warning' | 'info' = 'error') => {
  return Swal.fire({
    ...swalConfig,
    title,
    text,
    icon
  });
};

export const showConfirm = async (title: string, text?: string, confirmText: string = 'Yes') => {
  const result = await Swal.fire({
    ...swalConfig,
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText
  });
  return result.isConfirmed;
};
