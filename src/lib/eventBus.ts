import { createComponentLogger } from './logger';

const logger = createComponentLogger('EventBus');

// Event Types and Interfaces
interface BaseEvent {
  id: string;
  type: string;
  payload: any;
  timestamp: Date;
  source: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

interface EventHandler<T = any> {
  (event: BaseEvent & { payload: T }): void | Promise<void>;
}

interface EventSubscription {
  id: string;
  eventType: string;
  handler: EventHandler;
  once?: boolean;
  priority?: number;
}

interface EventHistory {
  events: BaseEvent[];
  lastEventId: string;
  totalEvents: number;
}

// Event Bus Implementation
class EventBus {
  private static instance: EventBus;
  private subscriptions = new Map<string, EventSubscription[]>();
  private eventHistory: BaseEvent[] = [];
  private middleware: EventMiddleware[] = [];
  private isProcessing = false;
  private eventQueue: BaseEvent[] = [];

  private constructor() {
    this.setupDefaultMiddleware();
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  // Subscribe to events
  on<T = any>(
    eventType: string, 
    handler: EventHandler<T>, 
    options: { once?: boolean; priority?: number } = {}
  ): () => void {
    const subscription: EventSubscription = {
      id: this.generateId(),
      eventType,
      handler: handler as EventHandler,
      once: options.once,
      priority: options.priority || 0
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    const subscribers = this.subscriptions.get(eventType)!;
    subscribers.push(subscription);
    
    // Sort by priority (higher priority first)
    subscribers.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    logger.debug('Event subscription added', { eventType, subscriptionId: subscription.id });

    // Return unsubscribe function
    return () => this.off(eventType, subscription.id);
  }

  // One-time event subscription
  once<T = any>(eventType: string, handler: EventHandler<T>): () => void {
    return this.on(eventType, handler, { once: true });
  }

  // Unsubscribe from events
  off(eventType: string, subscriptionId?: string): void {
    const subscribers = this.subscriptions.get(eventType);
    if (!subscribers) return;

    if (subscriptionId) {
      const index = subscribers.findIndex(sub => sub.id === subscriptionId);
      if (index >= 0) {
        subscribers.splice(index, 1);
        logger.debug('Event subscription removed', { eventType, subscriptionId });
      }
    } else {
      // Remove all subscribers for this event type
      this.subscriptions.delete(eventType);
      logger.debug('All subscriptions removed for event type', { eventType });
    }
  }

  // Emit event
  async emit(
    eventType: string, 
    payload: any, 
    options: { 
      source?: string; 
      userId?: string; 
      sessionId?: string; 
      metadata?: Record<string, any>;
      skipHistory?: boolean;
    } = {}
  ): Promise<void> {
    const event: BaseEvent = {
      id: this.generateId(),
      type: eventType,
      payload,
      timestamp: new Date(),
      source: options.source || 'unknown',
      userId: options.userId,
      sessionId: options.sessionId,
      metadata: options.metadata
    };

    logger.debug('Event emitted', { eventType, eventId: event.id });

    // Store in history unless explicitly skipped
    if (!options.skipHistory) {
      this.eventHistory.push(event);
      this.maintainHistorySize();
    }

    // Process event through middleware and handlers
    await this.processEvent(event);
  }

  // Process event through middleware and handlers
  private async processEvent(event: BaseEvent): Promise<void> {
    if (this.isProcessing) {
      this.eventQueue.push(event);
      return;
    }

    this.isProcessing = true;

    try {
      // Apply middleware
      let processedEvent = event;
      for (const middleware of this.middleware) {
        processedEvent = await middleware(processedEvent);
        if (!processedEvent) {
          logger.debug('Event stopped by middleware', { eventId: event.id });
          return;
        }
      }

      // Send to subscribers
      const subscribers = this.subscriptions.get(processedEvent.type) || [];
      const removeSubscriptions: string[] = [];

      for (const subscription of subscribers) {
        try {
          await subscription.handler(processedEvent);
          
          if (subscription.once) {
            removeSubscriptions.push(subscription.id);
          }
        } catch (error) {
          logger.error('Event handler error', error, { 
            eventType: processedEvent.type, 
            subscriptionId: subscription.id 
          });
        }
      }

      // Remove one-time subscriptions
      removeSubscriptions.forEach(id => this.off(processedEvent.type, id));

    } catch (error) {
      logger.error('Event processing error', error, { eventId: event.id });
    } finally {
      this.isProcessing = false;
      
      // Process queued events
      if (this.eventQueue.length > 0) {
        const nextEvent = this.eventQueue.shift()!;
        setImmediate(() => this.processEvent(nextEvent));
      }
    }
  }

  // Add middleware
  use(middleware: EventMiddleware): void {
    this.middleware.push(middleware);
    logger.debug('Middleware added');
  }

  // Get event history
  getHistory(eventType?: string, limit?: number): BaseEvent[] {
    let events = eventType 
      ? this.eventHistory.filter(e => e.type === eventType)
      : this.eventHistory;

    if (limit) {
      events = events.slice(-limit);
    }

    return events;
  }

  // Clear event history
  clearHistory(): void {
    this.eventHistory = [];
    logger.info('Event history cleared');
  }

  // Replay events from a specific point
  async replay(fromEventId: string, eventType?: string): Promise<void> {
    const startIndex = this.eventHistory.findIndex(e => e.id === fromEventId);
    if (startIndex === -1) {
      logger.warn('Event ID not found for replay', { fromEventId });
      return;
    }

    const eventsToReplay = this.eventHistory.slice(startIndex + 1);
    const filteredEvents = eventType 
      ? eventsToReplay.filter(e => e.type === eventType)
      : eventsToReplay;

    logger.info('Replaying events', { count: filteredEvents.length, fromEventId });

    for (const event of filteredEvents) {
      await this.processEvent({ ...event, id: this.generateId() });
    }
  }

  // Get subscription stats
  getStats(): { totalSubscriptions: number; eventTypes: number; historySize: number } {
    let totalSubscriptions = 0;
    this.subscriptions.forEach(subs => totalSubscriptions += subs.length);

    return {
      totalSubscriptions,
      eventTypes: this.subscriptions.size,
      historySize: this.eventHistory.length
    };
  }

  private generateId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private maintainHistorySize(maxSize: number = 1000): void {
    if (this.eventHistory.length > maxSize) {
      this.eventHistory = this.eventHistory.slice(-maxSize);
    }
  }

  private setupDefaultMiddleware(): void {
    // Validation middleware
    this.use(async (event) => {
      if (!event.type || !event.id) {
        logger.error('Invalid event format', event);
        return null;
      }
      return event;
    });

    // Logging middleware
    this.use(async (event) => {
      logger.debug('Event processed', { 
        type: event.type, 
        id: event.id, 
        source: event.source 
      });
      return event;
    });
  }
}

type EventMiddleware = (event: BaseEvent) => Promise<BaseEvent | null>;

// Global event bus instance
export const eventBus = EventBus.getInstance();

// Predefined Event Types
export const EventTypes = {
  // User Events
  USER_REGISTERED: 'user.registered',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_PROFILE_UPDATED: 'user.profile.updated',
  USER_KYC_COMPLETED: 'user.kyc.completed',

  // Investment Events
  INVESTMENT_STARTED: 'investment.started',
  INVESTMENT_COMPLETED: 'investment.completed',
  INVESTMENT_FAILED: 'investment.failed',
  INVESTMENT_CANCELLED: 'investment.cancelled',
  PAYMENT_PROCESSED: 'payment.processed',
  
  // Property Events
  PROPERTY_CREATED: 'property.created',
  PROPERTY_UPDATED: 'property.updated',
  PROPERTY_TOKENIZED: 'property.tokenized',
  PROPERTY_VIEWED: 'property.viewed',
  PROPERTY_FAVORITED: 'property.favorited',

  // Trading Events
  TOKEN_TRANSFER: 'token.transfer',
  TOKEN_SALE: 'token.sale',
  TOKEN_PURCHASE: 'token.purchase',
  MARKET_ORDER: 'market.order',

  // System Events
  SYSTEM_ERROR: 'system.error',
  SYSTEM_WARNING: 'system.warning',
  SYSTEM_MAINTENANCE: 'system.maintenance',
  CACHE_INVALIDATED: 'cache.invalidated',

  // Notification Events
  NOTIFICATION_SENT: 'notification.sent',
  EMAIL_SENT: 'email.sent',
  SMS_SENT: 'sms.sent',

  // Analytics Events
  PAGE_VIEW: 'analytics.page_view',
  BUTTON_CLICK: 'analytics.button_click',
  FORM_SUBMIT: 'analytics.form_submit',
  CONVERSION: 'analytics.conversion'
} as const;

// Event Payload Types
export interface UserRegisteredPayload {
  userId: string;
  email: string;
  registrationMethod: 'email' | 'social' | 'wallet';
}

export interface InvestmentCompletedPayload {
  investmentId: string;
  userId: string;
  propertyId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}

export interface PropertyTokenizedPayload {
  propertyId: string;
  contractAddress: string;
  totalShares: number;
  sharePrice: number;
  tokenizationDate: Date;
}

// React Hook for Event Bus
export function useEventBus() {
  const subscribe = React.useCallback(<T = any>(
    eventType: string,
    handler: EventHandler<T>,
    deps: React.DependencyList = []
  ) => {
    React.useEffect(() => {
      const unsubscribe = eventBus.on(eventType, handler);
      return unsubscribe;
    }, deps);
  }, []);

  const emit = React.useCallback((
    eventType: string,
    payload: any,
    options?: Parameters<typeof eventBus.emit>[2]
  ) => {
    eventBus.emit(eventType, payload, options);
  }, []);

  return { subscribe, emit };
}

// Event-driven component wrapper
export function withEventBus<P extends object>(
  Component: React.ComponentType<P>,
  eventConfig?: {
    subscribe?: Array<{
      eventType: string;
      handler: EventHandler;
    }>;
    emit?: Array<{
      eventType: string;
      trigger: keyof P;
    }>;
  }
) {
  return React.forwardRef<any, P>((props, ref) => {
    // Subscribe to events
    React.useEffect(() => {
      const unsubscribers: Array<() => void> = [];

      eventConfig?.subscribe?.forEach(({ eventType, handler }) => {
        const unsubscribe = eventBus.on(eventType, handler);
        unsubscribers.push(unsubscribe);
      });

      return () => {
        unsubscribers.forEach(unsub => unsub());
      };
    }, []);

    // Enhanced props with event emission
    const enhancedProps = React.useMemo(() => {
      const enhanced = { ...props };

      eventConfig?.emit?.forEach(({ eventType, trigger }) => {
        const originalHandler = enhanced[trigger] as any;
        enhanced[trigger] = (...args: any[]) => {
          if (originalHandler) {
            originalHandler(...args);
          }
          eventBus.emit(eventType, args);
        } as any;
      });

      return enhanced;
    }, [props]);

    return <Component ref={ref} {...enhancedProps} />;
  });
}

// Event Sourcing Implementation
class EventStore {
  private events: BaseEvent[] = [];

  append(event: BaseEvent): void {
    this.events.push(event);
    logger.debug('Event stored', { eventId: event.id, type: event.type });
  }

  getEvents(aggregateId?: string, fromVersion?: number): BaseEvent[] {
    let events = this.events;

    if (aggregateId) {
      events = events.filter(e => e.metadata?.aggregateId === aggregateId);
    }

    if (fromVersion !== undefined) {
      events = events.filter(e => (e.metadata?.version || 0) > fromVersion);
    }

    return events;
  }

  getLastEvent(aggregateId: string): BaseEvent | null {
    const events = this.getEvents(aggregateId);
    return events.length > 0 ? events[events.length - 1] : null;
  }
}

export const eventStore = new EventStore();

// Real-time Event Sync (for multi-tab communication)
class RealTimeEventSync {
  private channel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('nexus_events');
      this.setupChannelHandlers();
    }
  }

