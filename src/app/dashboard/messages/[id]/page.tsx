'use client';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, doc, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';

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
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const params = useParams();
    const chatId = params.id as string;
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const chatRef = useMemo(() => {
        if (!firestore || !chatId) return null;
        return doc(firestore, 'chats', chatId);
    }, [firestore, chatId]);

    const { data: chat, loading: chatLoading } = useDoc(chatRef);
    
    const messagesQuery = useMemo(() => {
        if (!chatRef) return null;
        return query(collection(chatRef, 'messages'), orderBy('timestamp', 'asc'));
    }, [chatRef]);

    const { data: messages, loading: messagesLoading } = useCollection(messagesQuery);

    const otherParticipantId = useMemo(() => chat?.participantIds.find((id: string) => id !== user?.uid), [chat, user]);
    
    const otherUserRef = useMemo(() => {
        if(!firestore || !otherParticipantId) return null;
        return doc(firestore, 'users', otherParticipantId);
    }, [firestore, otherParticipantId]);
    const {data: otherUser, loading: otherUserLoading} = useDoc(otherUserRef);

    const apartmentRef = useMemo(() => {
         if(!firestore || !chat?.apartmentId) return null;
        return doc(firestore, 'apartments', chat.apartmentId);
    }, [firestore, chat]);
    const {data: apartment, loading: apartmentLoading} = useDoc(apartmentRef);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !chatRef) return;

        const messageData = {
            text: newMessage,
            senderId: user.uid,
            timestamp: serverTimestamp(),
        };

        try {
            await addDoc(collection(chatRef, 'messages'), messageData);
            await updateDoc(chatRef, {
                lastMessage: newMessage,
                lastMessageTimestamp: serverTimestamp(),
            });
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };
    
    const loading = chatLoading || messagesLoading || otherUserLoading || apartmentLoading;

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
                         <AvatarImage src={otherUser?.profilePictureUrl} alt={otherUser?.name} />
                        <AvatarFallback>{otherUser?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{otherUser?.name}</CardTitle>
                        <CardDescription>
                            Regarding: <Link href={`/apartments/${apartment?.id}`} className="hover:underline text-primary font-medium">{apartment?.title}</Link>
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages?.map(msg => (
                        <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === user?.uid ? 'justify-end' : '')}>
                            {msg.senderId !== user?.uid && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={otherUser?.profilePictureUrl} alt={otherUser?.name} />
                                    <AvatarFallback>{otherUser?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}
                             <div className={cn("max-w-md rounded-lg px-4 py-2", msg.senderId === user?.uid ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                <p className="text-sm">{msg.text}</p>
                                <p className={cn("text-xs mt-1", msg.senderId === user?.uid ? 'text-primary-foreground/70' : 'text-muted-foreground/70')}>
                                     {msg.timestamp ? format(msg.timestamp.toDate(), 'p') : ''}
                                </p>
                            </div>
                             {msg.senderId === user?.uid && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || ''} />
                                    <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
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
