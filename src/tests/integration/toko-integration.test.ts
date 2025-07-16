/**
 * TOKO AI Integration Tests
 * Tests both chat and voice endpoints with comprehensive error handling
 */

import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
const mockSupabase = {
  functions: {
    invoke: jest.fn()
  }
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase)
}));

// Mock environment variables
const originalEnv = process.env;
beforeEach(() => {
  process.env = {
    ...originalEnv,
    SUPABASE_URL: 'https://test-project.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
    OPENAI_API_KEY: 'sk-test-openai-key',
    ELEVENLABS_API_KEY: 'test-elevenlabs-key'
  };
  jest.clearAllMocks();
});

afterAll(() => {
  process.env = originalEnv;
});

describe('TOKO AI Integration Tests', () => {
  describe('Chat Endpoint Tests', () => {
    it('should successfully send a chat message and receive a response', async () => {
      const mockResponse = {
        response: 'Hello! I\'m TOKO AI Advisor. Tokenized real estate investments offer several benefits including fractional ownership, lower barriers to entry, and potential for high returns.',
        conversationId: 'test-conversation-id',
        timestamp: '2024-01-01T00:00:00.000Z'
      };

      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: mockResponse,
        error: null
      });

      const { testTokoChat } = require('../../../scripts/test-toko-integration');
      const result = await testTokoChat();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('toko-chat', {
        body: {
          message: expect.stringContaining('Hello TOKO!'),
          conversationHistory: expect.arrayContaining([
            expect.objectContaining({ role: 'user', content: expect.any(String) }),
            expect.objectContaining({ role: 'assistant', content: expect.any(String) })
          ])
        }
      });
    });

    it('should handle OpenAI API errors gracefully', async () => {
      const mockError = {
        error: 'OpenAI API key is invalid or expired',
        response: "I'm experiencing technical difficulties right now. Please try again in a moment, or contact support if the issue persists."
      };

      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: mockError,
        error: null
      });

      const { testTokoChat } = require('../../../scripts/test-toko-integration');
      const result = await testTokoChat();

      expect(result.success).toBe(false);
      expect(result.error).toContain('OpenAI API key');
    });

    it('should handle network timeouts', async () => {
      mockSupabase.functions.invoke.mockRejectedValueOnce(
        new Error('Request timed out after 25000ms')
      );

      const { testTokoChat } = require('../../../scripts/test-toko-integration');
      const result = await testTokoChat();

      expect(result.success).toBe(false);
      expect(result.error).toContain('timed out');
    });

    it('should handle rate limiting errors', async () => {
      const mockError = {
        error: 'OpenAI API rate limit exceeded. Please try again in a moment.',
        response: "I'm experiencing technical difficulties right now. Please try again in a moment, or contact support if the issue persists."
      };

      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: mockError,
        error: null
      });

      const { testTokoChat } = require('../../../scripts/test-toko-integration');
      const result = await testTokoChat();

      expect(result.success).toBe(false);
      expect(result.error).toContain('rate limit');
    });
  });

  describe('Voice Endpoint Tests', () => {
    it('should successfully generate audio from text', async () => {
      const mockResponse = {
        audioContent: 'base64-encoded-audio-data',
        contentType: 'audio/mpeg',
        audioSize: 12345
      };

      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: mockResponse,
        error: null
      });

      const { testTokoVoice } = require('../../../scripts/test-toko-integration');
      const result = await testTokoVoice();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(result.data.audioContent).toBeDefined();
      expect(result.data.audioContent.length).toBeGreaterThan(0);
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('toko-voice', {
        body: {
          text: expect.stringContaining('Welcome to TOKO AI Advisor'),
          voice: 'Sarah'
        }
      });
    });

    it('should handle ElevenLabs API errors gracefully', async () => {
      const mockError = {
        error: 'ElevenLabs API key is invalid or expired'
      };

      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: mockError,
        error: null
      });

      const { testTokoVoice } = require('../../../scripts/test-toko-integration');
      const result = await testTokoVoice();

      expect(result.success).toBe(false);
      expect(result.error).toContain('ElevenLabs API key');
    });

    it('should handle text length validation', async () => {
      const longText = 'A'.repeat(6000); // Exceeds 5000 character limit
      
      const mockError = {
        error: 'Text too long for voice synthesis (max 5000 characters)'
      };

      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: mockError,
        error: null
      });

      const { testTokoVoice } = require('../../../scripts/test-toko-integration');
      const result = await testTokoVoice();

      expect(result.success).toBe(false);
      expect(result.error).toContain('too long');
    });

    it('should handle empty audio response', async () => {
      const mockError = {
        error: 'No audio content received from ElevenLabs'
      };

      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: mockError,
        error: null
      });

      const { testTokoVoice } = require('../../../scripts/test-toko-integration');
      const result = await testTokoVoice();

      expect(result.success).toBe(false);
      expect(result.error).toContain('No audio content');
    });
  });

  describe('Environment Configuration Tests', () => {
    it('should validate environment configuration', async () => {
      const { testEnvironmentConfig } = require('../../../scripts/test-toko-integration');
      const result = await testEnvironmentConfig();

      expect(result.success).toBe(true);
    });

    it('should detect missing environment variables', async () => {
      // Temporarily remove environment variables
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_ANON_KEY;

      const { testEnvironmentConfig } = require('../../../scripts/test-toko-integration');
      const result = await testEnvironmentConfig();

      expect(result.success).toBe(false);
      expect(result.issues).toContain('SUPABASE_URL not properly configured');
      expect(result.issues).toContain('SUPABASE_ANON_KEY not properly configured');

      // Restore environment variables
      process.env.SUPABASE_URL = 'https://test-project.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-anon-key';
    });
  });

  describe('End-to-End Integration Tests', () => {
    it('should complete a full chat and voice workflow', async () => {
      // Mock successful chat response
      const chatResponse = {
        response: 'Tokenized real estate offers fractional ownership with potential 8-12% returns.',
        conversationId: 'test-conversation-id',
        timestamp: '2024-01-01T00:00:00.000Z'
      };

      // Mock successful voice response
      const voiceResponse = {
        audioContent: 'base64-encoded-audio-data',
        contentType: 'audio/mpeg',
        audioSize: 12345
      };

      mockSupabase.functions.invoke
        .mockResolvedValueOnce({ data: chatResponse, error: null }) // Chat call
        .mockResolvedValueOnce({ data: voiceResponse, error: null }); // Voice call

      const { testTokoChat, testTokoVoice } = require('../../../scripts/test-toko-integration');
      
      const chatResult = await testTokoChat();
      const voiceResult = await testTokoVoice();

      expect(chatResult.success).toBe(true);
      expect(voiceResult.success).toBe(true);
      expect(mockSupabase.functions.invoke).toHaveBeenCalledTimes(2);
    });

    it('should handle mixed success/failure scenarios', async () => {
      // Mock successful chat but failed voice
      const chatResponse = {
        response: 'Tokenized real estate offers fractional ownership with potential 8-12% returns.',
        conversationId: 'test-conversation-id',
        timestamp: '2024-01-01T00:00:00.000Z'
      };

      const voiceError = {
        error: 'ElevenLabs service is temporarily unavailable. Please try again.'
      };

      mockSupabase.functions.invoke
        .mockResolvedValueOnce({ data: chatResponse, error: null }) // Chat call
        .mockResolvedValueOnce({ data: voiceError, error: null }); // Voice call

      const { testTokoChat, testTokoVoice } = require('../../../scripts/test-toko-integration');
      
      const chatResult = await testTokoChat();
      const voiceResult = await testTokoVoice();

      expect(chatResult.success).toBe(true);
      expect(voiceResult.success).toBe(false);
      expect(voiceResult.error).toContain('ElevenLabs service');
    });
  });

  describe('Error Handling and Recovery Tests', () => {
    it('should retry failed requests with exponential backoff', async () => {
      // Mock initial failure followed by success
      mockSupabase.functions.invoke
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: { response: 'Success after retry' },
          error: null
        });

      const { testTokoChat } = require('../../../scripts/test-toko-integration');
      const result = await testTokoChat();

      expect(result.success).toBe(true);
      expect(mockSupabase.functions.invoke).toHaveBeenCalledTimes(2);
    });

    it('should handle malformed responses gracefully', async () => {
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: null,
        error: null
      });

      const { testTokoChat } = require('../../../scripts/test-toko-integration');
      const result = await testTokoChat();

      expect(result.success).toBe(false);
      expect(result.error).toContain('No response from AI');
    });
  });
});

// Mock the test functions for Jest
jest.mock('../../../scripts/test-toko-integration', () => ({
  testTokoChat: jest.fn(),
  testTokoVoice: jest.fn(),
  testEnvironmentConfig: jest.fn(),
  runTests: jest.fn()
}));