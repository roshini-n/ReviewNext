import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private deferredPrompt: any = null;

  constructor() {
    this.initializePWA();
  }

  private async initializePWA() {
    if ('serviceWorker' in navigator) {
      try {
        // Register service worker
        this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('ServiceWorker registered successfully');

        // Check for updates
        this.checkForUpdates();

        // Listen for install prompt
        this.listenForInstallPrompt();

        // Setup update notifications
        this.setupUpdateNotifications();

      } catch (error) {
        console.error('ServiceWorker registration failed:', error);
      }
    }
  }

  // Check for service worker updates
  private checkForUpdates() {
    if (this.swRegistration) {
      this.swRegistration.addEventListener('updatefound', () => {
        const newWorker = this.swRegistration!.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              this.showUpdateNotification();
            }
          });
        }
      });

      // Check for updates every 60 seconds
      setInterval(() => {
        this.swRegistration!.update();
      }, 60000);
    }
  }

  // Listen for install prompt event
  private listenForInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      
      // Stash the event so it can be triggered later
      this.deferredPrompt = e;
      
      // Show custom install button
      this.showInstallButton();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.hideInstallButton();
      this.deferredPrompt = null;
    });
  }

  // Setup update notifications
  private setupUpdateNotifications() {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
        this.showUpdateNotification();
      }
    });
  }

  // Show update notification
  private showUpdateNotification() {
    // Create a custom notification or use your existing notification system
    const notification = document.createElement('div');
    notification.className = 'pwa-update-notification';
    notification.innerHTML = `
      <div class="pwa-notification-content">
        <p>A new version of ReviewNext is available!</p>
        <button class="pwa-update-btn" onclick="window.pwaService.updateApp()">Update Now</button>
        <button class="pwa-dismiss-btn" onclick="this.parentElement.parentElement.remove()">Later</button>
      </div>
    `;

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border: 1px solid #004D35;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 77, 53, 0.2);
      z-index: 10000;
      padding: 16px;
      max-width: 300px;
    `;

    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  // Show install button
  private showInstallButton() {
    // Create install button if it doesn't exist
    let installBtn = document.getElementById('pwa-install-btn');
    
    if (!installBtn) {
      installBtn = document.createElement('button');
      installBtn.id = 'pwa-install-btn';
      installBtn.innerHTML = '📱 Install App';
      installBtn.className = 'pwa-install-button';
      
      installBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #004D35;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 77, 53, 0.3);
        z-index: 10000;
        transition: all 0.2s ease;
      `;

      installBtn.addEventListener('click', () => this.installPWA());
      installBtn.addEventListener('mouseenter', () => {
        installBtn!.style.transform = 'translateY(-2px)';
        installBtn!.style.boxShadow = '0 6px 16px rgba(0, 77, 53, 0.4)';
      });
      installBtn.addEventListener('mouseleave', () => {
        installBtn!.style.transform = 'translateY(0)';
        installBtn!.style.boxShadow = '0 4px 12px rgba(0, 77, 53, 0.3)';
      });

      document.body.appendChild(installBtn);
    }
  }

  // Hide install button
  private hideInstallButton() {
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
      installBtn.remove();
    }
  }

  // Install PWA
  async installPWA() {
    if (this.deferredPrompt) {
      // Show the install prompt
      this.deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }

      this.deferredPrompt = null;
      this.hideInstallButton();
    }
  }

  // Update app
  updateApp() {
    if (this.swRegistration && this.swRegistration.waiting) {
      // Send message to service worker to skip waiting
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // Reload the page after update
      window.location.reload();
    }
  }

  // Check if PWA is installed
  isPWAInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  // Check if PWA can be installed
  canInstallPWA(): boolean {
    return !!this.deferredPrompt;
  }

  // Get installation status
  getInstallationStatus() {
    return {
      isInstalled: this.isPWAInstalled(),
      canInstall: this.canInstallPWA(),
      isSupported: 'serviceWorker' in navigator
    };
  }

  // Cache specific URLs
  async cacheUrls(urls: string[]) {
    if (this.swRegistration && this.swRegistration.active) {
      this.swRegistration.active.postMessage({
        type: 'CACHE_URLS',
        payload: urls
      });
    }
  }

  // Clear cache
  async clearCache() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('Cache cleared');
    }
  }

  // Get cache size
  async getCacheSize(): Promise<number> {
    if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    }
    return 0;
  }

  // Network status
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Listen for network changes
  onNetworkChange(callback: (isOnline: boolean) => void) {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }

  // Show notification
  showNotification(title: string, options: NotificationOptions = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        ...options
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      return notification;
    }
    return null;
  }

  // Background sync (requires registration with service worker)
  async backgroundSync(tag: string) {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // Type assertion for sync API that may not be in all browsers
        await (registration as any).sync.register(tag);
        console.log('Background sync registered:', tag);
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    }
  }
}