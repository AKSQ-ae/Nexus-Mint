import { createComponentLogger } from './logger';
import { eventBus, EventTypes } from './eventBus';

const logger = createComponentLogger('PWA');

// PWA Configuration Types
interface PWAConfig {
  enableOfflineMode: boolean;
  enableBackgroundSync: boolean;
  enablePushNotifications: boolean;
  enableInstallPrompt: boolean;
  offlineFallbackUrl: string;
  cacheDuration: number;
  syncRetryDelay: number;
}

interface CacheStrategy {
  name: string;
  patterns: string[];
  strategy: 'cacheFirst' | 'networkFirst' | 'staleWhileRevalidate';
  maxEntries?: number;
  maxAge?: number;
}

interface BackgroundSyncData {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
  userId?: string;
}

// Progressive Web App Manager
class PWAManager {
  private static instance: PWAManager;
  private config: PWAConfig;
  private serviceWorker: ServiceWorker | null = null;
  private installPromptEvent: any = null;
  private backgroundSyncQueue: BackgroundSyncData[] = [];
  private offlineData = new Map<string, any>();

  private constructor() {
    this.config = {
      enableOfflineMode: true,
      enableBackgroundSync: true,
      enablePushNotifications: true,
      enableInstallPrompt: true,
      offlineFallbackUrl: '/offline.html',
      cacheDuration: 24 * 60 * 60 * 1000, // 24 hours
      syncRetryDelay: 5000 // 5 seconds
    };

    this.initialize();
  }

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  private async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      await this.registerServiceWorker();
      this.setupInstallPrompt();
      this.setupOfflineDetection();
      this.setupBackgroundSync();
      this.setupPushNotifications();
      this.setupCaching();

