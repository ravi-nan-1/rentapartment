'use client';

import { useUser, useFirestore } from '@/firebase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import PersonalizedRecs from '@/components/dashboard/PersonalizedRecs';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user && firestore) {
        getDoc(doc(firestore, 'users', user.uid)).then(docSnap => {
            if (docSnap.exists()) {
                setProfile({ id: user.uid, ...docSnap.data() });
            }
        })
    }
  }, [user, firestore]);


  if (!profile) return null; // Layout handles loading/redirect

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {profile.name}!</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s new for you at Apartment Spot.</p>
      </div>

      {profile.role === 'user' && <PersonalizedRecs userProfile={profile} />}

      {profile.role === 'landlord' && (
        <Card>
          <CardHeader>
            <CardTitle>Landlord Dashboard</CardTitle>
            <CardDescription>Manage your listings and view your performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Your landlord-specific content goes here.</p>
          </CardContent>
        </Card>
      )}

      {profile.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>Oversee the platform, manage users, and listings.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Your admin-specific content goes here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
