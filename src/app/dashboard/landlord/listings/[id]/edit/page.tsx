'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ListingForm from '@/components/landlord/ListingForm';
import AIAssistant from '@/components/landlord/AIAssistant';
import { useDoc } from '@/firebase/firestore/use-doc';
import { notFound } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

function EditListingLoading() {
    return (
        <div className="space-y-8">
             <div>
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-5 w-96 mt-2" />
            </div>
             <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Apartment Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-8">
                                <Skeleton className="h-40 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div>
                     <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-full mt-2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}


export default function EditListingPage({ params }: { params: { id: string } }) {
    const firestore = useFirestore();
    const apartmentRef = firestore ? doc(firestore, 'apartments', params.id) : null;
    const { data: apartment, loading } = useDoc(apartmentRef);
  
    if (loading) {
        return <EditListingLoading />;
    }

    if (!apartment) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Edit Listing</h1>
                <p className="text-muted-foreground">Update your apartment details and get AI-powered recommendations.</p>
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Apartment Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ListingForm apartment={apartment} />
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <AIAssistant apartment={apartment} />
                </div>
            </div>
        </div>
    );
}
