import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
    selector: 'app-topBar',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './top-bar.component.html',
})
export class TopBarComponent {

    constructor(
      private authService: AuthService,
      private router: Router
    ) {
    }

    logout() {
        this.authService.logout();
        this.router.navigateByUrl('/');
    }
}
