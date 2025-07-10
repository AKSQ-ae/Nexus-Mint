import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfills
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock environment variables for testing
process.env.SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_ANON_KEY = 'test-anon-key'

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
  }),
}))

// Mock Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      })),
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: [], error: null })),
      insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
      update: jest.fn(() => Promise.resolve({ data: [], error: null })),
      delete: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
}))

// Mock RainbowKit
jest.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: () => <button>Connect Wallet</button>,
  RainbowKitProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock wagmi
jest.mock('wagmi', () => ({
  WagmiProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Menu: () => <div>Menu</div>,
  X: () => <div>X</div>,
  Building2: () => <div>Building2</div>,
  LogOut: () => <div>LogOut</div>,
  User: () => <div>User</div>,
  Settings: () => <div>Settings</div>,
  Briefcase: () => <div>Briefcase</div>,
}))