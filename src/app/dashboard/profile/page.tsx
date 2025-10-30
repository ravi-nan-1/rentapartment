'use client';

import ProfileForm from '@/components/profile/ProfileForm';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UserProfilePage() {
    const { user } = useAuth();
    if (!user) return null;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground">View and edit your personal information.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>Update your name, contact information, and profile picture.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProfileForm user={user} />
                </CardContent>
            </Card>
        </div>
    );
}
