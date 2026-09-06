import Database from 'better-sqlite3';
import { Pool } from 'pg';
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

type CollectionName = keyof PersistedCollections;
const collections: CollectionName[] = ['patients', 'appointments', 'opdTokens', 'prescriptions', 'referrals', 'auditTrail', 'notifications'];
const tableFor: Record<CollectionName, string> = {
  patients: 'patients',
  appointments: 'appointments',
  opdTokens: 'queue',
  prescriptions: 'doctor_notes',
  referrals: 'documents',
  auditTrail: 'audit_events',
  notifications: 'safety_flags',
};

export class PersistentRepository {
  private sqlite: Database.Database | null = null;
  private postgres: Pool | null = null;
  private readonly databaseUrl = process.env.DATABASE_URL?.trim();
  private readonly sqliteFile = process.env.SQLITE_FILE || 'data/medikiosk.sqlite';

  async initialize(): Promise<PersistedCollections | null> {
    if (this.databaseUrl) {
      this.postgres = new Pool({ connectionString: this.databaseUrl, ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false } });
      await this.postgres.query('SELECT 1');
      await this.createPostgresSchema();
      return this.loadPostgres();
    }

    this.sqlite = new Database(this.sqliteFile);
    this.createSqliteSchema();
    return this.loadSqlite();
  }

  async save(state: PersistedCollections): Promise<void> {
    if (this.postgres) {
      await this.savePostgres(state);
      return;
    }
    if (!this.sqlite) throw new Error('Persistent repository has not been initialized');
    const transaction = this.sqlite.transaction(() => {
      for (const collection of collections) {
        const table = tableFor[collection];
        this.sqlite!.prepare(`DELETE FROM ${table}`).run();
        const insert = this.sqlite!.prepare(`INSERT INTO ${table} (id, payload) VALUES (?, ?)`);
        for (const item of state[collection]) insert.run(this.entityId(collection, item), JSON.stringify(item));
      }
      this.sqlite!.exec('DELETE FROM patient_cases; DELETE FROM case_answers;');
      const caseInsert = this.sqlite!.prepare('INSERT INTO patient_cases (case_id, patient_id, status, created_at, updated_at, payload) VALUES (?, ?, ?, ?, ?, ?)');
      const answerInsert = this.sqlite!.prepare('INSERT INTO case_answers (id, case_id, answer_key, answer_value, updated_at) VALUES (?, ?, ?, ?, ?)');
      for (const patient of state.patients) {
        caseInsert.run(patient.id, patient.id, patient.status, patient.createdAt, patient.updatedAt, JSON.stringify(patient.symptoms || {}));
        for (const [key, value] of Object.entries(patient.symptoms?.structuredHistory || {})) answerInsert.run(`${patient.id}-${key}`, patient.id, key, JSON.stringify(value), patient.updatedAt);
      }
    });
    transaction();
  }

  async close(): Promise<void> {
    if (this.postgres) await this.postgres.end();
    this.sqlite?.close();
  }

  private entityId(collection: CollectionName, item: any): string {
    if (collection === 'auditTrail' || collection === 'notifications') return item.id;
    return item.id || item.patientId || item.tokenNumber;
  }

  private createSqliteSchema() {
    for (const collection of collections) this.sqlite!.exec(`CREATE TABLE IF NOT EXISTS ${tableFor[collection]} (id TEXT PRIMARY KEY, payload TEXT NOT NULL)`);
    this.sqlite!.exec('CREATE TABLE IF NOT EXISTS patient_cases (case_id TEXT PRIMARY KEY, patient_id TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, payload TEXT NOT NULL)');
    this.sqlite!.exec('CREATE TABLE IF NOT EXISTS case_answers (id TEXT PRIMARY KEY, case_id TEXT NOT NULL, answer_key TEXT NOT NULL, answer_value TEXT NOT NULL, updated_at TEXT NOT NULL)');
  }

  private async createPostgresSchema() {
    for (const collection of collections) await this.postgres!.query(`CREATE TABLE IF NOT EXISTS ${tableFor[collection]} (id TEXT PRIMARY KEY, payload JSONB NOT NULL)`);
    await this.postgres!.query('CREATE TABLE IF NOT EXISTS patient_cases (case_id TEXT PRIMARY KEY, patient_id TEXT NOT NULL, status TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL, payload JSONB NOT NULL)');
    await this.postgres!.query('CREATE TABLE IF NOT EXISTS case_answers (id TEXT PRIMARY KEY, case_id TEXT NOT NULL, answer_key TEXT NOT NULL, answer_value JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL)');
  }

  private loadSqlite(): PersistedCollections {
    const state = {} as PersistedCollections;
    for (const collection of collections) {
      const rows = this.sqlite!.prepare(`SELECT payload FROM ${tableFor[collection]}`).all() as Array<{ payload: string }>;
      state[collection] = rows.map((row) => JSON.parse(row.payload));
    }
    return state;
  }

  private async loadPostgres(): Promise<PersistedCollections> {
    const state = {} as PersistedCollections;
    for (const collection of collections) {
      const result = await this.postgres!.query(`SELECT payload FROM ${tableFor[collection]}`);
      state[collection] = result.rows.map((row) => row.payload);
    }
    return state;
  }

  private async savePostgres(state: PersistedCollections) {
    const client = await this.postgres!.connect();
    try {
      await client.query('BEGIN');
      for (const collection of collections) {
        const table = tableFor[collection];
        await client.query(`DELETE FROM ${table}`);
        for (const item of state[collection]) {
          await client.query(`INSERT INTO ${table} (id, payload) VALUES ($1, $2::jsonb)`, [this.entityId(collection, item), JSON.stringify(item)]);
        }
      }
      await client.query('DELETE FROM patient_cases');
      await client.query('DELETE FROM case_answers');
      for (const patient of state.patients) {
        await client.query('INSERT INTO patient_cases (case_id, patient_id, status, created_at, updated_at, payload) VALUES ($1, $2, $3, $4, $5, $6::jsonb)', [patient.id, patient.id, patient.status, patient.createdAt, patient.updatedAt, JSON.stringify(patient.symptoms || {})]);
        for (const [key, value] of Object.entries(patient.symptoms?.structuredHistory || {})) await client.query('INSERT INTO case_answers (id, case_id, answer_key, answer_value, updated_at) VALUES ($1, $2, $3, $4::jsonb, $5)', [`${patient.id}-${key}`, patient.id, key, JSON.stringify(value), patient.updatedAt]);
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
