/**
 * Shows an error toast.
 * @param {any} error
 * @param {string} message
 */
export function showErrorToast(error: any, message: string) {
  window.alert(`${message}: ${error?.message || error}`);
} 