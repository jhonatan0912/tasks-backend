import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CoreModule } from '@core/core.module';
import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    CoreModule,
    AuthModule
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule { }
