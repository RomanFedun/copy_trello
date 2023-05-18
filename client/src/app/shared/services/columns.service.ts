import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Column } from '../types/column';
import { environment } from '../../../environments/environment';
import { ColumnInput } from '../types/column-input';
import { SocketService } from './socket.service';
import { SocketEventsEnum } from '../types/socket-events.enum';

@Injectable({
    providedIn: 'root'
})
export class ColumnsService {
    url = environment.apiUrl;
    constructor(
      private http: HttpClient,
      private socketService: SocketService
    ) { }

    getColumns(boardId: string): Observable<Column[]> {
        return this.http.get<Column[]>(`${this.url}/boards/${boardId}/columns`);
    }

    createColumn(columnInput: ColumnInput): void {
        this.socketService.emit(SocketEventsEnum.COLUMNS_CREATE,columnInput);
    }

    updateColumn(columnId: string, boardId: string, fields: Partial<Column>) {
        this.socketService.emit(SocketEventsEnum.COLUMNS_UPDATE, {
            columnId,
            boardId,
            fields
        });
    }

    deleteColumn(columnId: string, boardId: string): void {
        this.socketService.emit(SocketEventsEnum.COLUMNS_DELETE, {columnId, boardId});
    }
}
