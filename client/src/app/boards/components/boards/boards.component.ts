import { Component, OnDestroy, OnInit } from '@angular/core';
import { BoardsService } from '../../../shared/services/boards.service';
import { Subscription } from 'rxjs';
import { BoardInterface } from '../../../shared/types/board.interface';

@Component({
    selector: 'boards',
    templateUrl: './boards.component.html',
})
export class BoardsComponent implements OnInit, OnDestroy {

    boards: BoardInterface[] = [];
    boardsSubscription = Subscription.EMPTY;
    constructor(private boardsService: BoardsService) {
    }

    ngOnInit() {
        this.boardsService.getBoards().subscribe(boards => {
            this.boards = boards;
        });
    }

    ngOnDestroy() {
        this.boardsSubscription.unsubscribe();
    }

    createBoard(title: string) {
        this.boardsService.createBoard(title).subscribe(board => {
            console.log('board', board);
            this.boards = [...this.boards, board];
        });
    }
}
