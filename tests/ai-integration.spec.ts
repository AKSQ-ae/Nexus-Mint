import 'cross-fetch/polyfill';

describe('TOKO AI integration', () => {
  const baseUrl = process.env.TOKO_FUNCTIONS_URL || 'http://localhost:54321/functions/v1';

  it('chat endpoint should return a valid response', async () => {
    const res = await fetch(`${baseUrl}/toko-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello, what are the best tokenized real estate opportunities right now?' })
    });

    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json).toHaveProperty('response');
    expect(typeof json.response).toBe('string');
  }, 15000);

  it('voice endpoint should return base64 audio', async () => {
    const res = await fetch(`${baseUrl}/toko-voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Hello, this is a test synthesis.' })
    });

    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json).toHaveProperty('audioContent');
    expect(typeof json.audioContent).toBe('string');

    // Basic sanity check: base64 string length should be greater than 100
    expect(json.audioContent.length).toBeGreaterThan(100);
  }, 20000);
});