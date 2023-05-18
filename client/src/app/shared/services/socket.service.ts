import { Injectable } from '@angular/core';
import { CurrentUser } from '../../auth/types/currentUser.interface';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    socket: Socket | undefined;

    setupSocketConnection(currentUser: CurrentUser): void {
        this.socket = io(environment.socketUrl, {
            auth: {
                token: currentUser.token,
            }
        });
    }

    disconnect(): void {
        if (!this.socket) {
            throw new Error('Socket connection is not wired');
        }
        this.socket.disconnect();
    }

    emit(eventName: string, onmessage: any): void {
        if (!this.socket) {
            throw new Error('Socket connection is not wired');
        }

        this.socket.emit(eventName, onmessage);
    }

    listen<T>(eventName: string): Observable<T> {
        const socket = this.socket;
        if (!socket) {
            throw new Error('Socket connection is not wired');
        }
        return new Observable<T>(observer => {
            socket.on(eventName, data => {
                observer.next(data);
            });
        });
    }
}
