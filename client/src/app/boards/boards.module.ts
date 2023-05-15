import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardsComponent } from './components/boards/boards.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/services/auth.guard';
import { BoardsService } from '../shared/services/boards.service';
import { InlineFormComponent } from '../shared/standaloneComponents/inline-form/inline-form.component';
import { TopBarComponent } from '../shared/standaloneComponents/topbar/top-bar.component';

const routes: Routes = [
    {
        path: 'boards',
        component: BoardsComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    declarations: [
        BoardsComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        InlineFormComponent,
        TopBarComponent
    ],
    providers: [
        BoardsService
    ]
})
export class BoardsModule { }
