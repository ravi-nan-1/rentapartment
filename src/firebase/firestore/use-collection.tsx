'use client';

import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, Query, DocumentData } from 'firebase/firestore';

interface UseCollectionResult<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
}

// Custom hook to memoize Firestore queries/references
function useMemoFirebase<T>(value: T | null, dependencies: any[]): T | null {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => value, dependencies);
}


export function useCollection<T extends DocumentData>(
  q: Query<T> | null
): UseCollectionResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const memoizedQuery = useMemoFirebase(q, [q]);

  useEffect(() => {
    if (!memoizedQuery) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      memoizedQuery,
      (querySnapshot) => {
        const docs = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as T));
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching collection:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedQuery]);

  return { data, loading, error };
}
