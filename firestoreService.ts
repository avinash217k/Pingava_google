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

/**
 * Saves current application state to Firestore with a debounce to prevent excessive writes.
 */
export function scheduleStateSaveToFirestore(state: PersistentStoreState) {
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
  }

  saveDebounceTimer = setTimeout(async () => {
    saveDebounceTimer = null;
    const db = getFirestoreDb();
    if (!db) return;

    try {
      // Clean up checks to keep recent ones (e.g. last 150) to keep Firestore writes swift and within free tier limits
      const prunedChecks = (state.checks || []).slice(0, 150);
      const prunedAlerts = (state.alertDeliveries || []).slice(0, 50);

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
      const duration = Date.now() - writeStart;
      observability.recordFirestoreWrite(duration, true);
      console.log(`[Firestore] Synchronized state to cloud database successfully (${duration}ms).`);
    } catch (err: any) {
      observability.recordFirestoreWrite(0, false, err?.message || String(err));
      if (err?.code === 'permission-denied' || String(err).includes('permission')) {
        handleFirestoreError(err, OperationType.WRITE, FULL_DOC_PATH);
      }
      console.error('[Firestore] Failed to save state to Firestore:', err);
    }
  }, 1500);
}
