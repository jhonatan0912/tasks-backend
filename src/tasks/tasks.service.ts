import { handleDBExceptions } from '@core/exceptions';
import { PaginatedResponse, Response } from '@core/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities';

@Injectable()
export class TasksService {

  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) { }

  async create(createTaskDto: CreateTaskDto): Promise<Response<Task>> {
    try {
      const task = await this.taskRepository.save(createTaskDto);

      return {
        data: task,
        message: 'Task created successfully',
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<Task>> {
    try {
      const realPage = Math.max(1, page);
      console.log(page);

      const [tasks, total] = await this.taskRepository
        .createQueryBuilder('task')
        .skip((realPage - 1) * limit)
        .take(limit)
        .cache(true)
        .getManyAndCount();

      return {
        data: tasks,
        meta: {
          page: realPage,
          limit,
          total,
          lastPage: Math.ceil(total / limit),
        },
        message: 'Tasks retrieved successfully',
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  async findOne(id: string): Promise<Response<Task>> {
    try {
      const task = await this.taskRepository.findOne({ where: { id } });

      if (!task) throw new NotFoundException('Task not found');

      return {
        data: task,
        message: 'Task retrieved successfully',
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Response<Task>> {
    try {
      const task = await this.taskRepository.findOne({ where: { id } });

      if (!task) throw new NotFoundException('Task not found');

      await this.taskRepository.update(id, updateTaskDto);

      return {
        data: task,
        message: 'Task updated successfully',
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  async remove(id: string): Promise<Response<{ id: string; }>> {
    try {
      const task = await this.taskRepository.findOne({ where: { id } });

      if (!task) throw new NotFoundException('Task not found');

      await this.taskRepository.remove(task);

      return {
        data: { id },
        message: 'Task deleted successfully',
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }
}
