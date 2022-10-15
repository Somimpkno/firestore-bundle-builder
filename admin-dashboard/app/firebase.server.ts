import { initializeApp, getApps, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { QuerySnapshot } from "firebase-admin/firestore";
import type { Bundle } from "./types";

const projectId = process.env.PROJECT_ID;
const bundlesCollectionPath = process.env.BUNDLESPEC_COLLECTION || "bundles";

if (getApps().length === 0) {
  if (!projectId) {
    throw new Error(
      "Missing PROJECT_ID environment variable. Please provide a .env file with the PROJECT_ID variable."
    );
  }

  initializeApp({
    projectId,
    credential: applicationDefault(),
  });
}

const firestore = getFirestore();

// Converts a Firestore document to a plain object.
function documentToObject<T>(
  document: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>
): T {
  return {
    ...document.data(),
    id: document.id,
  } as T;
}

// Converts a Firestore document to an array.
function snapshotToArray<T>(snapshot: QuerySnapshot): T[] {
  return snapshot.docs.map((doc) => documentToObject<T>(doc));
}

export async function getBundles(): Promise<Bundle[]> {
  const snapshot = await firestore.collection(bundlesCollectionPath).get();
  return snapshotToArray<Bundle>(snapshot);
}

export async function getBundle(id: string): Promise<Bundle | null> {
  const snapshot = await firestore
    .collection(bundlesCollectionPath)
    .doc(id)
    .get();

  if (!snapshot.exists) {
    return null;
  }

  return documentToObject<Bundle>(snapshot);
}

export async function createBundle(id: string, data: any): Promise<void> {
  await firestore.collection(bundlesCollectionPath).doc(id).set(data);
}
