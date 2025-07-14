import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TOKONavigationEngine, UserContext } from '@/components/ai/TOKONavigationEngine';
import { supabase } from '@/integrations/supabase/client';

interface ChatContextValue {
  userContext: UserContext;
  tokoEngine: TOKONavigationEngine | null;
  isInitialized: boolean;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [userContext, setUserContext] = useState<UserContext>({
    isAuthenticated: false,
    currentPage: '/',
    hasKyc: false,
    hasInvestments: false
  });
  const [tokoEngine, setTokoEngine] = useState<TOKONavigationEngine | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function initializeChat() {
      try {
        console.log('ChatContext: Initializing...');
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        // Get current page path
        const currentPage = window.location.pathname;
        
        // Initialize user context
        let ctx: UserContext = {
          isAuthenticated: !!user,
          currentPage,
          hasKyc: false,
          hasInvestments: false
        };

        // If user is authenticated, get their data
        if (user) {
          try {
            // Check KYC status
            const { data: kycDocs } = await supabase
              .from('kyc_documents')
              .select('status')
              .eq('user_id', user.id)
              .eq('status', 'approved');
            
            ctx.hasKyc = (kycDocs?.length || 0) > 0;

            // Check investments
            const { data: investments } = await supabase
              .from('investments')
              .select('id')
              .eq('user_id', user.id);
            
            ctx.hasInvestments = (investments?.length || 0) > 0;

            console.log('ChatContext: User context loaded', ctx);
          } catch (error) {
            console.error('ChatContext: Error loading user data', error);
          }
        }

        setUserContext(ctx);
        
        // Initialize TOKO engine with navigate function
        // We'll create a mock navigate function since this is in global context
        const mockNavigate = (path: string) => {
          window.location.href = path;
        };
        const engine = new TOKONavigationEngine(mockNavigate as any, ctx);
        setTokoEngine(engine);
        setIsInitialized(true);
        
        console.log('ChatContext: Initialization complete');
      } catch (error) {
        console.error('ChatContext: Initialization failed', error);
        setIsInitialized(true); // Still mark as initialized to prevent infinite loading
      }
    }

    initializeChat();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('ChatContext: Auth state changed', event);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        // Reinitialize on auth changes
        initializeChat();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update current page when location changes
  useEffect(() => {
    const updateCurrentPage = () => {
      const currentPage = window.location.pathname;
      setUserContext(prev => ({ ...prev, currentPage }));
      if (tokoEngine) {
        tokoEngine.updateContext({ currentPage });
      }
    };

    // Listen for navigation changes
    window.addEventListener('popstate', updateCurrentPage);
    
    return () => {
      window.removeEventListener('popstate', updateCurrentPage);
    };
  }, [userContext, tokoEngine]);

  const value: ChatContextValue = {
    userContext,
    tokoEngine,
    isInitialized
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

export function useChatSafe(): ChatContextValue | null {
  return useContext(ChatContext);
}