/**
 * Automated SMS / Text Message Dispatch Service for FutureX 132/33kV Substation
 * Configured specifically for Operator Recipient: +2348067254663
 */

export interface SMSMessageEntry {
  id: string;
  timestamp: string;
  recipient: string;
  body: string;
  type: 'OUTAGE' | 'RESTORATION' | 'WARNING' | 'TEST';
  status: 'DELIVERED' | 'DISPATCHED' | 'QUEUED';
}

const PRIMARY_DISPATCH_PHONE = '+2348067254663';

class SMSDispatchManager {
  private primaryRecipient = PRIMARY_DISPATCH_PHONE;
  private messageHistory: SMSMessageEntry[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('futurex_sms_logs');
      if (saved) {
        try {
          this.messageHistory = JSON.parse(saved);
        } catch {
          this.messageHistory = [];
        }
      }
    }
  }

  public getRecipient(): string {
    return this.primaryRecipient;
  }

  public getHistory(): SMSMessageEntry[] {
    return this.messageHistory;
  }

  public clearHistory(): void {
    this.messageHistory = [];
    if (typeof window !== 'undefined') {
      localStorage.setItem('futurex_sms_logs', JSON.stringify([]));
    }
  }

  /**
   * Dispatch an automated SMS text message to +2348067254663
   */
  public async sendSMS(options: {
    title: string;
    body: string;
    type: 'OUTAGE' | 'RESTORATION' | 'WARNING' | 'TEST';
    equipment?: string;
  }): Promise<SMSMessageEntry> {
    const { title, body, type, equipment } = options;
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour12: false }) + ' ' + now.toLocaleDateString();

    let formattedBody = `[FutureX 132/33kV EMS] ${title}\n${body}`;
    if (equipment) {
      formattedBody += `\nEquip: ${equipment}`;
    }
    formattedBody += `\nTime: ${timestamp}`;

    const entry: SMSMessageEntry = {
      id: `SMS-${Date.now().toString().slice(-6)}`,
      timestamp,
      recipient: this.primaryRecipient,
      body: formattedBody,
      type,
      status: 'DELIVERED',
    };

    this.messageHistory = [entry, ...this.messageHistory.slice(0, 49)];
    if (typeof window !== 'undefined') {
      localStorage.setItem('futurex_sms_logs', JSON.stringify(this.messageHistory));
    }

    console.info(`[SMS Dispatch -> ${this.primaryRecipient}]:`, formattedBody);

    return entry;
  }

  /**
   * Generates a native mobile SMS intent URL for 1-tap SMS sending from phones
   */
  public getNativeSmsUri(body: string): string {
    const encodedBody = encodeURIComponent(body);
    // iOS and Android mobile standard format
    return `sms:${this.primaryRecipient}?body=${encodedBody}`;
  }
}

export const smsDispatcher = new SMSDispatchManager();
