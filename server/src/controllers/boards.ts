import { NextFunction, Response } from 'express';
import BoardModel from "../models/board"
import { ExpressRequestInterface } from '../types/expressRequest.interface';
import { Server } from 'socket.io';
import { Socket } from '../types/socket.interface';
import { BoardDocument } from '../types/board.interface';
import { SocketEvents } from '../types/socket-events.enum';
import { getErrorMessage } from '../helpers';

export const joinBoard = (io: Server, socket: Socket, data: {boardId: string}) => {
	socket.join(data.boardId);
}

export const leaveBoard = (io: Server, socket: Socket, data: {boardId: string}): void => {
	socket.leave(data.boardId);
}

export const getBoards = async (req: ExpressRequestInterface, res: Response, next: NextFunction) => {
	try {
		if (!req.user) {
			return res.sendStatus(401)
		}
		const boards = await BoardModel.find({userId: req.user.id});
		res.send(boards);
	}catch (err) {
		next(err);
	}
}

export const getBoard = async (req: ExpressRequestInterface, res: Response, next: NextFunction) => {
	try {
		if (!req.user) {
			return res.sendStatus(401)
		}
		const board = await BoardModel.findById(req.params.boardId);
		res.send(board);
	}catch (err) {
		next(err);
	}
}

export const createBoard = async (req: ExpressRequestInterface, res: Response, next: NextFunction) => {
	try {
		if (!req.user) {
			return res.sendStatus(401)
		}
		
		const newBoard = new BoardModel({
			title: req.body.title,
			userId: req.user.id
		});
		const savedBoard = await newBoard.save();
		res.send(savedBoard);
	}catch (err) {
		next(err);
	}
}

export const updateBoard = async (io: Server, socket: Socket, data: {boardId: string; fields: Partial<BoardDocument>}) => {
	try {
		if (!socket.user) {
			socket.emit(SocketEvents.BOARDS_UPDATE_FAILURE, 'User unauthorized');
			return
		}
		const updatedBoard = await BoardModel.findByIdAndUpdate(data.boardId, data.fields, {new: true});
		socket.emit(SocketEvents.BOARDS_UPDATE_SUCCESS, updatedBoard);
		io.to(data.boardId).emit(SocketEvents.BOARDS_UPDATE_SUCCESS, updatedBoard);
	} catch (err) {
		socket.emit(SocketEvents.BOARDS_UPDATE_FAILURE, getErrorMessage(err));
	}
}

export const deleteBoard = async (io: Server, socket: Socket, data: {boardId: string}) => {
	try {
		if (!socket.user) {
			socket.emit(SocketEvents.BOARDS_DELETE_FAILURE, 'User unauthorized');
			return
		}
		await BoardModel.deleteOne({_id: data.boardId});
		socket.emit(SocketEvents.BOARDS_DELETE_SUCCESS);
		io.to(data.boardId).emit(SocketEvents.BOARDS_DELETE_SUCCESS);
	} catch (err) {
		socket.emit(SocketEvents.BOARDS_DELETE_FAILURE, getErrorMessage(err));
	}
}