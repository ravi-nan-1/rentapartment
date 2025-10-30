'use client';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function ChatListSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function MessagesPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [chatsWithDetails, setChatsWithDetails] = useState<any[]>([]);

    const chatsQuery = useMemo(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'chats'),
            where('participantIds', 'array-contains', user.uid),
            orderBy('lastMessageTimestamp', 'desc')
        );
    }, [user, firestore]);

    const { data: chats, loading } = useCollection(chatsQuery);

    useEffect(() => {
        if (chats && firestore && user) {
            const fetchChatDetails = async () => {
                const detailedChats = await Promise.all(
                    chats.map(async (chat) => {
                        const otherParticipantId = chat.participantIds.find((id: string) => id !== user.uid);
                        
                        const [otherUserSnap, apartmentSnap] = await Promise.all([
                            getDoc(doc(firestore, 'users', otherParticipantId)),
                            getDoc(doc(firestore, 'apartments', chat.apartmentId))
                        ]);

                        return {
                            ...chat,
                            otherUser: otherUserSnap.exists() ? otherUserSnap.data() : null,
                            apartment: apartmentSnap.exists() ? apartmentSnap.data() : null,
                        };
                    })
                );
                setChatsWithDetails(detailedChats);
            };
            fetchChatDetails();
        }
    }, [chats, firestore, user]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Messages</h1>
                <p className="text-muted-foreground">Your conversations about apartment listings.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Conversations</CardTitle>
                    <CardDescription>Select a conversation to view messages.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading && <ChatListSkeleton />}
                    {!loading && chatsWithDetails.length === 0 && (
                         <div className="text-center py-12 text-muted-foreground">
                            <MessageSquare className="mx-auto h-12 w-12" />
                            <p className="mt-4">You have no messages yet.</p>
                        </div>
                    )}
                    <div className="space-y-2">
                        {chatsWithDetails.map(chat => (
                            <Link key={chat.id} href={`/dashboard/messages/${chat.id}`} passHref>
                                <div className="block p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={chat.otherUser?.profilePictureUrl} alt={chat.otherUser?.name} />
                                            <AvatarFallback>{chat.otherUser?.name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">{chat.otherUser?.name}</p>
                                                    <p className="text-sm text-muted-foreground truncate max-w-sm">{chat.lastMessage}</p>
                                                </div>
                                                <p className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {chat.lastMessageTimestamp ? formatDistanceToNow(chat.lastMessageTimestamp.toDate(), { addSuffix: true }) : ''}
                                                </p>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Regarding: <span className="font-medium text-primary">{chat.apartment?.title}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
