import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@core/guards/auth.guard';
import { User } from '@auth/entities/user.entity';

@ApiTags('Tasks')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @Post()
  create(
    @Request() req: Request,
    @Body() createTaskDto: CreateTaskDto
  ) {
    const { id } = req['user'] as User;

    return this.tasksService.create(id, createTaskDto);
  }

  @Get()
  findAll(
    @Request() req: Request,
    @Query('page') page: string,
    @Query('limit') limit: string
  ) {
    const { id } = req['user'] as User;

    return this.tasksService.findAll(id, +page, +limit);
  }

  @Get(':id')
  findOne(
    @Request() req: Request,
    @Param('id') id: string
  ) {
    const { id: userId } = req['user'] as User;

    return this.tasksService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @Request() req: Request,
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto
  ) {
    const { id: userId } = req['user'] as User;

    return this.tasksService.update(userId, id, updateTaskDto);
  }

  @Delete(':id')
  remove(
    @Request() req: Request,
    @Param('id') id: string
  ) {
    const { id: userId } = req['user'] as User;

    return this.tasksService.remove(userId, id);
  }
}
