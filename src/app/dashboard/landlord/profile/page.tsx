'use client';

import ProfileForm from '@/components/profile/ProfileForm';
import { useUser, useFirestore } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';

export default function LandlordProfilePage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        if (user && firestore) {
            getDoc(doc(firestore, 'users', user.uid)).then(docSnap => {
                if (docSnap.exists()) {
                    setProfile({ id: docSnap.id, ...docSnap.data() });
                }
            })
        }
    }, [user, firestore]);

    if (!profile || profile.role !== 'landlord') return null;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Landlord Profile</h1>
                <p className="text-muted-foreground">Manage your public profile and contact information.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Your Information</CardTitle>
                    <CardDescription>This information will be used to contact you about your listings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProfileForm user={profile} />
                </CardContent>
            </Card>
        </div>
    );
}
