import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db as _db } from './firebase';
import type { SpreadsheetDocument, CellData, CellMap, UserProfile } from './types';
import { DEFAULT_ROW_COUNT, DEFAULT_COL_COUNT, generateId } from './utils';

// db is always initialized when these functions are called (client-side only)
const db = _db!;

// ─── User Profile ───────────────────────────────────────────────────────────

export async function createUserProfile(profile: UserProfile): Promise<void> {
  await setDoc(doc(db, 'users', profile.uid), profile);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(db, 'users', uid), data);
}

// ─── Documents ──────────────────────────────────────────────────────────────

export async function createDocument(
  ownerId: string,
  ownerName: string,
  title = 'Untitled Spreadsheet'
): Promise<string> {
  const id = generateId();
  const docData: SpreadsheetDocument = {
    id,
    title,
    ownerId,
    ownerName,
    sharedWith: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    rowCount: DEFAULT_ROW_COUNT,
    colCount: DEFAULT_COL_COUNT,
  };
  await setDoc(doc(db, 'documents', id), docData);
  return id;
}

export async function getDocument(id: string): Promise<SpreadsheetDocument | null> {
  const snap = await getDoc(doc(db, 'documents', id));
  return snap.exists() ? (snap.data() as SpreadsheetDocument) : null;
}

export function subscribeToDocument(
  id: string,
  callback: (doc: SpreadsheetDocument | null) => void
) {
  return onSnapshot(doc(db, 'documents', id), (snap) => {
    callback(snap.exists() ? (snap.data() as SpreadsheetDocument) : null);
  });
}

export async function updateDocument(
  id: string,
  data: Partial<SpreadsheetDocument>
): Promise<void> {
  await updateDoc(doc(db, 'documents', id), { ...data, updatedAt: Date.now() });
}

export async function deleteDocument(id: string): Promise<void> {
  await deleteDoc(doc(db, 'documents', id));
}

export function subscribeToUserDocuments(
  userId: string,
  callback: (docs: SpreadsheetDocument[]) => void
) {
  const q = query(
    collection(db, 'documents'),
    where('ownerId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map((d) => d.data() as SpreadsheetDocument);
    callback(docs);
  });
}

// ─── Cells ──────────────────────────────────────────────────────────────────

export async function updateCell(
  docId: string,
  cellId: string,
  data: Partial<CellData>,
  userId: string
): Promise<void> {
  const cellRef = doc(db, 'documents', docId, 'cells', cellId);
  await setDoc(cellRef, {
    ...data,
    updatedBy: userId,
    updatedAt: Date.now(),
  }, { merge: true });
  // Also bump the document's updatedAt
  await updateDoc(doc(db, 'documents', docId), { updatedAt: Date.now() });
}

export async function updateCellsBatch(
  docId: string,
  cells: Record<string, Partial<CellData>>,
  userId: string
): Promise<void> {
  const batch = writeBatch(db);
  for (const [id, data] of Object.entries(cells)) {
    const cellRef = doc(db, 'documents', docId, 'cells', id);
    batch.set(cellRef, { ...data, updatedBy: userId, updatedAt: Date.now() }, { merge: true });
  }
  batch.update(doc(db, 'documents', docId), { updatedAt: Date.now() });
  await batch.commit();
}

export function subscribeToCells(
  docId: string,
  callback: (cells: CellMap, hasPendingWrites: boolean) => void
) {
  return onSnapshot(collection(db, 'documents', docId, 'cells'), (snap) => {
    const cells: CellMap = {};
    snap.docs.forEach((d) => {
      cells[d.id] = d.data() as CellData;
    });
    callback(cells, snap.metadata.hasPendingWrites);
  });
}

export async function getCells(docId: string): Promise<CellMap> {
  const snap = await getDocs(collection(db, 'documents', docId, 'cells'));
  const cells: CellMap = {};
  snap.docs.forEach((d) => {
    cells[d.id] = d.data() as CellData;
  });
  return cells;
}
