/**
 * Service Worker Update Prompt
 * 
 * Detects when a new service worker version is available and prompts the user to refresh.
 * This ensures users don't get stuck on old versions after deployment.
 */

let refreshing = false;

/**
 * Initialize service worker update detection
 */
export function initServiceWorkerUpdates() {
  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.log('[SW Update] Service workers not supported');
    return;
  }

  // Listen for controller change (new service worker activated)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    console.log('[SW Update] New service worker activated, reloading page');
    refreshing = true;
    window.location.reload();
  });

  // Check for updates periodically (every 10 minutes)
  setInterval(() => {
    navigator.serviceWorker.ready.then((registration) => {
      console.log('[SW Update] Checking for updates...');
      registration.update();
    });
  }, 10 * 60 * 1000);

  // Check for updates immediately
  navigator.serviceWorker.ready.then((registration) => {
    console.log('[SW Update] Service worker ready, checking for updates');
    
    // Listen for new service worker waiting
    if (registration.waiting) {
      showUpdatePrompt(registration.waiting);
    }

    // Listen for new service worker installing
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker installed and waiting
          showUpdatePrompt(newWorker);
        }
      });
    });

    // Check for updates on page load
    registration.update();
  });
}

/**
 * Show update prompt to user
 */
function showUpdatePrompt(worker: ServiceWorker) {
  console.log('[SW Update] New version available');
  
  // Create a simple toast notification
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #1a1a1a;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    max-width: 400px;
  `;

  const message = document.createElement('div');
  message.textContent = 'A new version is available!';
  message.style.flex = '1';

  const button = document.createElement('button');
  button.textContent = 'Refresh';
  button.style.cssText = `
    background: #3b82f6;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    font-size: 14px;
  `;
  button.onmouseover = () => {
    button.style.background = '#2563eb';
  };
  button.onmouseout = () => {
    button.style.background = '#3b82f6';
  };

  button.onclick = () => {
    // Tell the service worker to skip waiting
    worker.postMessage({ type: 'SKIP_WAITING' });
    toast.remove();
  };

  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.cssText = `
    background: transparent;
    color: #999;
    border: none;
    padding: 0;
    cursor: pointer;
    font-size: 24px;
    line-height: 1;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  closeButton.onmouseover = () => {
    closeButton.style.color = 'white';
  };
  closeButton.onmouseout = () => {
    closeButton.style.color = '#999';
  };
  closeButton.onclick = () => {
    toast.remove();
  };

  toast.appendChild(message);
  toast.appendChild(button);
  toast.appendChild(closeButton);
  document.body.appendChild(toast);

  // Auto-dismiss after 30 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 30000);
}
