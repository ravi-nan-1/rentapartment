'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ListingForm from '@/components/landlord/ListingForm';

export default function NewListingPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Create a New Listing</h1>
                <p className="text-muted-foreground">Fill out the form below to list your apartment.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Apartment Details</CardTitle>
                    <CardDescription>Provide as much detail as possible to attract the right tenants.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ListingForm />
                </CardContent>
            </Card>
        </div>
    );
}
