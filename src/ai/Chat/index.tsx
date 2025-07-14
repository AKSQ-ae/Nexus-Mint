// Export all chat components for easier imports
export { ChatProvider, useChat, useChatSafe } from './ChatContext';
export { FloatingChatWidget } from './FloatingChatWidget';
export { default as ChatInterface } from './ChatInterface';
export { MessageList } from './MessageList';
export { MessageBubble } from './MessageBubble';
export { MessageInput } from './MessageInput';
export { HeaderControls } from './HeaderControls';
export { useApi } from './useApi';
export { default as performanceMonitor } from './ChatPerformanceMonitor';

// Types
export type { Message } from './useApi';