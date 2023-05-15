import { Component, OnDestroy, OnInit } from '@angular/core';
import { BoardsService } from '../../shared/services/boards.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BoardStateService } from '../services/boardState.service';
import { combineLatest, filter, map, Observable, Subject, takeUntil } from 'rxjs';
import { BoardInterface } from '../../shared/types/board.interface';
import { SocketService } from '../../shared/services/socket.service';
import { SocketEventsEnum } from '../../shared/types/socket-events.enum';
import { ColumnsService } from '../../shared/services/columns.service';
import { Column } from '../../shared/types/column';
import { ColumnInput } from '../../shared/types/column-input';
import { TaskInterface } from '../../shared/types/task-interface';
import { TasksService } from '../../shared/services/tasks.service';
import { TaskInputInterface } from '../../shared/types/task-input.interface';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
})
export class BoardComponent implements OnInit, OnDestroy {
    boardId: string;
    // board$: Observable<BoardInterface>;
    // columns$: Observable<Column[]>;
    data$: Observable<{
        board: BoardInterface;
        columns: Column[];
        tasks: TaskInterface[];
    }>;
    unsubscribe$ = new Subject<void>();

    constructor(
      private boardsService: BoardsService,
      private router: Router,
      private route: ActivatedRoute,
      private boardStateService: BoardStateService,
      private socketService: SocketService,
      private columnsService: ColumnsService,
      private tasksService: TasksService
    ) {
        const boardId = this.route.snapshot.paramMap.get('boardId');

        if (!boardId) {
            throw new Error("Can't get boardId from URL");
        }
        this.boardId = boardId;
        // this.board$ = this.boardStateService.board$.pipe(filter(Boolean));
        // this.columns$ = this.boardStateService.columns$;
        this.data$ = combineLatest([
            this.boardStateService.board$.pipe(filter(Boolean)),
            this.boardStateService.columns$,
            this.boardStateService.tasks$,
        ]).pipe(
            map(([board, columns, tasks]): {
                board: BoardInterface, columns: Column[], tasks: TaskInterface[]
            } => ({
                board,
                columns,
                tasks
            }))
        );
    }

    ngOnInit() {
        this.socketService.emit(SocketEventsEnum.BOARDS_JOIN, {boardId: this.boardId});

        this.boardsService.getBoard(this.boardId).subscribe(board => {
            console.log('board', board);
            this.boardStateService.setBoard(board);
        });

        this.columnsService.getColumns(this.boardId).subscribe(columns => {
            this.boardStateService.setColumns(columns);
        });

        this.tasksService.getTasks(this.boardId).subscribe(tasks => {
            this.boardStateService.setTasks(tasks);
        });

        this.socketService.listen<Column>(SocketEventsEnum.COLUMNS_CREATE_SUCCESS)
            .pipe(
                takeUntil(this.unsubscribe$)
            ).subscribe(
                column => {
                    this.boardStateService.addColumn(column);
                }
            );

        this.socketService.listen<Column>(SocketEventsEnum.COLUMNS_UPDATE_SUCCESS)
            .pipe(
                takeUntil(this.unsubscribe$)
            ).subscribe(
                (updatedColumn) => {
                    this.boardStateService.updateColumn(updatedColumn);
                }
            );


        this.socketService.listen<string>(SocketEventsEnum.COLUMNS_DELETE_SUCCESS)
            .pipe(
                takeUntil(this.unsubscribe$)
            ).subscribe(
                columnId => {
                    this.boardStateService.deleteColumn(columnId);
                }
            );

        this.socketService.listen<TaskInterface>(SocketEventsEnum.TASKS_CREATE_SUCCESS)
            .pipe(
                takeUntil(this.unsubscribe$)
            ).subscribe(
                task => {
                    this.boardStateService.addTask(task);
                }
            );

        this.socketService.listen<BoardInterface>(SocketEventsEnum.BOARDS_UPDATE_SUCCESS)
            .pipe(
                takeUntil(this.unsubscribe$)
            ).subscribe(
                updatedBoard => {
                    this.boardStateService.updateBoard(updatedBoard);
                }
            );

        this.socketService.listen<void>(SocketEventsEnum.BOARDS_DELETE_SUCCESS)
            .pipe(
                takeUntil(this.unsubscribe$)
            ).subscribe(
                () => {
                    this.router.navigateByUrl('/boards');
                }
            );

        this.socketService.listen<TaskInterface>(SocketEventsEnum.TASKS_UPDATE_SUCCESS)
            .pipe(
                takeUntil(this.unsubscribe$)
            ).subscribe(
                (updatedTask) => {
                    this.boardStateService.updateTask(updatedTask);
                }
            );

        this.socketService.listen<string>(SocketEventsEnum.TASKS_DELETE_SUCCESS).pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe((taskId) => {
            this.boardStateService.deleteTask(taskId);
        });
    }

    ngOnDestroy() {
        this.boardStateService.leaveBoard(this.boardId);
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    createColumn(title: string): void {
        const columnInput: ColumnInput = {
            title,
            boardId: this.boardId
        };
        this.columnsService.createColumn(columnInput);
    }

    getTasksByColumn(id: string, tasks: TaskInterface[]): TaskInterface[] {
        return tasks.filter(task => task.columnId === id);
    }

    createTask(title: string, columnId: string): void {
        const taskInput: TaskInputInterface = {
            title,
            boardId: this.boardId,
            columnId
        };
        return this.tasksService.createTask(taskInput);
    }

    updateBoardName(title: string) {
        this.boardsService.updateBoard(this.boardId, {title});
    }

    deleteBoard() {
        if (confirm('Are you sure about deleting')) {
            this.boardsService.deleteBoard(this.boardId);
        }
    }

    deleteColumn(id: string) {
        if (confirm('Are you sure about deleting')) {
            this.columnsService.deleteColumn(id, this.boardId);
        }
    }

    updateColumnName(title: string, id: string) {
        this.columnsService.updateColumn(id, this.boardId, {title});
    }

    openTask(taskId: string) {
        this.router.navigate(['boards', this.boardId, 'tasks', taskId]);
    }
}
