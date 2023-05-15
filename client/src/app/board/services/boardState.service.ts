import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BoardInterface } from '../../shared/types/board.interface';
import { SocketService } from '../../shared/services/socket.service';
import { SocketEventsEnum } from '../../shared/types/socket-events.enum';
import { Column } from '../../shared/types/column';
import { TaskInterface } from '../../shared/types/task-interface';

@Injectable(
    // providedIn: 'root'
)
export class BoardStateService {
    board$ = new BehaviorSubject<BoardInterface | null>(null);
    columns$ = new BehaviorSubject<Column[]>([]);
    tasks$ = new BehaviorSubject<TaskInterface[]>([]);

    constructor(private socketService: SocketService) {
    }

    setBoard(board: BoardInterface): void {
        this.board$.next(board);
    }

    leaveBoard(boardId: string): void {
        this.board$.next(null);
        this.socketService.emit(SocketEventsEnum.BOARDS_LEAVE, {boardId});
    }

    setColumns(columns: Column[]): void {
        this.columns$.next(columns);
    }

    setTasks(tasks: TaskInterface[]): void {
        this.tasks$.next(tasks);
    }

    addColumn(column: Column): void {
        const updatedList = [...this.columns$.getValue(), column];
        this.columns$.next(updatedList);
    }

    addTask(task: TaskInterface) {
        const updatedList = [...this.tasks$.getValue(), task];
        this.tasks$.next(updatedList);
    }

    updateBoard(updatedBoard: BoardInterface): void {
        const board = this.board$.getValue();
        if (!board) {
            throw new Error('Board is not initialized');
        }
        this.board$.next({...board, ...updatedBoard});
    }

    updateColumn(updatedColumn: Column): void {
        const updatedColumns = this.columns$.getValue().map(column => {
            return column.id === updatedColumn.id ? {...column, ...updatedColumn} : column;
        });
        this.columns$.next(updatedColumns);
    }

    deleteColumn(columnId: string): void {
        const updatedColumns = this.columns$.getValue()
            .filter(column => column.id !== columnId);
        this.columns$.next(updatedColumns);
    }

    updateTask(updatedTask: TaskInterface): void {
        const updatedTasks = this.tasks$.getValue().map(task => {
            return task.id === updatedTask.id ? {...task, ...updatedTask} : task;
        });
        this.tasks$.next(updatedTasks);
    }

    deleteTask(taskId: string): void {
        const updatedTasks = this.tasks$.getValue()
            .filter(task => task.id !== taskId);
        this.tasks$.next(updatedTasks);
    }
}
