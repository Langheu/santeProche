let installation = null, registrationPromise, waiting = null, refreshRequested = false;
export const getInstallPrompt = () => installation;
export const getWaitingWorker = () => waiting;
export const isInstalled = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installation = event; });
window.addEventListener('appinstalled', () => { installation = null; window.dispatchEvent(new Event('santeproche:installed')); });
export async function installPwa() {
  if (!installation) return false;
  const event = installation; installation = null;
  await event.prompt(); await event.userChoice; return true;
}
export function updatePwa() { if (waiting) { refreshRequested = true; waiting.postMessage({ type: 'SKIP_WAITING' }); } }
export function registerPwa() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return Promise.resolve(null);
  if (!registrationPromise) {
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (refreshRequested) window.location.reload(); });
    registrationPromise = navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL, updateViaCache: 'none' }).then(registration => {
      const announce = () => { if (registration.waiting && navigator.serviceWorker.controller) { waiting = registration.waiting; window.dispatchEvent(new Event('santeproche:update')); } };
      announce();
      registration.addEventListener('updatefound', () => registration.installing?.addEventListener('statechange', announce));
      return registration;
    }).catch(() => null);
  }
  return registrationPromise;
}
