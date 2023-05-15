import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy {
    isLoginSubscription = Subscription.EMPTY;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit() {
        this.isLoginSubscription = this.authService.isLoggedIn$.subscribe(
            isLogged => {
                if (isLogged) {
                    this.router.navigateByUrl('/boards');
                }
            }
        );
    }

    ngOnDestroy() {
        this.isLoginSubscription.unsubscribe();
    }
}
