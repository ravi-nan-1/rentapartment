'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null; // Layout handles loading/redirect

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s new for you at Apartment Spot.</p>
      </div>

      {user.role === 'user' && (
         <Card>
          <CardHeader>
            <CardTitle>User Dashboard</CardTitle>
            <CardDescription>Your personal apartment hunting dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Navigate to your favorites or profile using the sidebar.</p>
          </CardContent>
        </Card>
      )}

      {user.role === 'landlord' && (
        <Card>
          <CardHeader>
            <CardTitle>Landlord Dashboard</CardTitle>
            <CardDescription>Manage your listings and view your performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You can manage your listings from the sidebar.</p>
          </CardContent>
        </Card>
      )}

      {user.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>Oversee the platform, manage users, and listings.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You have access to all management panels.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