  private setupChannelHandlers(): void {
    if (!this.channel) return;

    this.channel.addEventListener('message', (event) => {
      const { type, payload, metadata } = event.data;
      
      // Re-emit the event locally
      eventBus.emit(type, payload, {
        ...metadata,
        source: 'broadcast',
        skipHistory: true // Avoid duplicate history entries
      });
    });
  }

  broadcastEvent(event: BaseEvent): void {
    if (!this.channel) return;

    this.channel.postMessage({
      type: event.type,
      payload: event.payload,
      metadata: {
        ...event.metadata,
        originalSource: event.source,
        timestamp: event.timestamp.toISOString()
      }
    });
  }
}

export const realTimeSync = new RealTimeEventSync();

// Auto-sync events across tabs
eventBus.use(async (event) => {
  // Only sync certain event types
  const syncableEvents = [
    EventTypes.INVESTMENT_COMPLETED,
    EventTypes.PROPERTY_FAVORITED,
    EventTypes.USER_PROFILE_UPDATED,
    EventTypes.NOTIFICATION_SENT
  ];

  if (syncableEvents.includes(event.type as any)) {
    realTimeSync.broadcastEvent(event);
  }

  return event;
});

// Initialize business event handlers
function initializeBusinessEvents(): void {
  // User registration flow
  eventBus.on(EventTypes.USER_REGISTERED, async (event) => {
    const { userId, email } = event.payload as UserRegisteredPayload;
    
    // Send welcome email
    await eventBus.emit(EventTypes.EMAIL_SENT, {
      to: email,
      template: 'welcome',
      userId
    });

    // Track analytics
    await eventBus.emit(EventTypes.CONVERSION, {
      type: 'user_registration',
      userId,
      value: 1
    });
  });

  // Investment completion flow
  eventBus.on(EventTypes.INVESTMENT_COMPLETED, async (event) => {
    const { investmentId, userId, propertyId, amount } = event.payload as InvestmentCompletedPayload;
    
    // Send confirmation notification
    await eventBus.emit(EventTypes.NOTIFICATION_SENT, {
      userId,
      type: 'investment_success',
      data: { investmentId, propertyId, amount }
    });

    // Update analytics
    await eventBus.emit(EventTypes.CONVERSION, {
      type: 'investment_completion',
      userId,
      value: amount
    });

    // Invalidate relevant caches
    await eventBus.emit(EventTypes.CACHE_INVALIDATED, {
      patterns: [`user:${userId}:investments`, `property:${propertyId}:stats`]
    });
  });

  logger.info('Business event handlers initialized');
}

// Auto-initialize
initializeBusinessEvents();

export { EventBus, eventStore, realTimeSync };