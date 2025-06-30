// ✅ PRODUCTION MONITORING: Comprehensive monitoring utilities

export interface MonitoringEvent {
  type: string;
  timestamp: Date;
  data: Record<string, any>;
  userId?: string;
  sessionId?: string;
  environment: 'development' | 'production' | 'staging';
}

export interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  error?: string;
}

export interface ErrorReport {
  error: Error;
  context: string;
  componentStack?: string;
  userAgent: string;
  url: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// ✅ NEW: Monitoring configuration
const MONITORING_CONFIG = {
  enabled: process.env.NODE_ENV === 'production',
  endpoint: process.env.REACT_APP_MONITORING_ENDPOINT || 'https://api.monitoring.com/events',
  batchSize: 10,
  flushInterval: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 1000,
};

// ✅ NEW: Performance monitoring
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Monitor navigation timing
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric('navigation', navEntry.loadEventEnd - navEntry.loadEventStart, true);
          }
        });
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', navigationObserver);
    }

    // Monitor resource loading
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.recordMetric('resource_load', resourceEntry.duration, true, {
              name: resourceEntry.name,
              type: resourceEntry.initiatorType,
            });
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    }
  }

  recordMetric(operation: string, duration: number, success: boolean, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      operation,
      duration,
      timestamp: new Date(),
      success,
      ...metadata,
    };

    this.metrics.push(metric);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const color = success ? 'green' : 'red';
      console.log(`%c📊 ${operation}: ${duration.toFixed(2)}ms`, `color: ${color}`);
    }

    // Send to monitoring service in production
    if (MONITORING_CONFIG.enabled) {
      this.sendToMonitoringService('performance', metric);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getAverageDuration(operation: string): number {
    const operationMetrics = this.metrics.filter(m => m.operation === operation);
    if (operationMetrics.length === 0) return 0;
    
    const total = operationMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / operationMetrics.length;
  }

  getSuccessRate(operation: string): number {
    const operationMetrics = this.metrics.filter(m => m.operation === operation);
    if (operationMetrics.length === 0) return 0;
    
    const successful = operationMetrics.filter(m => m.success).length;
    return (successful / operationMetrics.length) * 100;
  }

  private sendToMonitoringService(type: string, data: any) {
    // Implementation for sending to monitoring service
    // This would typically use fetch or a monitoring SDK
    console.log('Sending to monitoring service:', { type, data });
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// ✅ NEW: Error monitoring
class ErrorMonitor {
  private errors: ErrorReport[] = [];
  private errorCounts: Map<string, number> = new Map();

  constructor() {
    this.setupGlobalErrorHandling();
  }

  private setupGlobalErrorHandling() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.recordError(new Error(event.message), 'global', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError(new Error(event.reason), 'unhandled_promise', {
        promise: event.promise,
      });
    });
  }

  recordError(error: Error, context: string, metadata?: Record<string, any>) {
    const errorReport: ErrorReport = {
      error,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date(),
      severity: this.determineSeverity(error),
      ...metadata,
    };

    this.errors.push(errorReport);

    // Update error counts
    const errorKey = `${error.name}:${error.message}`;
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`🚨 Error in ${context}:`, error, metadata);
    }

    // Send to monitoring service in production
    if (MONITORING_CONFIG.enabled) {
      this.sendToMonitoringService('error', errorReport);
    }
  }

  private determineSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('timeout')) {
      return 'medium';
    }
    
    if (message.includes('authentication') || message.includes('authorization')) {
      return 'high';
    }
    
    if (message.includes('xss') || message.includes('injection')) {
      return 'critical';
    }
    
    return 'low';
  }

  getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  getErrorCounts(): Map<string, number> {
    return new Map(this.errorCounts);
  }

  getErrorRate(): number {
    const totalErrors = this.errors.length;
    const timeWindow = 24 * 60 * 60 * 1000; // 24 hours
    const recentErrors = this.errors.filter(e => 
      Date.now() - e.timestamp.getTime() < timeWindow
    ).length;
    
    return (recentErrors / timeWindow) * 1000; // errors per second
  }

  private sendToMonitoringService(type: string, data: any) {
    // Implementation for sending to monitoring service
    console.log('Sending error to monitoring service:', { type, data });
  }
}

