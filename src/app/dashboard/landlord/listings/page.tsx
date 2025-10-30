'use client';

import { useUser } from '@/firebase';
import { apartments } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function ManageListingsPage() {
  const { user } = useUser();
  // In a real app, user.uid would be used. Using a static ID for now.
  const landlordApartments = apartments.filter(apt => apt.landlordId === 'user2');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Listings</h1>
          <p className="text-muted-foreground">View, edit, and manage your apartment listings.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/landlord/listings/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Listing
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Apartments</CardTitle>
          <CardDescription>A list of all apartments you currently have listed on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {landlordApartments.map(apt => (
                <TableRow key={apt.id}>
                  <TableCell className="font-medium">{apt.title}</TableCell>
                  <TableCell>
                    <Badge variant={apt.availabilityDate === 'available' ? 'default' : 'outline'} className={apt.availabilityDate === 'available' ? 'bg-green-500 text-white' : ''}>
                      {new Date(apt.availabilityDate) > new Date() || apt.availabilityDate === 'available' ? 'Available' : 'Rented'}
                    </Badge>
                  </TableCell>
                  <TableCell>${apt.price.toLocaleString()}</TableCell>
                  <TableCell>{apt.location.address}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild><Link href={`/apartments/${apt.id}`}>View Listing</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href={`/dashboard/landlord/listings/${apt.id}/edit`}>Edit</Link></DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {landlordApartments.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              You haven&apos;t listed any apartments yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
