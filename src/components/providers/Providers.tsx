import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/wagmi';
import { AuthProvider } from '@/contexts/AuthContext';
import { CursorProvider } from '@/contexts/CursorContext';

const queryClient = new QueryClient();

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CursorProvider>
            {children}
          </CursorProvider>
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}