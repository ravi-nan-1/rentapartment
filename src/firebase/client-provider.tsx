'use client';

import { initializeFirebase, FirebaseProvider } from '@/firebase';
import { ReactNode } from 'react';

const { firebaseApp, firestore, auth } = initializeFirebase();

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      firestore={firestore}
      auth={auth}
    >
      {children}
    </FirebaseProvider>
  );
}
