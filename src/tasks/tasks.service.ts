import { handleDBExceptions } from '@core/exceptions';
import { PaginatedResponse, Response } from '@core/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities';
import { User } from '@auth/entities/user.entity';

@Injectable()
export class TasksService {

  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async create(userId: string, createTaskDto: CreateTaskDto): Promise<Response<Partial<Task>>> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
        relations: ['tasks']
      });

      if (!user)
        throw new NotFoundException('User not found');

      const task = this.taskRepository.create({
        user,
        title: createTaskDto.title,
        description: createTaskDto.description,
      });

      await this.taskRepository.save(task);

      const { user: _, ...rest } = task;

      return {
        data: {
          ...rest,
        },
        message: 'Task created successfully',
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<Task>> {
    try {
      console.log(userId);
      const user = await this.usersRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.tasks', 'tasks')
        .where('user.id = :userId', { userId })
        .orderBy('tasks.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getOne();

      if (!user)
        throw new NotFoundException('User not found');

      return {
        data: user.tasks,
        meta: {
          page,
          limit,
          total: user.tasks.length,
          lastPage: Math.ceil(user.tasks.length / limit),
        },
        message: 'Tasks retrieved successfully',
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  async findOne(userId: string, id: string): Promise<Response<Task>> {
    try {
      const task = await this.taskRepository.findOne({
        where: { id, user: { id: userId } }
      });

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
    userId: string,
    id: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Response<Task>> {
    try {
      const task = await this.taskRepository.findOne({
        where: { id, user: { id: userId } }
      });

      if (!task)
        throw new NotFoundException('Task not found');

      task.title = updateTaskDto.title;
      task.description = updateTaskDto.description;
      task.done = updateTaskDto.done;

      await this.taskRepository.save(task);

      return {
        data: task,
        message: 'Task updated successfully',
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  async remove(userId: string, id: string): Promise<Response<{ id: string; }>> {
    try {
      const task = await this.taskRepository.findOne({
        where: { id, user: { id: userId } }
      });

      if (!task)
        throw new NotFoundException('Task not found');

      await this.taskRepository.delete(task.id);

      return {
        data: { id: task.id },
        message: 'Task deleted successfully',
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }
}
