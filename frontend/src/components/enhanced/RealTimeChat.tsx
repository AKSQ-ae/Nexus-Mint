import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Users, 
  MoreVertical,
  Reply,
  Smile
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  message: string;
  message_type: string;
  attachments: any[];
  reply_to?: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  property_id?: string;
  created_by: string;
  created_at: string;
}

interface RealTimeChatProps {
  roomId?: string;
  propertyId?: string;
  className?: string;
}

export function RealTimeChat({ roomId, propertyId, className }: RealTimeChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [participants, setParticipants] = useState<any[]>([]);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch or create chat room
  useEffect(() => {
    if (!user?.id) return;

    const setupChatRoom = async () => {
      try {
        let room: ChatRoom | null = null;

        if (roomId) {
          // Fetch existing room
          const { data, error } = await supabase
            .from('chat_rooms')
            .select('*')
            .eq('id', roomId)
            .single();
          
          if (error) throw error;
          room = data;
        } else if (propertyId) {
          // Find or create property chat room
          const { data: existingRoom } = await supabase
            .from('chat_rooms')
            .select('*')
            .eq('property_id', propertyId)
            .eq('is_public', true)
            .single();

          if (existingRoom) {
            room = existingRoom;
          } else {
            // Create new property chat room
            const { data: property } = await supabase
              .from('properties')
              .select('title')
              .eq('id', propertyId)
              .single();

            const { data: newRoom, error } = await supabase
              .from('chat_rooms')
              .insert({
                name: `${property?.title || 'Property'} Discussion`,
                description: 'Discuss this property with other investors',
                is_public: true,
                property_id: propertyId,
                created_by: user.id
              })
              .select()
              .single();

            if (error) throw error;
            room = newRoom;
          }
        }

        if (room) {
          setCurrentRoom(room);
          
          // Join the room
          await supabase
            .from('chat_room_participants')
            .upsert({
              room_id: room.id,
              user_id: user.id,
              joined_at: new Date().toISOString(),
              is_active: true
            });

          // Fetch messages with simplified query
          const { data: roomMessages, error: messagesError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('room_id', room.id)
            .order('created_at', { ascending: true })
            .limit(100);

          if (messagesError) throw messagesError;

          // Transform messages with user info
          const messagesWithUsers = await Promise.all(
            (roomMessages || []).map(async (msg) => {
              const { data: userProfile } = await supabase
                .from('user_profiles')
                .select('full_name, avatar_url')
                .eq('id', msg.user_id)
                .single();

              return {
                ...msg,
                attachments: Array.isArray(msg.attachments) ? msg.attachments : [],
                user_name: userProfile?.full_name || 'Unknown User',
                user_avatar: userProfile?.avatar_url
              } as ChatMessage;
            })
          );

          setMessages(messagesWithUsers);

          // Fetch participants count
          const { data: roomParticipants } = await supabase
            .from('chat_room_participants')
            .select('user_id')
            .eq('room_id', room.id)
            .eq('is_active', true);

          setParticipants(roomParticipants || []);
        }
      } catch (error) {
        console.error('Error setting up chat room:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chat room',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    setupChatRoom();
  }, [roomId, propertyId, user?.id]);

  // Setup real-time subscription for messages
  useEffect(() => {
    if (!currentRoom?.id) return;

    const channel = supabase
      .channel(`chat-room-${currentRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${currentRoom.id}`,
        },
        async (payload) => {
          const newMessage = payload.new as any;
          
          // Fetch user profile for the new message
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('full_name, avatar_url')
            .eq('id', newMessage.user_id)
            .single();

          const messageWithUser: ChatMessage = {
            ...newMessage,
            attachments: Array.isArray(newMessage.attachments) ? newMessage.attachments : [],
            user_name: userProfile?.full_name || 'Unknown User',
            user_avatar: userProfile?.avatar_url
          };

          setMessages(prev => [...prev, messageWithUser]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRoom?.id]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentRoom?.id || !user?.id) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: currentRoom.id,
          user_id: user.id,
          message: newMessage.trim(),
          message_type: 'text',
          reply_to: replyTo?.id || null
        });

      if (error) throw error;

      setNewMessage('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  // Handle enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentRoom) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Chat room not available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <CardTitle className="text-lg">{currentRoom.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {participants.length}
            </Badge>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {currentRoom.description && (
          <p className="text-sm text-muted-foreground">{currentRoom.description}</p>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Messages */}
        <ScrollArea className="h-96 px-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.user_avatar} />
                  <AvatarFallback>
                    {message.user_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {message.user_name || 'Unknown User'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {message.reply_to && (
                    <div className="bg-muted p-2 rounded mb-2 text-xs">
                      Replying to previous message
                    </div>
                  )}
                  
                  <div className="text-sm text-foreground break-words">
                    {message.message}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setReplyTo(message)}
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      <Smile className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Reply indicator */}
        {replyTo && (
          <div className="px-4 py-2 bg-muted/50 border-t flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Replying to {replyTo.user_name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyTo(null)}
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Message input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}