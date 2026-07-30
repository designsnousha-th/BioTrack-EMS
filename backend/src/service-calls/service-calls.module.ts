import { Module } from '@nestjs/common';
import { ServiceCallsService } from './service-calls.service';
import { ServiceCallsController } from './service-calls.controller';

@Module({
  providers: [ServiceCallsService],
  controllers: [ServiceCallsController],
})
export class ServiceCallsModule {}
