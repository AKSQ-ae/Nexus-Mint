import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserPresence {
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  page_url: string;
  last_seen: string;
  is_active: boolean;
}

interface PresenceState {
  [key: string]: UserPresence[];
}

export function useRealTimePresence(channelName: string = 'global') {
  const { user } = useAuth();
  const [presenceState, setPresenceState] = useState<PresenceState>({});
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [currentUserPresence, setCurrentUserPresence] = useState<UserPresence | null>(null);

  // Update user session in database
  const updateUserSession = useCallback(async (pageUrl: string, isActive: boolean = true) => {
    if (!user?.id) return;

    try {
      const sessionData = {
        user_id: user.id,
        session_id: `${user.id}-${Date.now()}`,
        page_url: pageUrl,
        user_agent: navigator.userAgent,
        is_active: isActive,
        last_seen: new Date().toISOString()
      };

      await supabase
        .from('user_sessions')
        .upsert(sessionData, {
          onConflict: 'user_id,session_id'
        });
    } catch (error) {
      console.error('Error updating user session:', error);
    }
  }, [user?.id]);

  // Track user presence
  const trackPresence = useCallback(async (metadata: Partial<UserPresence> = {}) => {
    if (!user?.id) return;

    const presence = {
      user_id: user.id,
      display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
      avatar_url: user.user_metadata?.avatar_url,
      page_url: window.location.pathname,
      last_seen: new Date().toISOString(),
      is_active: true,
      ...metadata
    };

    setCurrentUserPresence(presence);
    
    // Update database session
    await updateUserSession(presence.page_url, presence.is_active);

    return presence;
  }, [user, updateUserSession]);

  // Setup real-time presence
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase.channel(channelName);

    // Track initial presence
    trackPresence();

    // Subscribe to presence events
    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState() as any;
        setPresenceState(newState);
        
        // Flatten presence state to get all online users
        const users: UserPresence[] = [];
        Object.keys(newState).forEach(key => {
          const presences = newState[key] as any[];
          users.push(...(presences.filter(p => p.user_id) as UserPresence[]));
        });
        
        setOnlineUsers(users.filter(u => u.is_active));
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;
        
        const presence = await trackPresence();
        if (presence) {
          await channel.track(presence);
        }
      });

    // Track page visibility changes
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      trackPresence({ is_active: isVisible });
    };

    // Track page navigation
    const handleBeforeUnload = () => {
      trackPresence({ is_active: false });
    };

    // Track page changes for SPA
    const handleLocationChange = () => {
      trackPresence({ page_url: window.location.pathname });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleLocationChange);

    // Periodic presence update
    const presenceInterval = setInterval(() => {
      if (!document.hidden) {
        trackPresence();
      }
    }, 30000); // Update every 30 seconds

    return () => {
      // Mark user as inactive before leaving
      trackPresence({ is_active: false });
      
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleLocationChange);
      clearInterval(presenceInterval);
    };
  }, [user?.id, channelName, trackPresence]);

  // Get users on specific page
  const getUsersOnPage = useCallback((pageUrl: string) => {
    return onlineUsers.filter(u => u.page_url === pageUrl);
  }, [onlineUsers]);

  // Get user count by page
  const getPageUserCounts = useCallback(() => {
    const counts: Record<string, number> = {};
    onlineUsers.forEach(user => {
      counts[user.page_url] = (counts[user.page_url] || 0) + 1;
    });
    return counts;
  }, [onlineUsers]);

  return {
    presenceState,
    onlineUsers,
    currentUserPresence,
    trackPresence,
    getUsersOnPage,
    getPageUserCounts,
    totalOnlineUsers: onlineUsers.length,
  };
}