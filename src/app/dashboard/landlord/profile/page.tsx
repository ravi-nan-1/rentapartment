'use client';

import ProfileForm from '@/components/profile/ProfileForm';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';


export default function LandlordProfilePage() {
    const { user, loading } = useAuth();

    if (loading || !user || user.role !== 'landlord') {
         return (
            <div className="space-y-8">
                <div>
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-5 w-80 mt-2" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                         <Skeleton className="h-4 w-64 mt-2" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                           <Skeleton className="h-20 w-20 rounded-full" />
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }


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
