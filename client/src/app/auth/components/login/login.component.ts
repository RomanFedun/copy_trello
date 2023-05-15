import { Component } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {CurrentUser} from "../../types/currentUser.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {Router} from "@angular/router";
import { SocketService } from '../../../shared/services/socket.service';

@Component({
    selector: 'auth-login',
    templateUrl: './login.component.html'
})
export class LoginComponent {
    form = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
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

    onSubmit() {

        if (this.error) {
            this.error = null;
        }
        this.authService.login(this.form.value).subscribe({
            next: (user: CurrentUser) => {
                this.authService.setToken(user);
                this.socketService.setupSocketConnection(user);
                this.authService.setCurrentUser(user);

                this.router.navigateByUrl('/');
            },
            error: (err: HttpErrorResponse) => {
                this.error = err.error['emailOrPassword'];
            }
        });
    }
}
