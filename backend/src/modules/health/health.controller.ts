import { Controller, Get } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { DataSource } from 'typeorm';

@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  @Get()
  async health() {
    // DB check
    const dbOk = await this.dataSource.query('SELECT 1');

    // Redis check
    const redisOk = await this.redis.ping();

    return {
      database: dbOk ? 'ok' : 'fail',
      redis: redisOk === 'PONG' ? 'ok' : 'fail',
    };
  }
}