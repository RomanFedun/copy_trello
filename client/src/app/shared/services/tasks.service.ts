import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SocketService } from './socket.service';
// import { SocketEventsEnum } from '../types/socket-events.enum';
// import { TaskInputInterface } from '../types/task-input';
import { TaskInterface } from '../types/task-interface';
import { TaskInputInterface } from '../types/task-input.interface';
import { SocketEventsEnum } from '../types/socket-events.enum';

@Injectable({
    providedIn: 'root'
})
export class TasksService {
    url = environment.apiUrl;
    constructor(
    private http: HttpClient,
    private socketService: SocketService
    ) { }

    getTasks(boardId: string): Observable<TaskInterface[]> {
        return this.http.get<TaskInterface[]>(`${this.url}/boards/${boardId}/tasks`);
    }

    createTask(taskInput: TaskInputInterface): void {
        this.socketService.emit(SocketEventsEnum.TASKS_CREATE, taskInput);
    }

    updateTask(boardId: string, taskId: string, fields: Partial<TaskInterface>) {
        this.socketService.emit(SocketEventsEnum.TASKS_UPDATE, {
            boardId,
            taskId,
            fields
        });
    }

    deleteTask(boardId: string, taskId: string) {
        this.socketService.emit(SocketEventsEnum.TASKS_DELETE, {boardId, taskId});
    }
}
