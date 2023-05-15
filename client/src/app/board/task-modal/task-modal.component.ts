import { Component, HostBinding, OnDestroy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BoardStateService } from '../services/boardState.service';
import { filter, combineLatest, map, Observable, Subject, takeUntil } from 'rxjs';
import { TaskInterface } from '../../shared/types/task-interface';
import { InlineFormComponent } from '../../shared/standaloneComponents/inline-form/inline-form.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Column } from '../../shared/types/column';
import { TasksService } from '../../shared/services/tasks.service';
import { SocketService } from '../../shared/services/socket.service';
import { SocketEventsEnum } from '../../shared/types/socket-events.enum';

@Component({
    selector: 'app-task-modal',
    standalone: true,
    imports: [CommonModule, NgOptimizedImage, InlineFormComponent, ReactiveFormsModule],
    templateUrl: './task-modal.component.html',
})
export class TaskModalComponent implements OnDestroy {
    @HostBinding('class') classes = 'task-modal';

    boardId: string;
    taskId: string;
    columnForm = this.fb.group({
        columnId: ['']
    });

    task$: Observable<TaskInterface>;
    data$: Observable<{task: TaskInterface; columns: Column[]}>;
    unsubscribe$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private boardStateService: BoardStateService,
        private tasksService: TasksService,
        private socketService: SocketService,
        private fb: FormBuilder
    ) {
        const boardId = route.parent?.snapshot.paramMap.get('boardId'),
            taskId = route.snapshot.paramMap.get('taskId');

        if(!boardId) {
            throw new Error("Can't get boardId from URL");
        }
        if(!taskId) {
            throw new Error("Can't get taskId from URL");
        }
        this.boardId = boardId;
        this.taskId = taskId;

        this.task$ = this.boardStateService.tasks$.pipe(
            map(tasks => tasks.find(
                task => task.id === this.taskId
            )),
            filter(Boolean)
        );
        this.data$ = combineLatest([
            this.task$,
            this.boardStateService.columns$
        ]).pipe(
            map(([task, columns]) => ({
                task,
                columns
            }))
        );

        this.task$.pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(task => {
            this.columnForm.patchValue({columnId: task.columnId});
        });

        combineLatest([this.task$, this.columnForm.get('columnId')!.valueChanges.pipe(filter(Boolean))]).pipe(
            takeUntil(this.unsubscribe$)
        )
            .subscribe(
                ([task, columnId]) => {
                    if (columnId !== task.columnId) {
                        this.tasksService.updateTask(this.boardId, this.taskId, {columnId});
                    }
                }
            );

        this.socketService.listen(SocketEventsEnum.TASKS_DELETE_SUCCESS).pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(() => {
            this.goToBoard();
        });
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    goToBoard() {
        this.router.navigate(['boards', this.boardId]);
    }

    updateTaskTitle(title: string) {
        this.tasksService.updateTask(this.boardId, this.taskId, {title});
    }

    updateTaskDescription(description: string) {
        this.tasksService.updateTask(this.boardId, this.taskId, {description});
    }

    deleteTask() {
        this.tasksService.deleteTask(this.boardId, this.taskId);
    }
}
