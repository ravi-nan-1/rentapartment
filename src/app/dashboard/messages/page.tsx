'use client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import apiFetch from '@/lib/api';
import type { Chat } from '@/lib/types';

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
    const { user } = useAuth();
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchChats = async () => {
                try {
                    setLoading(true);
                    const data = await apiFetch('/chats');
                    setChats(data || []);
                } catch (error) {
                    console.error("Failed to fetch chats:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchChats();
        }
    }, [user]);

    const getOtherParticipant = (chat: Chat) => {
        return chat.participants.find(p => p.id !== user?.id);
    }

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
                    {!loading && chats.length === 0 && (
                         <div className="text-center py-12 text-muted-foreground">
                            <MessageSquare className="mx-auto h-12 w-12" />
                            <p className="mt-4">You have no messages yet.</p>
                        </div>
                    )}
                    <div className="space-y-2">
                        {chats.map(chat => {
                            const otherParticipant = getOtherParticipant(chat);
                            return (
                                <Link key={chat.id} href={`/dashboard/messages/${chat.id}`} passHref>
                                    <div className="block p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={otherParticipant?.profile_picture_url} alt={otherParticipant?.name} />
                                                <AvatarFallback>{otherParticipant?.name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold">{otherParticipant?.name}</p>
                                                        <p className="text-sm text-muted-foreground truncate max-w-sm">{chat.last_message_content}</p>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                                                        {chat.last_message_timestamp ? formatDistanceToNow(new Date(chat.last_message_timestamp), { addSuffix: true }) : ''}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Regarding: <span className="font-medium text-primary">{chat.apartment_title}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
