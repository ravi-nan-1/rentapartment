'use client';

import ProfileForm from '@/components/profile/ProfileForm';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LandlordProfilePage() {
    const { user } = useAuth();
    if (!user || user.role !== 'landlord') return null;

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
                    <ProfileForm user={user} />
                </CardContent>
            </Card>
        </div>
    );
}
