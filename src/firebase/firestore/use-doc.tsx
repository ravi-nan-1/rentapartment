'use client';

import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, DocumentReference, DocumentData } from 'firebase/firestore';

interface UseDocResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// Custom hook to memoize Firestore queries/references
function useMemoFirebase<T>(value: T | null, dependencies: any[]): T | null {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => value, dependencies);
}

export function useDoc<T extends DocumentData>(
  ref: DocumentReference<T> | null
): UseDocResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const memoizedRef = useMemoFirebase(ref, [ref]);

  useEffect(() => {
    if (!memoizedRef) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      memoizedRef,
      (doc) => {
        if (doc.exists()) {
          setData({ ...doc.data(), id: doc.id } as T);
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching document:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedRef]);

  return { data, loading, error };
}
