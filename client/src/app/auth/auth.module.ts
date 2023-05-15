import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AuthService } from "./services/auth.service";
import { RegisterComponent } from './components/register/register.component';
import {RouterLink, RouterModule, Routes} from '@angular/router';
import {ReactiveFormsModule} from "@angular/forms";
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'login',
        component: LoginComponent,
    }
];

@NgModule({
    declarations: [
        RegisterComponent,
        LoginComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        RouterLink,
        NgOptimizedImage,
        ReactiveFormsModule
    ],
    providers: [
        AuthService, AuthGuard
    ]
})
export class AuthModule { }
