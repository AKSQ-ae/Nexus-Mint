import { Injectable } from '@nestjs/common';

@Injectable()
export class SampleService {
  async getHeavyData(): Promise<{ message: string; timestamp: number }> {
    // Simulate heavy computation or db access
    await new Promise((res) => setTimeout(res, 500));
    return {
      message: 'Heavy payload',
      timestamp: Date.now(),
    };
  }
}