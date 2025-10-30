'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminSettingsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">System Settings</h1>
                <p className="text-muted-foreground">Configure platform-wide settings and integrations.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Manage general settings for the application.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="appName">Application Name</Label>
                        <Input id="appName" defaultValue="Apartment Spot" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="supportEmail">Support Email</Label>
                        <Input id="supportEmail" type="email" defaultValue="support@apartmentspot.com" />
                    </div>
                     <Button>Save Settings</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>API Keys & Integrations</CardTitle>
                    <CardDescription>Manage third-party API keys and service integrations.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="googleMapsApiKey">Google Maps API Key</Label>
                        <Input id="googleMapsApiKey" type="password" defaultValue="......." />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="genkitApiKey">Genkit AI API Key</Label>
                        <Input id="genkitApiKey" type="password" defaultValue="......." />
                    </div>
                     <Button>Save API Keys</Button>
                </CardContent>
            </Card>
        </div>
    );
}
