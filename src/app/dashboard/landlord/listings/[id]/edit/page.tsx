'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ListingForm from '@/components/landlord/ListingForm';
import { notFound, useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import type { Apartment } from '@/lib/types';
import apiFetch from '@/lib/api';
import PhotoUploader from '@/components/landlord/PhotoUploader';

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
            </div>
        </div>
    )
}


export default function EditListingPage() {
    const params = useParams();
    const id = params.id as string;
    const [apartment, setApartment] = useState<Apartment | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchApartment = async () => {
        try {
            setLoading(true);
            const data = await apiFetch(`/apartments/${id}`);
            setApartment(data);
        } catch (error) {
            console.error("Failed to fetch apartment", error);
            setApartment(null); // Triggers notFound()
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        fetchApartment();
    }, [id]);
  
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
                <p className="text-muted-foreground">Update your apartment details and manage photos.</p>
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Apartment Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ListingForm apartment={apartment} />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Manage Photos</CardTitle>
                            <CardDescription>Upload and manage photos for your listing.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PhotoUploader apartment={apartment} onUploadSuccess={fetchApartment} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
