import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BoardInterface } from '../types/board.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { SocketService } from './socket.service';
import { SocketEventsEnum } from '../types/socket-events.enum';
import { Column } from '../types/column';

@Injectable({
    providedIn: 'root'
})
export class BoardsService {

    url = environment.apiUrl;
    constructor(
      private socketService: SocketService,
      private http: HttpClient
    ) { }

    getBoards(): Observable<BoardInterface[]> {
        return this.http.get<BoardInterface[]>(`${this.url}/boards`);
    }

    getBoard(boardId: string): Observable<BoardInterface> {
        return this.http.get<BoardInterface>(`${this.url}/boards/${boardId}`);
    }

    createBoard(title: string): Observable<BoardInterface> {
        return this.http.post<BoardInterface>(`${this.url}/boards`, {title});
    }

    updateBoard(boardId: string, fields: Partial<BoardInterface>): void {
        this.socketService.emit(SocketEventsEnum.BOARDS_UPDATE, {boardId, fields});
    }

    deleteBoard(boardId: string): void {
        this.socketService.emit(SocketEventsEnum.BOARDS_DELETE, {boardId});
    }
}
