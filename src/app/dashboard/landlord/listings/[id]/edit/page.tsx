'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ListingForm from '@/components/landlord/ListingForm';
import AIAssistant from '@/components/landlord/AIAssistant';
import { apartments } from '@/lib/data';
import { notFound } from 'next/navigation';

export default function EditListingPage({ params }: { params: { id: string } }) {
    const apartment = apartments.find((apt) => apt.id === params.id);
  
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
