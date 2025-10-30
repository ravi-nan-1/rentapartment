'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';


const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  role: z.enum(['user', 'landlord'], { required_error: 'Please select a role.' }),
});

export default function SignUpForm() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Seed admin user for demonstration purposes
    const seedAdmin = async () => {
        if (!auth || !firestore) return;
        
        const adminEmail = 'admin@apartmentspot.com';
        const adminPassword = 'adminpass';
        const adminName = 'Admin User';

        try {
            // Temporarily sign out any active user to check for admin
            const currentUser = auth.currentUser;
            if(currentUser) await signOut(auth);

            try {
                await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
                await signOut(auth);
                return;
            } catch(e) {
                // Admin does not exist, proceed to create
            }

            const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
            const user = userCredential.user;

            await updateProfile(user, { displayName: adminName });

            await setDoc(doc(firestore, "users", user.uid), {
                name: adminName,
                email: adminEmail,
                role: 'admin',
                favoriteApartmentIds: [],
            });
            
            // Sign out the newly created admin user so the current user can proceed
            await signOut(auth);

        } catch (error) {
            if (error instanceof FirebaseError && error.code !== 'auth/email-already-in-use') {
                console.error("Failed to seed admin user:", error);
            }
            if(auth.currentUser) await signOut(auth);
        }
    }
    seedAdmin();
  }, [auth, firestore])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (!auth || !firestore) {
        setIsLoading(false);
        toast({
            variant: "destructive",
            title: "Sign-up Error",
            description: "Firebase is not configured. Please try again later.",
        });
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: values.name });

        const userData: any = {
            name: values.name,
            email: values.email,
            role: values.role,
        };

        if (values.role === 'user') {
            userData.favoriteApartmentIds = [];
        }

        await setDoc(doc(firestore, "users", user.uid), userData);

        toast({ title: 'Signup Successful', description: `Welcome, ${values.name}!` });
        router.push('/dashboard');

    } catch (error) {
        let description = "An unknown error occurred. Please try again.";
        if (error instanceof FirebaseError) {
            if (error.code === 'auth/email-already-in-use') {
                description = "This email is already in use. Please try another one.";
            } else {
                description = error.message;
            }
        }
        toast({ variant: 'destructive', title: 'Signup Failed', description });
    } finally {
        setIsLoading(false);
    }
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>I am a...</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="user">User (looking for an apartment)</SelectItem>
                  <SelectItem value="landlord">Landlord (listing an apartment)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading} style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign Up
        </Button>
      </form>
    </Form>
  );
}