      logger.info('PWA manager initialized');
    } catch (error) {
      logger.error('PWA initialization failed', error);
    }
  }

  // Service Worker Registration
  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      logger.warn('Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      this.serviceWorker = registration.active;

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              this.showUpdateAvailable();
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event.data);
      });

      logger.info('Service Worker registered successfully');
    } catch (error) {
      logger.error('Service Worker registration failed', error);
    }
  }

  private showUpdateAvailable(): void {
    eventBus.emit(EventTypes.SYSTEM_WARNING, {
      type: 'app_update',
      message: 'A new version of the app is available',
      action: 'reload'
    });
  }

  // Install Prompt
  private setupInstallPrompt(): void {
    if (!this.config.enableInstallPrompt) return;

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.installPromptEvent = event;
      this.showInstallBanner();
    });

    // Track successful installation
    window.addEventListener('appinstalled', () => {
      logger.info('PWA installed successfully');
      eventBus.emit('pwa.installed', { timestamp: new Date() });
      this.installPromptEvent = null;
    });
  }

  private showInstallBanner(): void {
    eventBus.emit('pwa.installable', {
      canInstall: true,
      prompt: () => this.promptInstall()
    });
  }

  async promptInstall(): Promise<boolean> {
    if (!this.installPromptEvent) return false;

    try {
      this.installPromptEvent.prompt();
      const result = await this.installPromptEvent.userChoice;
      
      if (result.outcome === 'accepted') {
        logger.info('User accepted install prompt');
        return true;
      } else {
        logger.info('User dismissed install prompt');
        return false;
      }
    } catch (error) {
      logger.error('Install prompt failed', error);
      return false;
    }
  }

  // Offline Detection
  private setupOfflineDetection(): void {
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine;
      eventBus.emit(isOnline ? 'pwa.online' : 'pwa.offline', {
        isOnline,
        timestamp: new Date()
      });

      if (isOnline) {
        this.syncPendingData();
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Initial status
    updateOnlineStatus();
  }

  // Background Sync
  private setupBackgroundSync(): void {
    if (!this.config.enableBackgroundSync) return;

    // Listen for failed requests that need background sync
    eventBus.on('api.request.failed', (event) => {
      if (!navigator.onLine) {
        this.queueForBackgroundSync(event.payload);
      }
    });

    // Process background sync queue when online
    eventBus.on('pwa.online', () => {
      this.syncPendingData();
    });
  }

  private queueForBackgroundSync(data: any): void {
    const syncData: BackgroundSyncData = {
      id: this.generateId(),
      type: data.type || 'api_request',
      data,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: 3
    };

    this.backgroundSyncQueue.push(syncData);
    this.persistSyncQueue();

    logger.debug('Queued for background sync', { id: syncData.id, type: syncData.type });
  }

  private async syncPendingData(): Promise<void> {
    if (this.backgroundSyncQueue.length === 0) return;

    logger.info('Starting background sync', { queueSize: this.backgroundSyncQueue.length });

    const failedSyncs: BackgroundSyncData[] = [];

    for (const syncData of this.backgroundSyncQueue) {
      try {
        await this.processSyncData(syncData);
        logger.debug('Background sync successful', { id: syncData.id });
      } catch (error) {
        syncData.retryCount++;
        
        if (syncData.retryCount < syncData.maxRetries) {
          failedSyncs.push(syncData);
          logger.warn('Background sync failed, will retry', { 
            id: syncData.id, 
            retryCount: syncData.retryCount 
          });
        } else {
          logger.error('Background sync failed permanently', error, { id: syncData.id });
        }
      }
    }

    this.backgroundSyncQueue = failedSyncs;
    this.persistSyncQueue();

    if (failedSyncs.length > 0) {
      setTimeout(() => this.syncPendingData(), this.config.syncRetryDelay);
    }
  }

  private async processSyncData(syncData: BackgroundSyncData): Promise<void> {
    switch (syncData.type) {
      case 'investment':
        await this.syncInvestmentData(syncData.data);
        break;
      case 'profile_update':
        await this.syncProfileData(syncData.data);
        break;
      case 'api_request':
        await this.replayAPIRequest(syncData.data);
        break;
      default:
        throw new Error(`Unknown sync type: ${syncData.type}`);
    }
  }

  private async syncInvestmentData(data: any): Promise<void> {
    const response = await fetch('/api/investments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Investment sync failed: ${response.status}`);
    }
  }

  private async syncProfileData(data: any): Promise<void> {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Profile sync failed: ${response.status}`);
    }
  }

  private async replayAPIRequest(data: any): Promise<void> {
    const response = await fetch(data.url, {
      method: data.method || 'GET',
      headers: data.headers || {},
      body: data.body
    });

    if (!response.ok) {
      throw new Error(`API request replay failed: ${response.status}`);
    }
  }

  // Push Notifications
  private async setupPushNotifications(): Promise<void> {
    if (!this.config.enablePushNotifications) return;

    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      logger.warn('Push notifications not supported');
      return;
    }

    // Request permission on user interaction
    eventBus.on('user.notification.request', async () => {
      await this.requestNotificationPermission();
    });
  }

  async requestNotificationPermission(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        await this.subscribeToPush();
        logger.info('Push notification permission granted');
        return true;
      } else {
        logger.info('Push notification permission denied');
        return false;
      }
    } catch (error) {
      logger.error('Push notification permission request failed', error);
      return false;
    }
  }

  private async subscribeToPush(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.VITE_VAPID_PUBLIC_KEY || '')
      });

      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!),
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!)
        }
      };

      // Send subscription to server
      await this.sendSubscriptionToServer(subscriptionData);
      
      logger.info('Push subscription successful');
    } catch (error) {
      logger.error('Push subscription failed', error);
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscriptionData): Promise<void> {
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });
  }

  // Caching
  private setupCaching(): void {
    if (!this.config.enableOfflineMode) return;

    const cacheStrategies: CacheStrategy[] = [
      {
        name: 'static-assets',
        patterns: ['/static/', '/assets/', '/images/'],
        strategy: 'cacheFirst',
        maxEntries: 100,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      },
      {
        name: 'api-data',
        patterns: ['/api/properties', '/api/user'],
        strategy: 'staleWhileRevalidate',
        maxEntries: 50,
        maxAge: 5 * 60 * 1000 // 5 minutes
      },
      {
        name: 'pages',
        patterns: ['/dashboard', '/properties', '/portfolio'],
        strategy: 'networkFirst',
        maxEntries: 20,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    ];

    this.sendMessageToServiceWorker({
      type: 'SETUP_CACHING',
      strategies: cacheStrategies
    });
  }

  // Offline Data Management
  async storeOfflineData(key: string, data: any): Promise<void> {
    this.offlineData.set(key, {
      data,
      timestamp: new Date(),
      synced: false
    });

    // Also store in IndexedDB for persistence
    await this.storeInIndexedDB(key, data);
  }

  async getOfflineData(key: string): Promise<any> {
    const cached = this.offlineData.get(key);
    if (cached) return cached.data;

    // Fallback to IndexedDB
    return await this.getFromIndexedDB(key);
  }

  private async storeInIndexedDB(key: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('nexus-offline', 1);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data');
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['data'], 'readwrite');
        const store = transaction.objectStore('data');
        
        store.put(data, key);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };

      request.onerror = () => reject(request.error);
    });
  }

  private async getFromIndexedDB(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('nexus-offline', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['data'], 'readonly');
        const store = transaction.objectStore('data');
        const getRequest = store.get(key);
        
        getRequest.onsuccess = () => resolve(getRequest.result);
        getRequest.onerror = () => reject(getRequest.error);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Utility Methods
  private handleServiceWorkerMessage(data: any): void {
    switch (data.type) {
      case 'BACKGROUND_SYNC':
        this.queueForBackgroundSync(data.payload);
        break;
      case 'CACHE_UPDATED':
        eventBus.emit('pwa.cache.updated', data);
        break;
      case 'OFFLINE_FALLBACK':
        eventBus.emit('pwa.offline.fallback', data);
        break;
    }
  }

  private sendMessageToServiceWorker(message: any): void {
    if (this.serviceWorker) {
      this.serviceWorker.postMessage(message);
    }
  }

  private persistSyncQueue(): void {
    try {
      localStorage.setItem('nexus_sync_queue', JSON.stringify(this.backgroundSyncQueue));
    } catch (error) {
      logger.error('Failed to persist sync queue', error);
    }
  }

  private loadSyncQueue(): void {
    try {
      const stored = localStorage.getItem('nexus_sync_queue');
      if (stored) {
        this.backgroundSyncQueue = JSON.parse(stored);
      }
    } catch (error) {
      logger.error('Failed to load sync queue', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private generateId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API
  async addToHomeScreen(): Promise<boolean> {
    return this.promptInstall();
  }

  isOffline(): boolean {
    return !navigator.onLine;
  }

  async shareContent(data: ShareData): Promise<boolean> {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        logger.error('Share failed', error);
      }
    }
    return false;
  }

  getSyncQueueStatus(): { pending: number; failed: number } {
    const failed = this.backgroundSyncQueue.filter(item => item.retryCount >= item.maxRetries).length;
    return {
      pending: this.backgroundSyncQueue.length - failed,
      failed
    };
  }
}

// Global PWA manager instance
export const pwaManager = PWAManager.getInstance();

// React Hooks for PWA
export function usePWA() {
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);
  const [canInstall, setCanInstall] = React.useState(false);
  const [installPrompt, setInstallPrompt] = React.useState<(() => Promise<boolean>) | null>(null);

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    eventBus.on('pwa.online', handleOnline);
    eventBus.on('pwa.offline', handleOffline);
    
    eventBus.on('pwa.installable', (event) => {
      setCanInstall(true);
      setInstallPrompt(() => event.payload.prompt);
    });

    return () => {
      eventBus.off('pwa.online');
      eventBus.off('pwa.offline');
      eventBus.off('pwa.installable');
    };
  }, []);

  return {
    isOffline,
    canInstall,
    install: installPrompt,
    share: (data: ShareData) => pwaManager.shareContent(data),
    storeOffline: (key: string, data: any) => pwaManager.storeOfflineData(key, data),
    getOffline: (key: string) => pwaManager.getOfflineData(key),
    syncStatus: () => pwaManager.getSyncQueueStatus()
  };
}

export function useOfflineStorage<T>(key: string, initialValue: T) {
  const [data, setData] = React.useState<T>(initialValue);

  React.useEffect(() => {
    pwaManager.getOfflineData(key).then(stored => {
      if (stored !== undefined) {
        setData(stored);
      }
    });
  }, [key]);

  const updateData = React.useCallback((newData: T) => {
    setData(newData);
    pwaManager.storeOfflineData(key, newData);
  }, [key]);

  return [data, updateData] as const;
}

// PWA Status Component
export function PWAStatus() {
  const { isOffline, canInstall, install, syncStatus } = usePWA();
  const status = syncStatus();

  if (!isOffline && !canInstall && status.pending === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {isOffline && (
        <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm">You're offline. Changes will sync when online.</p>
          {status.pending > 0 && (
            <p className="text-xs opacity-90">{status.pending} items pending sync</p>
          )}
        </div>
      )}
      
      {canInstall && install && (
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm mb-2">Install Nexus Mint app for better experience</p>
          <button
            onClick={install}
            className="bg-white text-blue-500 px-3 py-1 rounded text-sm font-medium"
          >
            Install
          </button>
        </div>
      )}
    </div>
  );
}

export { PWAManager };