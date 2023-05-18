import { Component } from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {HttpErrorResponse} from "@angular/common/http";
import {CurrentUser} from "../../types/currentUser.interface";
import { Router } from '@angular/router';
import { SocketService } from '../../../shared/services/socket.service';

@Component({
    selector: 'auth-register',
    templateUrl: './register.component.html'
})
export class RegisterComponent {

    form = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        userName: ['', Validators.required],
        password: ['', Validators.required]
    });
    error: string | null = null;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private socketService: SocketService
    ) {
    }

    onSubmit(): void {
        if (this.error) {
            this.error = null;
        }
        this.authService.register(this.form.value).subscribe({
            next: (user: CurrentUser) => {
                this.authService.setToken(user);
                this.socketService.setupSocketConnection(user);
                this.authService.setCurrentUser(user);

                this.router.navigateByUrl('/');
            },
            error: (err: HttpErrorResponse) => {
                console.error(err.message);
                this.error = err.message;
            }
        });
    }
}
