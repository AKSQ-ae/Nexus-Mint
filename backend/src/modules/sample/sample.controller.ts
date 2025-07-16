import { Controller, Get, UseInterceptors, CacheInterceptor } from '@nestjs/common';
import { SampleService } from './sample.service';

@Controller({ path: 'sample', version: '1' })
export class SampleController {
  constructor(private readonly sampleService: SampleService) {}

  @Get('heavy')
  @UseInterceptors(CacheInterceptor)
  async heavy() {
    return this.sampleService.getHeavyData();
  }
}