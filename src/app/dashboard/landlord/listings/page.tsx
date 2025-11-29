'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useMemo, useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import apiFetch from '@/lib/api';
import type { Apartment } from '@/lib/types';

export default function ManageListingsPage() {
  const { toast } = useToast();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLandlordApartments = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/landlord/apartments');
      setApartments(data);
    } catch(error) {
      console.error("Failed to fetch landlord apartments", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch your listings.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLandlordApartments();
  }, []);

  const handleDelete = async (apartmentId: string) => {
    try {
      await apiFetch(`/apartments/${apartmentId}`, { method: 'DELETE' });
      toast({
        title: "Listing Deleted",
        description: "The apartment listing has been successfully removed.",
      });
      fetchLandlordApartments(); // Refresh the list
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem deleting the listing.",
      });
    }
  };

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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Loading your listings...
                  </TableCell>
                </TableRow>
              ) : apartments && apartments.length > 0 ? (
                apartments.map(apt => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">{apt.title}</TableCell>
                    <TableCell>
                       <Badge variant={new Date(apt.availability_date) > new Date() ? 'outline' : 'default'} className={new Date(apt.availability_date) <= new Date() ? 'bg-green-500 text-white' : ''}>
                        {new Date(apt.availability_date) > new Date() ? `Available ${new Date(apt.availability_date).toLocaleDateString()}` : 'Available'}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{apt.price.toLocaleString()}</TableCell>
                    <TableCell>{apt.address}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
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
                            <DropdownMenuSeparator />
                             <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this apartment listing
                                and remove its data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(apt.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    You haven't listed any apartments yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
