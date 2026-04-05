import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RootController } from './root.controller';

@Module({
  imports: [],
  controllers: [RootController, AppController],
  providers: [AppService],
})
export class AppModule {}
