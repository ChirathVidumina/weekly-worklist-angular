import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { TaskRepository, TASK_REPOSITORY } from './core/repositories/task-repository.interface';
import { HttpTaskRepository } from './core/repositories/http-task.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    {
      provide: TaskRepository,
      useClass: HttpTaskRepository
    },
    {
      provide: TASK_REPOSITORY,
      useExisting: TaskRepository
    }
  ]
};
