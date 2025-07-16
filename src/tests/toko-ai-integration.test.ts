import { supabase } from '@/integrations/supabase/client';

// Mock environment variables for testing
const mockEnvVars = {
  OPENAI_API_KEY: 'test-openai-key',
  ELEVENLABS_API_KEY: 'test-elevenlabs-key'
};

// Mock fetch for testing API calls
global.fetch = jest.fn();

describe('TOKO AI Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock environment variables
    Object.defineProperty(global, 'Deno', {
      value: {
        env: {
          get: (key: string) => mockEnvVars[key as keyof typeof mockEnvVars]
        }
      },
      writable: true
    });
  });

  describe('TOKO Chat Function', () => {
    it('should successfully call OpenAI API and return response', async () => {
      // Mock successful OpenAI response
      const mockOpenAIResponse = {
        choices: [{
          message: {
            content: 'Hello! I am TOKO AI Advisor, your real estate investment assistant.'
          }
        }]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOpenAIResponse)
      });

      const testMessage = 'Hello, can you help me with real estate investment?';
      const conversationHistory = [
        { role: 'user', content: 'Previous message' },
        { role: 'assistant', content: 'Previous response' }
      ];

      const { data, error } = await supabase.functions.invoke('toko-chat', {
        body: {
          message: testMessage,
          conversationHistory
        }
      });

      // Verify the API call was made correctly
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockEnvVars.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining(testMessage)
        })
      );

      // Verify response structure
      expect(error).toBeNull();
      expect(data).toHaveProperty('response');
      expect(data.response).toBe(mockOpenAIResponse.choices[0].message.content);
    });

    it('should handle OpenAI API errors gracefully', async () => {
      // Mock OpenAI API error
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: 'Invalid API key' } })
      });

      const { data, error } = await supabase.functions.invoke('toko-chat', {
        body: {
          message: 'Test message'
        }
      });

      expect(error).toBeTruthy();
      expect(error?.message).toContain('OpenAI API error');
    });

    it('should handle network timeouts', async () => {
      // Mock network timeout
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network timeout'));

      const { data, error } = await supabase.functions.invoke('toko-chat', {
        body: {
          message: 'Test message'
        }
      });

      expect(error).toBeTruthy();
    });

    it('should validate required environment variables', async () => {
      // Mock missing API key
      Object.defineProperty(global, 'Deno', {
        value: {
          env: {
            get: () => null
          }
        },
        writable: true
      });

      const { data, error } = await supabase.functions.invoke('toko-chat', {
        body: {
          message: 'Test message'
        }
      });

      expect(error).toBeTruthy();
      expect(error?.message).toContain('OPENAI_API_KEY is not configured');
    });
  });

  describe('TOKO Voice Function', () => {
    it('should successfully call ElevenLabs API and return audio', async () => {
      // Mock successful ElevenLabs response
      const mockAudioBuffer = new ArrayBuffer(1024);
      const mockBase64Audio = btoa(String.fromCharCode(...new Uint8Array(mockAudioBuffer)));

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockAudioBuffer)
      });

      const testText = 'Hello, this is a test message for voice synthesis.';
      const testVoice = 'Sarah';

      const { data, error } = await supabase.functions.invoke('toko-voice', {
        body: {
          text: testText,
          voice: testVoice
        }
      });

      // Verify the API call was made correctly
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': mockEnvVars.ELEVENLABS_API_KEY,
          },
          body: expect.stringContaining(testText)
        })
      );

      // Verify response structure
      expect(error).toBeNull();
      expect(data).toHaveProperty('audioContent');
      expect(data).toHaveProperty('contentType', 'audio/mpeg');
      expect(data.audioContent).toBe(mockBase64Audio);
    });

    it('should handle ElevenLabs API errors gracefully', async () => {
      // Mock ElevenLabs API error
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Invalid API key')
      });

      const { data, error } = await supabase.functions.invoke('toko-voice', {
        body: {
          text: 'Test text for voice synthesis'
        }
      });

      expect(error).toBeTruthy();
      expect(error?.message).toContain('ElevenLabs API error');
    });

    it('should handle network timeouts for voice synthesis', async () => {
      // Mock network timeout
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network timeout'));

      const { data, error } = await supabase.functions.invoke('toko-voice', {
        body: {
          text: 'Test text'
        }
      });

      expect(error).toBeTruthy();
    });

    it('should validate required environment variables for voice', async () => {
      // Mock missing API key
      Object.defineProperty(global, 'Deno', {
        value: {
          env: {
            get: () => null
          }
        },
        writable: true
      });

      const { data, error } = await supabase.functions.invoke('toko-voice', {
        body: {
          text: 'Test text'
        }
      });

      expect(error).toBeTruthy();
      expect(error?.message).toContain('ELEVENLABS_API_KEY is not configured');
    });

    it('should validate required text input', async () => {
      const { data, error } = await supabase.functions.invoke('toko-voice', {
        body: {
          text: ''
        }
      });

      expect(error).toBeTruthy();
      expect(error?.message).toContain('Text is required for voice synthesis');
    });
  });

  describe('Frontend Integration', () => {
    it('should handle chat widget message sending', async () => {
      // Mock successful chat response
      const mockChatResponse = {
        response: 'Hello! I am TOKO AI Advisor.',
        conversationId: 'test-conversation-id',
        timestamp: new Date().toISOString()
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChatResponse)
      });

      // Simulate the frontend API call
      const { data, error } = await supabase.functions.invoke('toko-chat', {
        body: {
          message: 'Hello TOKO',
          conversationHistory: []
        }
      });

      expect(error).toBeNull();
      expect(data).toEqual(mockChatResponse);
    });

    it('should handle voice synthesis in frontend', async () => {
      // Mock successful voice response
      const mockAudioBuffer = new ArrayBuffer(1024);
      const mockBase64Audio = btoa(String.fromCharCode(...new Uint8Array(mockAudioBuffer)));

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockAudioBuffer)
      });

      // Simulate the frontend API call
      const { data, error } = await supabase.functions.invoke('toko-voice', {
        body: {
          text: 'Hello, this is a test message.',
          voice: 'Sarah'
        }
      });

      expect(error).toBeNull();
      expect(data.audioContent).toBe(mockBase64Audio);
      expect(data.contentType).toBe('audio/mpeg');
    });
  });

  describe('Error Handling and Logging', () => {
    it('should log detailed error information for debugging', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock API error with detailed response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: () => Promise.resolve({
          error: {
            message: 'Rate limit exceeded',
            type: 'rate_limit_error'
          }
        })
      });

      const { data, error } = await supabase.functions.invoke('toko-chat', {
        body: {
          message: 'Test message'
        }
      });

      expect(error).toBeTruthy();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});