// ✅ NEW: User analytics
class UserAnalytics {
  private events: MonitoringEvent[] = [];
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupUserTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupUserTracking() {
    // Track page views
    this.trackEvent('page_view', {
      path: window.location.pathname,
      referrer: document.referrer,
    });

    // Track user interactions
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A') {
        this.trackEvent('user_interaction', {
          type: 'click',
          element: target.tagName.toLowerCase(),
          text: target.textContent?.substring(0, 50),
          path: window.location.pathname,
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackEvent('form_submission', {
        formId: form.id || form.className,
        path: window.location.pathname,
      });
    });
  }

  trackEvent(type: string, data: Record<string, any>) {
    const event: MonitoringEvent = {
      type,
      timestamp: new Date(),
      data,
      sessionId: this.sessionId,
      userId: this.userId,
      environment: process.env.NODE_ENV as 'development' | 'production' | 'staging',
    };

    this.events.push(event);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📈 Analytics: ${type}`, data);
    }

    // Send to monitoring service in production
    if (MONITORING_CONFIG.enabled) {
      this.sendToMonitoringService('analytics', event);
    }
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  getEvents(): MonitoringEvent[] {
    return [...this.events];
  }

  getEventCount(type: string): number {
    return this.events.filter(e => e.type === type).length;
  }

  private sendToMonitoringService(type: string, data: any) {
    // Implementation for sending to monitoring service
    console.log('Sending analytics to monitoring service:', { type, data });
  }
}

// ✅ NEW: Health monitoring
class HealthMonitor {
  private healthChecks: Map<string, () => boolean> = new Map();
  private lastCheck: Date = new Date();

  constructor() {
    this.setupDefaultHealthChecks();
    this.startPeriodicChecks();
  }

  private setupDefaultHealthChecks() {
    // Check if the app is responsive
    this.addHealthCheck('app_responsive', () => {
      return !document.hidden && document.readyState === 'complete';
    });

    // Check memory usage (if available)
    if ('memory' in performance) {
      this.addHealthCheck('memory_usage', () => {
        const memory = (performance as any).memory;
        return memory.usedJSHeapSize < memory.jsHeapSizeLimit * 0.8; // Less than 80% used
      });
    }

    // Check network connectivity
    this.addHealthCheck('network_connectivity', () => {
      return navigator.onLine;
    });
  }

  addHealthCheck(name: string, check: () => boolean) {
    this.healthChecks.set(name, check);
  }

  private startPeriodicChecks() {
    setInterval(() => {
      this.runHealthChecks();
    }, 30000); // Check every 30 seconds
  }

  private runHealthChecks() {
    const results: Record<string, boolean> = {};
    
    this.healthChecks.forEach((check, name) => {
      try {
        results[name] = check();
      } catch (error) {
        results[name] = false;
        console.error(`Health check failed for ${name}:`, error);
      }
    });

    this.lastCheck = new Date();

    // Log results in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🏥 Health Check Results:', results);
    }

    // Send to monitoring service in production
    if (MONITORING_CONFIG.enabled) {
      this.sendToMonitoringService('health', { results, timestamp: this.lastCheck });
    }
  }

  getHealthStatus(): Record<string, boolean> {
    const results: Record<string, boolean> = {};
    this.healthChecks.forEach((check, name) => {
      try {
        results[name] = check();
      } catch {
        results[name] = false;
      }
    });
    return results;
  }

  private sendToMonitoringService(type: string, data: any) {
    // Implementation for sending to monitoring service
    console.log('Sending health data to monitoring service:', { type, data });
  }
}

// ✅ NEW: Monitoring manager
class MonitoringManager {
  private performance: PerformanceMonitor;
  private errors: ErrorMonitor;
  private analytics: UserAnalytics;
  private health: HealthMonitor;
  private isInitialized = false;

  constructor() {
    this.performance = new PerformanceMonitor();
    this.errors = new ErrorMonitor();
    this.analytics = new UserAnalytics();
    this.health = new HealthMonitor();
  }

  initialize() {
    if (this.isInitialized) return;

    // Track initialization
    this.analytics.trackEvent('app_initialized', {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date(),
    });

    this.isInitialized = true;
    console.log('✅ Monitoring initialized');
  }

  // Performance monitoring
  recordPerformance(operation: string, duration: number, success: boolean, metadata?: Record<string, any>) {
    this.performance.recordMetric(operation, duration, success, metadata);
  }

  getPerformanceMetrics() {
    return this.performance.getMetrics();
  }

  // Error monitoring
  recordError(error: Error, context: string, metadata?: Record<string, any>) {
    this.errors.recordError(error, context, metadata);
  }

  getErrors() {
    return this.errors.getErrors();
  }

  // Analytics
  trackEvent(type: string, data: Record<string, any>) {
    this.analytics.trackEvent(type, data);
  }

  setUserId(userId: string) {
    this.analytics.setUserId(userId);
  }

  // Health monitoring
  addHealthCheck(name: string, check: () => boolean) {
    this.health.addHealthCheck(name, check);
  }

  getHealthStatus() {
    return this.health.getHealthStatus();
  }

  // Get monitoring report
  getReport() {
    return {
      performance: {
        metrics: this.performance.getMetrics(),
        averageDurations: {
          'api_call': this.performance.getAverageDuration('api_call'),
          'render': this.performance.getAverageDuration('render'),
          'navigation': this.performance.getAverageDuration('navigation'),
        },
        successRates: {
          'api_call': this.performance.getSuccessRate('api_call'),
          'render': this.performance.getSuccessRate('render'),
        },
      },
      errors: {
        total: this.errors.getErrors().length,
        recent: this.errors.getErrors().filter(e => 
          Date.now() - e.timestamp.getTime() < 3600000 // Last hour
        ).length,
        errorRate: this.errors.getErrorRate(),
        errorCounts: Object.fromEntries(this.errors.getErrorCounts()),
      },
      analytics: {
        totalEvents: this.analytics.getEvents().length,
        eventCounts: {
          'page_view': this.analytics.getEventCount('page_view'),
          'user_interaction': this.analytics.getEventCount('user_interaction'),
          'form_submission': this.analytics.getEventCount('form_submission'),
        },
      },
      health: this.health.getHealthStatus(),
      timestamp: new Date(),
    };
  }

  destroy() {
    this.performance.destroy();
    console.log('✅ Monitoring destroyed');
  }
}

// ✅ NEW: Global monitoring instance
export const monitoring = new MonitoringManager();

// ✅ NEW: Utility functions for easy monitoring
export const recordPerformance = (operation: string, duration: number, success: boolean, metadata?: Record<string, any>) => {
  monitoring.recordPerformance(operation, duration, success, metadata);
};

export const recordError = (error: Error, context: string, metadata?: Record<string, any>) => {
  monitoring.recordError(error, context, metadata);
};

export const trackEvent = (type: string, data: Record<string, any>) => {
  monitoring.trackEvent(type, data);
};

export const getMonitoringReport = () => {
  return monitoring.getReport();
};

// ✅ NEW: Performance measurement decorator
export const measurePerformance = (operation: string) => {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const start = performance.now();
      try {
        const result = originalMethod.apply(this, args);
        const duration = performance.now() - start;
        recordPerformance(operation, duration, true);
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        recordPerformance(operation, duration, false, { error: (error as Error).message });
        throw error;
      }
    };

    return descriptor;
  };
};

// ✅ NEW: Initialize monitoring
if (typeof window !== 'undefined') {
  monitoring.initialize();
} 