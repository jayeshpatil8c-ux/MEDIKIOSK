import fs from 'node:fs';
import path from 'node:path';
import type { Appointment, AuditEvent, NotificationItem, OPDToken, Patient, Prescription, Referral } from './types.js';

export interface PersistedCollections {
  patients: Patient[];
  appointments: Appointment[];
  opdTokens: OPDToken[];
  prescriptions: Prescription[];
  referrals: Referral[];
  auditTrail: AuditEvent[];
  notifications: NotificationItem[];
}

export class PersistentRepository {
  private inMemoryState: PersistedCollections | null = null;
  private readonly filePath = path.join(process.cwd(), 'medikiosk-data.json');

  async initialize(): Promise<PersistedCollections | null> {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        this.inMemoryState = JSON.parse(data);
        console.log('[AI Studio] PersistentRepository loaded state from disk');
        return this.inMemoryState;
      }
    } catch (err) {
      console.warn('[AI Studio] Could not read local persistence file, using in-memory state:', err);
    }
    console.log('[AI Studio] PersistentRepository initialized in memory');
    return null;
  }

  async save(state: PersistedCollections): Promise<void> {
    this.inMemoryState = state;
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[AI Studio] Could not save state to local disk:', err);
    }
  }

  async close(): Promise<void> {
    // Safe shutdown
  }
}

