import { ExpressRequestInterface } from '../types/expressRequest.interface';
import { NextFunction, Response } from 'express';
import TaskModel from '../models/task';
import { Server } from 'socket.io';
import { Socket } from '../types/socket.interface';
import { SocketEvents } from '../types/socket-events.enum';
import { getErrorMessage } from '../helpers';
import { Task } from '../types/task.interface';
import BoardModel from '../models/board';

export const createTask = async (io: Server, socket: Socket, data: {boardId: string; title: string; columnId: string}) => {
	try {
		if (!socket.user) {
			socket.emit(SocketEvents.TASKS_CREATE_FAILURE, 'User is unauthorized');
			return;
		}
		const newTask = new TaskModel({
			title: data.title,
			boardId: data.boardId,
			userId: socket.user.id,
			columnId: data.columnId
		});
		const savedTask = await newTask.save();
		io.to(data.boardId).emit(SocketEvents.TASKS_CREATE_SUCCESS, savedTask);
	} catch (err) {
		socket.emit(SocketEvents.TASKS_CREATE_FAILURE, getErrorMessage(err))
	}
}

export const getTasks = async (req: ExpressRequestInterface, res: Response, next: NextFunction) => {
	try {
		if (!req.user) {
			return res.sendStatus(401)
		}
		const tasks = await TaskModel.find({boardId: req.params.boardId});
		res.send(tasks);
	}catch (err) {
		next(err);
	}
}

export const updateTask = async (io: Server, socket: Socket, data: {boardId: string; taskId: string; fields: Partial<Task>}) => {
	try {
		if (!socket.user) {
			socket.emit(SocketEvents.TASKS_UPDATE_FAILURE, 'User unauthorized');
			return
		}
		const updatedTask = await TaskModel.findByIdAndUpdate(data.taskId, data.fields, {new: true});
		socket.emit(SocketEvents.TASKS_UPDATE_SUCCESS, updatedTask);
		io.to(data.boardId).emit(SocketEvents.TASKS_UPDATE_SUCCESS, updatedTask);
	} catch (err) {
		socket.emit(SocketEvents.TASKS_UPDATE_FAILURE, getErrorMessage(err));
	}
}

export const deleteTask = async (io: Server, socket: Socket, data: {boardId: string; taskId: string}) => {
	try {
		if (!socket.user) {
			socket.emit(SocketEvents.TASKS_DELETE_FAILURE, 'User unauthorized');
			return
		}
		await TaskModel.deleteOne({_id: data.taskId});
		socket.emit(SocketEvents.TASKS_DELETE_SUCCESS, data.taskId);
		io.to(data.boardId).emit(SocketEvents.TASKS_DELETE_SUCCESS, data.taskId);
	} catch (err) {
		socket.emit(SocketEvents.TASKS_DELETE_FAILURE, getErrorMessage(err));
	}
}
