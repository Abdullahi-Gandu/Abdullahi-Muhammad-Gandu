/**
 * Automated Push Notification Service for Power House Dispatch
 * Supports Desktop PC notifications and Android Chrome/PWA push notifications with vibration patterns.
 */

export interface NotificationStatus {
  supported: boolean;
  permission: NotificationPermission;
}

export class DispatchNotificationManager {
  private hasWarnedPermission = false;

  public getStatus(): NotificationStatus {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { supported: false, permission: 'denied' };
    }
    return {
      supported: true,
      permission: Notification.permission,
    };
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return Notification.permission;
    }
  }

  /**
   * Dispatch an automated push notification for critical outages and events
   */
  public async sendAlert(options: {
    title: string;
    body: string;
    severity?: 'CRITICAL' | 'WARNING' | 'INFO';
    tag?: string;
    requireInteraction?: boolean;
    data?: Record<string, unknown>;
  }): Promise<boolean> {
    const { title, body, severity = 'CRITICAL', tag, requireInteraction = true, data } = options;

    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission !== 'granted') {
      if (!this.hasWarnedPermission) {
        console.warn('Dispatch Notifications: Permission is', Notification.permission);
        this.hasWarnedPermission = true;
      }
      return false;
    }

    const iconUrl = '/icon.svg';
    // Haptic vibration patterns for Android devices
    const vibrationPattern =
      severity === 'CRITICAL'
        ? [300, 150, 300, 150, 500, 200, 500] // urgent pulse
        : [150, 100, 150];

    try {
      // If service worker is available (e.g., in PWA mode on Android / PC), prefer showNotification
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          if (reg && reg.showNotification) {
            await reg.showNotification(`⚡ ${title}`, {
              body,
              icon: iconUrl,
              badge: iconUrl,
              tag: tag || `dispatch-${Date.now()}`,
              requireInteraction,
              vibrate: vibrationPattern,
              data: {
                timestamp: new Date().toISOString(),
                ...data,
              },
            } as NotificationOptions);
            return true;
          }
        } catch {
          // Fall back to standard Notification constructor
        }
      }

      // Standard desktop/mobile Notification constructor
      const notif = new Notification(`⚡ ${title}`, {
        body,
        icon: iconUrl,
        tag: tag || `dispatch-${Date.now()}`,
        requireInteraction: severity === 'CRITICAL',
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };

      return true;
    } catch (err) {
      console.error('Failed to trigger push notification:', err);
      return false;
    }
  }
}

export const dispatchNotifier = new DispatchNotificationManager();
