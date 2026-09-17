import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirestoreDb, handleFirestoreError, OperationType } from './firestoreClient';
import { observability } from './observabilityService';

export interface PersistentStoreState {
  monitors?: any[];
  checks?: any[];
  incidents?: any[];
  unifiedIncidents?: any[];
  statusPageConfig?: any;
  statusSubscribers?: any[];
  webhooks?: any[];
  alertDeliveries?: any[];
  users?: any[];
  heartbeats?: any[];
  heartbeatPings?: any[];
}

const SETTINGS_DOC = 'global_state';
const COLLECTION_NAME = 'pingava_settings';
const FULL_DOC_PATH = `${COLLECTION_NAME}/${SETTINGS_DOC}`;

/**
 * Loads all persistent data from Firestore.
 * If Firestore is unavailable or empty, returns null.
 */
export async function loadStateFromFirestore(): Promise<PersistentStoreState | null> {
  const db = getFirestoreDb();
  if (!db) return null;

  try {
    const docRef = doc(db, COLLECTION_NAME, SETTINGS_DOC);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      console.log('[Firestore] No initial state found in database, will seed default data.');
      return null;
    }
    const data = snap.data() as PersistentStoreState;
    console.log(`[Firestore] Successfully loaded state from Firestore (${data.monitors?.length || 0} monitors).`);
    return data;
  } catch (err: any) {
    if (err?.code === 'permission-denied' || String(err).includes('permission')) {
      handleFirestoreError(err, OperationType.GET, FULL_DOC_PATH);
    }
    console.error('[Firestore] Error loading state from Firestore:', err);
    return null;
  }
}

let saveDebounceTimer: NodeJS.Timeout | null = null;
let lastFirestoreSaveTime = 0;
let isQuotaExhausted = false;
let quotaExhaustedLoggedAt = 0;

const ROUTINE_SAVE_THROTTLE_MS = 300_000; // 5 minutes between routine background checkpoints
const MUTATION_DEBOUNCE_MS = 2_000; // 2 seconds debounce for user mutations & state transitions

async function executeFirestoreWrite(state: PersistentStoreState) {
  saveDebounceTimer = null;
  const db = getFirestoreDb();
  if (!db) return;

  try {
    // Keep payload lean: last 80 checks and last 30 alert logs to minimize Firestore document size
    const prunedChecks = (state.checks || []).slice(0, 80);
    const prunedAlerts = (state.alertDeliveries || []).slice(0, 30);

    const rawPayload: PersistentStoreState = {
      monitors: state.monitors || [],
      checks: prunedChecks,
      incidents: state.incidents || [],
      unifiedIncidents: state.unifiedIncidents || [],
      statusPageConfig: state.statusPageConfig || {},
      statusSubscribers: state.statusSubscribers || [],
      webhooks: state.webhooks || [],
      alertDeliveries: prunedAlerts,
      users: state.users || [],
      heartbeats: state.heartbeats || [],
      heartbeatPings: state.heartbeatPings || [],
    };

    const payload = JSON.parse(JSON.stringify(rawPayload));

    const docRef = doc(db, COLLECTION_NAME, SETTINGS_DOC);
    const writeStart = Date.now();
    await setDoc(docRef, payload, { merge: true });
    lastFirestoreSaveTime = Date.now();
    isQuotaExhausted = false;
    const duration = Date.now() - writeStart;
    observability.recordFirestoreWrite(duration, true);
    console.log(`[Firestore] Synchronized state to cloud database successfully (${duration}ms).`);
  } catch (err: any) {
    const errMsg = String(err?.message || err);
    observability.recordFirestoreWrite(0, false, errMsg);

    if (err?.code === 'resource-exhausted' || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota exceeded')) {
      isQuotaExhausted = true;
      const now = Date.now();
      if (now - quotaExhaustedLoggedAt > 300_000) {
        quotaExhaustedLoggedAt = now;
        console.warn('[Firestore] Daily free-tier write quota reached. Routine persistence paused until reset. State remains safe in-memory.');
      }
      return;
    }

    if (err?.code === 'permission-denied' || errMsg.includes('permission')) {
      handleFirestoreError(err, OperationType.WRITE, FULL_DOC_PATH);
    }
    console.error('[Firestore] Failed to save state to Firestore:', errMsg);
  }
}

/**
 * Saves current application state to Firestore with intelligent tier-aware throttling:
 * - Critical mutations (monitor created/deleted, incident opened/resolved, user modified): saved within 2 seconds.
 * - Routine telemetry (scheduled 200 OK pings, heartbeat ticks): throttled to at most once per 5 minutes.
 * - Quota protection: catches RESOURCE_EXHAUSTED errors gracefully without spamming error logs.
 */
export function scheduleStateSaveToFirestore(state: PersistentStoreState, isCriticalMutation = true) {
  const now = Date.now();

  // If daily quota was exceeded, defer routine writes to avoid continuous backoff cascades
  if (isQuotaExhausted && !isCriticalMutation) {
    return;
  }

  // If this is just routine telemetry and a write happened recently, defer for the 5-minute checkpoint
  if (!isCriticalMutation && now - lastFirestoreSaveTime < ROUTINE_SAVE_THROTTLE_MS) {
    if (!saveDebounceTimer) {
      const remainingTime = Math.max(10_000, ROUTINE_SAVE_THROTTLE_MS - (now - lastFirestoreSaveTime));
      saveDebounceTimer = setTimeout(() => {
        void executeFirestoreWrite(state);
      }, remainingTime);
    }
    return;
  }

  // Critical mutation or routine interval expired: schedule immediate debounced save (2s)
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
  }
  saveDebounceTimer = setTimeout(() => {
    void executeFirestoreWrite(state);
  }, MUTATION_DEBOUNCE_MS);
}
