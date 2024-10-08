import { Module } from '@nestjs/common';
import { ControlController } from './control.controller';
import { ControlService } from './control.service';

@Module({
  controllers: [ControlController],
  providers: [ControlService]
})
export class ControlModule {}
