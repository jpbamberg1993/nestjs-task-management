import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { NotFoundException } from '@nestjs/common';

const mockUser = { id: 3, username: 'bamers' };

const mockTask = { 
  title: 'Learn nest.js',
  description: 'Do a tutorial.',
  status: TaskStatus.OPEN,
};

const mocTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

describe('TaskService', () => {
  let tasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mocTaskRepository }
      ]
    })
    .compile();
    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('gets all tasks from repository', async () => {
      taskRepository.getTasks.mockResolvedValue('somevalue');

      expect(taskRepository.getTasks).not.toHaveBeenCalled();
      const filters: GetTasksFilterDto = { status: TaskStatus.IN_PROGRESS, search: 'Some search query' };
      const result = await tasksService.getTasks(filters, mockUser);
      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('somevalue');
    });
  });

  describe('getTaskById', () => {
    it('calls taskRepository.findOne and succesfully retrieve and return the task', async () => {
      taskRepository.findOne.mockResolvedValue(mockTask);
      expect(taskRepository.findOne).not.toHaveBeenCalled();
      const result = await tasksService.getTaskById(22, mockUser);
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 22, userId: mockUser.id }
      });
      expect(result).toEqual(mockTask);
    });

    it('throws an error if task is not found', async () => {
      taskRepository.findOne.mockResolvedValue(undefined);
      expect(tasksService.getTaskById(99, mockUser)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('createTask', () => {
    it('calls taskRepository.createTask and succesfully returns the task', async () => {
      taskRepository.createTask.mockResolvedValue(mockTask);
      expect(taskRepository.createTask).not.toHaveBeenCalled();
      const result = await tasksService.createTask(mockTask, mockUser);
      expect(taskRepository.createTask).toHaveBeenCalledWith(mockTask, mockUser);
      expect(result).toEqual(mockTask);
    });
  });

  describe('deleteTask', () => {
    it('calls taskRepository.delete to delete a task', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 1 });
      expect(taskRepository.delete).not.toHaveBeenCalled();
      await tasksService.deleteTask(12, mockUser);
      expect(taskRepository.delete).toHaveBeenCalledWith({ id: 12, userId: mockUser.id });
    });

    it('throws an error if task could not be found', () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 });
      expect(tasksService.deleteTask(12, mockUser)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('updateTaskStatus', () => {
    it('updates task status and returns task', async () => {
      const task = mockTask;
      const save = jest.fn().mockResolvedValue(true);
      tasksService.getTaskById = jest.fn().mockResolvedValue({
        ...task,
        save,
      });

      expect(tasksService.getTaskById).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();
      const result = await tasksService.updateTaskStatus(12, TaskStatus.IN_PROGRESS, mockUser);
      expect(tasksService.getTaskById).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
      expect(result.status).toEqual(TaskStatus.IN_PROGRESS);
    });
  });
});