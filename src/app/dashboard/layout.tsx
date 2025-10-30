'use client';

import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Building2, LayoutDashboard, User, LogOut, Home, PlusCircle, Settings, Users, Shield, MessageSquare, Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';


function LoadingSkeleton() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Building2 className="h-16 w-16 animate-pulse text-primary" />
        <p className="text-muted-foreground">Loading Your Dashboard...</p>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<'user' | 'landlord' | 'admin' | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    } else if(user && firestore && !role) {
      getDoc(doc(firestore, 'users', user.uid)).then(docSnap => {
        if (docSnap.exists()) {
            setRole(docSnap.data().role);
        }
      })
    }
  }, [user, loading, router, firestore, role]);

  if (loading || !user || !role) {
    return <LoadingSkeleton />;
  }

  const handleLogout = async () => {
    if(auth) {
        await signOut(auth);
        router.push('/');
    }
  };

  const commonLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  ];

  const userLinks = [
    ...commonLinks,
    { href: '/dashboard/favorites', label: 'My Favorites', icon: Heart },
    { href: '/dashboard/profile', label: 'My Profile', icon: User },
  ];

  const landlordLinks = [
    ...commonLinks,
    { href: '/dashboard/landlord/listings', label: 'My Listings', icon: Home },
    { href: '/dashboard/landlord/listings/new', label: 'New Listing', icon: PlusCircle },
    { href: '/dashboard/landlord/profile', label: 'My Profile', icon: Settings },
  ];
  
  const adminLinks = [
      ...commonLinks,
    { href: '/dashboard/admin/users', label: 'Manage Users', icon: Users },
    { href: '/dashboard/admin/listings', label: 'Manage Listings', icon: Home },
    { href: '/dashboard/admin/settings', label: 'System Settings', icon: Shield },
  ];

  let navLinks;
  switch (role) {
    case 'user':
      navLinks = userLinks;
      break;
    case 'landlord':
      navLinks = landlordLinks;
      break;
    case 'admin':
      navLinks = adminLinks;
      break;
    default:
      navLinks = [];
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Building2 className="size-7 text-primary pulse-logo" />
            <span className="text-lg font-semibold">Apartment Spot</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navLinks.map((link) => (
              <SidebarMenuItem key={link.href}>
                <Link href={link.href} passHref legacyBehavior>
                  <SidebarMenuButton isActive={pathname === link.href}>
                    <link.icon />
                    {link.label}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut />
                Logout
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center justify-between border-b px-4 lg:hidden">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary">
                <Building2 className="h-6 w-6 pulse-logo" />
                <span>Apartment Spot</span>
            </Link>
          <SidebarTrigger />
        </header>
        <div className="p-4 sm:p-6 lg:p-8 fade-in">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
