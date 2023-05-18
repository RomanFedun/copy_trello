import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, map, Observable, throwError } from 'rxjs';
import { CurrentUser } from '../types/currentUser.interface';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest } from "../types/registerRequest.interface";
import { SocketService } from '../../shared/services/socket.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    url = environment.apiUrl;

    currentUser$ = new BehaviorSubject<CurrentUser | null | undefined>(undefined);

    isLoggedIn$ = this.currentUser$.pipe(
        map(Boolean)
    );
    constructor(
      private http: HttpClient,
      private socketService: SocketService
    ) {}

    getCurrentUser(): Observable<CurrentUser> {
        return this.http.get<CurrentUser>(`${this.url}/user`).pipe(
            catchError(err => {
                throw `error in source. Details: ${err}`;
            })
        );
    }

    register(registeredUser: RegisterRequest): Observable<CurrentUser> {
        return this.http.post<CurrentUser>(`${this.url}/users`, registeredUser);
    }

    setToken(currentUser: CurrentUser) {
        localStorage.setItem('token', currentUser.token);
    }

    setCurrentUser(currentUser: CurrentUser | null): void {
        this.currentUser$.next(currentUser);
    }

    login(loginData: LoginRequest): Observable<CurrentUser> {
        return this.http.post<CurrentUser>(`${this.url}/users/login`, loginData);
    }

    logout() {
        localStorage.removeItem('token');
        this.currentUser$.next(null);
        this.socketService.disconnect();
    }
}
