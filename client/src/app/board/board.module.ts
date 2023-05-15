import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { BoardComponent } from './board/board.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/services/auth.guard';
import { BoardStateService } from './services/boardState.service';
import { TopBarComponent } from '../shared/standaloneComponents/topbar/top-bar.component';
import { InlineFormComponent } from '../shared/standaloneComponents/inline-form/inline-form.component';
import { TaskModalComponent } from './task-modal/task-modal.component';

const routes: Routes = [
    {
        path: 'boards/:boardId',
        component: BoardComponent,
        canActivate: [AuthGuard],
        children: [{
            path: 'tasks/:taskId',
            component: TaskModalComponent
        }]
    }
];

@NgModule({
    declarations: [
        BoardComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TopBarComponent,
        InlineFormComponent,
        NgOptimizedImage
    ],
    providers: [BoardStateService]
})
export class BoardModule { }
