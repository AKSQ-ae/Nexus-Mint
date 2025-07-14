import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Volume2, VolumeX, MessageSquare, Loader2 } from 'lucide-react';
import { AudioRecorder, AudioQueue, encodeAudioForAPI } from '@/utils/audioUtils';
import { cn } from '@/lib/utils';

interface VoiceMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTranscript?: boolean;
}

interface VoiceInterfaceProps {
  className?: string;
  onMessage?: (message: VoiceMessage) => void;
}

export function VoiceInterface({ className, onMessage }: VoiceInterfaceProps) {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [assistantTranscript, setAssistantTranscript] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionStartedRef = useRef(false);

  // Initialize audio context
  useEffect(() => {
    const initAudioContext = async () => {
      try {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        audioQueueRef.current = new AudioQueue(audioContextRef.current);
        console.log('Audio context initialized successfully');
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    };

    initAudioContext();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const addMessage = useCallback((message: Omit<VoiceMessage, 'id' | 'timestamp'>) => {
    const newMessage: VoiceMessage = {
      ...message,
      id: Math.random().toString(36),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    onMessage?.(newMessage);
  }, [onMessage]);

  const handleAudioData = useCallback((audioData: Float32Array) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && isRecording && audioData.length > 0) {
      try {
        const base64Audio = encodeAudioForAPI(audioData);
        wsRef.current.send(JSON.stringify({
          type: 'input_audio_buffer.append',
          audio: base64Audio
        }));
      } catch (error) {
        console.error('Error encoding/sending audio:', error);
      }
    }
  }, [isRecording]);

  const startConversation = async () => {
    if (connectionStatus !== 'disconnected') return;

    try {
      setConnectionStatus('connecting');
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Connect to WebSocket with proper URL
      const wsUrl = `wss://qncfxkgjydeiefyhyllk.functions.supabase.co/realtime-voice-chat`;
      console.log('Connecting to:', wsUrl);
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Connected to voice chat');
        setIsConnected(true);
        setConnectionStatus('connected');
        sessionStartedRef.current = false;
        
        toast({
          title: "Voice Chat Connected",
          description: "AI TOKO is ready to speak with you!",
        });
      };

      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data.type, data);

        switch (data.type) {
          case 'session.created':
            console.log('Session created');
            sessionStartedRef.current = true;
            startRecording();
            break;

          case 'session.updated':
            console.log('Session updated');
            break;

          case 'input_audio_buffer.speech_started':
            console.log('User started speaking');
            setCurrentTranscript('');
            break;

          case 'input_audio_buffer.speech_stopped':
            console.log('User stopped speaking');
            break;

          case 'conversation.item.input_audio_transcription.completed':
            console.log('User transcript:', data.transcript);
            setCurrentTranscript(data.transcript);
            addMessage({
              type: 'user',
              content: data.transcript,
              isTranscript: true
            });
            break;

          case 'response.created':
            console.log('AI response started');
            setIsSpeaking(true);
            setAssistantTranscript('');
            // Clear any pending audio to prevent overlapping
            if (audioQueueRef.current) {
              audioQueueRef.current.clear();
            }
            break;

          case 'response.audio.delta':
            if (audioQueueRef.current && !isMuted && data.delta) {
              try {
                const binaryString = atob(data.delta);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                await audioQueueRef.current.addToQueue(bytes);
              } catch (error) {
                console.error('Error processing audio delta:', error);
              }
            }
            break;

          case 'response.audio_transcript.delta':
            setAssistantTranscript(prev => prev + data.delta);
            break;

          case 'response.audio.done':
            console.log('AI response audio done');
            setIsSpeaking(false);
            break;

          case 'response.done':
            console.log('AI response complete');
            if (assistantTranscript.trim()) {
              addMessage({
                type: 'assistant',
                content: assistantTranscript.trim(),
                isTranscript: true
              });
              setAssistantTranscript('');
            }
            break;

          case 'error':
            console.error('OpenAI error:', data);
            toast({
              title: "Voice Chat Error",
              description: data.error || "An error occurred",
              variant: "destructive"
            });
            break;
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to voice chat",
          variant: "destructive"
        });
        setConnectionStatus('disconnected');
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        setConnectionStatus('disconnected');
        setIsSpeaking(false);
        stopRecording();
      };

    } catch (error) {
      console.error('Error starting conversation:', error);
      setConnectionStatus('disconnected');
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const startRecording = async () => {
    if (!audioContextRef.current || isRecording) return;

    try {
      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      audioRecorderRef.current = new AudioRecorder(handleAudioData);
      await audioRecorderRef.current.start();
      setIsRecording(true);
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not start recording. Please try again.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      audioRecorderRef.current = null;
    }
    setIsRecording(false);
  };

  const endConversation = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    stopRecording();
    if (audioQueueRef.current) {
      audioQueueRef.current.clear();
    }
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setIsSpeaking(false);
    setCurrentTranscript('');
    setAssistantTranscript('');
    sessionStartedRef.current = false;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioQueueRef.current && isMuted) {
      // Clear audio queue when unmuting to avoid backlog
      audioQueueRef.current.clear();
    }
  };

  const pauseRecording = () => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.pause();
      setIsRecording(false);
    }
  };

  const resumeRecording = () => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.resume();
      setIsRecording(true);
    }
  };

  return (
    <Card className={cn("p-6 bg-card border shadow-lg", className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse"></div>
          <h3 className="text-lg font-semibold">AI TOKO Voice Chat</h3>
          {isSpeaking && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Volume2 className="w-4 h-4 animate-pulse" />
              Speaking...
            </div>
          )}
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2 text-sm">
          <div className={cn(
            "w-2 h-2 rounded-full",
            connectionStatus === 'connected' && "bg-green-500",
            connectionStatus === 'connecting' && "bg-yellow-500 animate-pulse",
            connectionStatus === 'disconnected' && "bg-red-500"
          )}></div>
          <span className="text-muted-foreground">
            {connectionStatus === 'connected' && 'Connected'}
            {connectionStatus === 'connecting' && 'Connecting...'}
            {connectionStatus === 'disconnected' && 'Disconnected'}
          </span>
        </div>

        {/* Current Transcripts */}
        {(currentTranscript || assistantTranscript) && (
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            {currentTranscript && (
              <div className="text-sm">
                <span className="font-medium text-primary">You:</span> {currentTranscript}
              </div>
            )}
            {assistantTranscript && (
              <div className="text-sm">
                <span className="font-medium text-accent">AI TOKO:</span> {assistantTranscript}
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2 justify-center">
          {!isConnected ? (
            <Button 
              onClick={startConversation}
              disabled={connectionStatus === 'connecting'}
              className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
            >
              {connectionStatus === 'connecting' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
              {connectionStatus === 'connecting' ? 'Connecting...' : 'Start Voice Chat'}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={isRecording ? pauseRecording : resumeRecording}
                variant={isRecording ? "destructive" : "secondary"}
                size="sm"
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              
              <Button
                onClick={toggleMute}
                variant={isMuted ? "destructive" : "secondary"}
                size="sm"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              
              <Button
                onClick={endConversation}
                variant="outline"
                size="sm"
              >
                End Chat
              </Button>
            </div>
          )}
        </div>

        {/* Status indicators */}
        {isConnected && (
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isRecording ? "bg-red-500 animate-pulse" : "bg-gray-400"
              )}></div>
              {isRecording ? 'Listening' : 'Paused'}
            </div>
            <div className="flex items-center gap-1">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isSpeaking ? "bg-blue-500 animate-pulse" : "bg-gray-400"
              )}></div>
              {isSpeaking ? 'AI Speaking' : 'AI Silent'}
            </div>
          </div>
        )}

        {/* Recent Messages */}
        {messages.length > 0 && (
          <div className="mt-4 max-h-48 overflow-y-auto space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              Recent Conversation
            </h4>
            {messages.slice(-3).map((message) => (
              <div key={message.id} className="text-xs p-2 rounded bg-muted/30">
                <div className="font-medium text-primary">
                  {message.type === 'user' ? 'You' : 'AI TOKO'}:
                </div>
                <div className="text-muted-foreground">{message.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}