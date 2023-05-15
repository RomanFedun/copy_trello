import { ExpressRequestInterface } from '../types/expressRequest.interface';
import { NextFunction, Response } from 'express';
import ColumnModel from '../models/column';
import { Server } from 'socket.io';
import { Socket } from '../types/socket.interface';
import { SocketEvents } from '../types/socket-events.enum';
import { getErrorMessage } from '../helpers';
import BoardModel from '../models/board';
import { BoardDocument } from '../types/board.interface';
import { Column } from '../types/column.interface';

export const createColumn = async (io: Server, socket: Socket, data: {boardId: string; title: string}) => {
	try {
		if (!socket.user) {
			socket.emit(SocketEvents.COLUMNS_CREATE_FAILURE, 'User is unauthorized');
			return;
		}
		const newColumn = new ColumnModel({
			title: data.title,
			boardId: data.boardId,
			userId: socket.user.id
		});
		const savedColumn = await newColumn.save();
		io.to(data.boardId).emit(SocketEvents.COLUMNS_CREATE_SUCCESS, savedColumn);
	} catch (err) {
		socket.emit(SocketEvents.COLUMNS_CREATE_FAILURE, getErrorMessage(err))
	}
}

export const getColumns = async (req: ExpressRequestInterface, res: Response, next: NextFunction) => {
	try {
		if (!req.user) {
			return res.sendStatus(401)
		}
		const columns = await ColumnModel.find({boardId: req.params.boardId});
		res.send(columns);
	}catch (err) {
		next(err);
	}
}

export const updateColumn = async (io: Server, socket: Socket, data: {boardId: string, columnId: string; fields: Partial<Column>}) => {
	try {
		if (!socket.user) {
			socket.emit(SocketEvents.COLUMNS_UPDATE_FAILURE, 'User unauthorized');
			return
		}
		const updatedColumn = await ColumnModel.findByIdAndUpdate(data.columnId, data.fields, {new: true});
		socket.emit(SocketEvents.COLUMNS_UPDATE_SUCCESS, updatedColumn);
		io.to(data.boardId).emit(SocketEvents.COLUMNS_UPDATE_SUCCESS, updatedColumn);
	} catch (err) {
		socket.emit(SocketEvents.COLUMNS_UPDATE_FAILURE, getErrorMessage(err));
	}
}

export const deleteColumn = async (io: Server, socket: Socket, data: {boardId: string; columnId:string}) => {
	try {
		if (!socket.user) {
			socket.emit(SocketEvents.COLUMNS_DELETE_FAILURE, 'User unauthorized');
			return
		}
		await ColumnModel.deleteOne({_id: data.columnId});
		socket.emit(SocketEvents.COLUMNS_DELETE_SUCCESS, data.columnId);
		io.to(data.boardId).emit(SocketEvents.COLUMNS_DELETE_SUCCESS, data.columnId);
	} catch (err) {
		socket.emit(SocketEvents.COLUMNS_DELETE_FAILURE, getErrorMessage(err));
	}
}