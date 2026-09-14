import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

let appInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;
let firestoreInitialized = false;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: [],
    },
    operationType,
    path,
  };
  console.error('[Firestore Error]:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function loadConfig() {
  if (process.env.FIREBASE_CONFIG) {
    try {
      return JSON.parse(process.env.FIREBASE_CONFIG);
    } catch {}
  }
  if (process.env.FIREBASE_API_KEY && (process.env.FIREBASE_PROJECT_ID || process.env.PROJECT_ID)) {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.PROJECT_ID;
    return {
      apiKey: process.env.FIREBASE_API_KEY,
      projectId,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
      firestoreDatabaseId: process.env.FIRESTORE_DATABASE_ID || process.env.FIREBASE_DATABASE_ID || '(default)',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
      appId: process.env.FIREBASE_APP_ID || '',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    };
  }
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[Firestore] Could not load firebase-applet-config.json:', err);
  }
  return null;
}

export function getFirestoreDb(): Firestore | null {
  if (firestoreInitialized) {
    return firestoreInstance;
  }
  firestoreInitialized = true;

  try {
    const config = loadConfig();
    if (!config || !config.apiKey || !config.projectId) {
      console.warn('[Firestore] No valid Firebase configuration found.');
      return null;
    }

    const apps = getApps();
    appInstance = apps.length > 0 ? apps[0] : initializeApp(config);

    if (config.firestoreDatabaseId) {
      firestoreInstance = getFirestore(appInstance, config.firestoreDatabaseId);
    } else {
      firestoreInstance = getFirestore(appInstance);
    }

    console.log(`[Firestore] Initialized official Firebase SDK (Project: ${config.projectId}, Database: ${config.firestoreDatabaseId || '(default)'})`);
    return firestoreInstance;
  } catch (err) {
    console.error('[Firestore] Initialization error:', err);
    firestoreInstance = null;
    return null;
  }
}
