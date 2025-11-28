'use client';
import { useAuth } from '@/hooks/useAuth';
import { useParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';
import apiFetch from '@/lib/api';
import type { Chat, Message, User, Apartment } from '@/lib/types';


function ChatLoadingSkeleton() {
    return (
        <Card className="h-[calc(100vh-12rem)] flex flex-col">
            <CardHeader className="flex flex-row items-center gap-4 border-b">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex items-end gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-12 w-48 rounded-lg" />
                </div>
                <div className="flex items-end justify-end gap-2">
                    <Skeleton className="h-16 w-64 rounded-lg" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
                <div className="flex items-end gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
            </CardContent>
            <CardFooter className="border-t p-4">
                 <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    );
}

export default function ChatPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const chatId = params.id as string;

    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const otherParticipant = chat?.participants.find((p) => p.id !== user?.id);
    const apartment = chat?.apartment;

    useEffect(() => {
        if (!chatId) return;

        const fetchChatData = async () => {
            try {
                setLoading(true);
                const [chatData, messagesData] = await Promise.all([
                    apiFetch(`/chats/${chatId}`),
                    apiFetch(`/chats/${chatId}/messages`)
                ]);
                setChat(chatData);
                setMessages(messagesData || []);
            } catch (error) {
                console.error("Failed to fetch chat data:", error);
                setChat(null);
            } finally {
                setLoading(false);
            }
        };

        fetchChatData();
    }, [chatId]);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !chatId) return;

        try {
            const sentMessage = await apiFetch(`/chats/${chatId}/messages`, {
                method: 'POST',
                body: JSON.stringify({ content: newMessage }),
                 headers: { 'Content-Type': 'application/json' },
            });
            setMessages(prev => [...prev, sentMessage]);
            setNewMessage('');
            if (chat) {
                setChat({...chat, last_message_content: newMessage, last_message_timestamp: new Date().toISOString() });
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };
    
    if (loading) {
        return <ChatLoadingSkeleton />;
    }

    if (!chat) {
        return <div className="text-center py-12">Chat not found.</div>;
    }

    return (
        <div className="space-y-8">
             <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Messages
            </Button>
            <Card className="h-[calc(100vh-16rem)] flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4 border-b">
                    <Avatar className="h-12 w-12">
                         <AvatarImage src={otherParticipant?.profile_picture_url} alt={otherParticipant?.name} />
                        <AvatarFallback>{otherParticipant?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{otherParticipant?.name}</CardTitle>
                        <CardDescription>
                            Regarding: <Link href={`/apartments/${apartment?.id}`} className="hover:underline text-primary font-medium">{apartment?.title}</Link>
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages?.map(msg => (
                        <div key={msg.id} className={cn("flex items-end gap-2", msg.sender_id === user?.id ? 'justify-end' : '')}>
                            {msg.sender_id !== user?.id && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={otherParticipant?.profile_picture_url} alt={otherParticipant?.name} />
                                    <AvatarFallback>{otherParticipant?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}
                             <div className={cn("max-w-md rounded-lg px-4 py-2", msg.sender_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                <p className="text-sm">{msg.content}</p>
                                <p className={cn("text-xs mt-1", msg.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground/70')}>
                                     {msg.created_at ? format(new Date(msg.created_at), 'p') : ''}
                                </p>
                            </div>
                             {msg.sender_id === user?.id && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.profile_picture_url || undefined} alt={user?.name || ''} />
                                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </CardContent>
                <CardFooter className="border-t p-4">
                    <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            autoComplete="off"
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
