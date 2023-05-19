"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBoard = exports.updateBoard = exports.createBoard = exports.getBoard = exports.getBoards = exports.leaveBoard = exports.joinBoard = void 0;
const board_1 = __importDefault(require("../models/board"));
const socket_events_enum_1 = require("../types/socket-events.enum");
const helpers_1 = require("../helpers");
const joinBoard = (io, socket, data) => {
    socket.join(data.boardId);
};
exports.joinBoard = joinBoard;
const leaveBoard = (io, socket, data) => {
    socket.leave(data.boardId);
};
exports.leaveBoard = leaveBoard;
const getBoards = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.sendStatus(401);
        }
        const boards = yield board_1.default.find({ userId: req.user.id });
        res.send(boards);
    }
    catch (err) {
        next(err);
    }
});
exports.getBoards = getBoards;
const getBoard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.sendStatus(401);
        }
        const board = yield board_1.default.findById(req.params.boardId);
        res.send(board);
    }
    catch (err) {
        next(err);
    }
});
exports.getBoard = getBoard;
const createBoard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.sendStatus(401);
        }
        const newBoard = new board_1.default({
            title: req.body.title,
            userId: req.user.id
        });
        const savedBoard = yield newBoard.save();
        res.send(savedBoard);
    }
    catch (err) {
        next(err);
    }
});
exports.createBoard = createBoard;
const updateBoard = (io, socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!socket.user) {
            socket.emit(socket_events_enum_1.SocketEvents.BOARDS_UPDATE_FAILURE, 'User unauthorized');
            return;
        }
        const updatedBoard = yield board_1.default.findByIdAndUpdate(data.boardId, data.fields, { new: true });
        socket.emit(socket_events_enum_1.SocketEvents.BOARDS_UPDATE_SUCCESS, updatedBoard);
        io.to(data.boardId).emit(socket_events_enum_1.SocketEvents.BOARDS_UPDATE_SUCCESS, updatedBoard);
    }
    catch (err) {
        socket.emit(socket_events_enum_1.SocketEvents.BOARDS_UPDATE_FAILURE, (0, helpers_1.getErrorMessage)(err));
    }
});
exports.updateBoard = updateBoard;
const deleteBoard = (io, socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!socket.user) {
            socket.emit(socket_events_enum_1.SocketEvents.BOARDS_DELETE_FAILURE, 'User unauthorized');
            return;
        }
        yield board_1.default.deleteOne({ _id: data.boardId });
        socket.emit(socket_events_enum_1.SocketEvents.BOARDS_DELETE_SUCCESS);
        io.to(data.boardId).emit(socket_events_enum_1.SocketEvents.BOARDS_DELETE_SUCCESS);
    }
    catch (err) {
        socket.emit(socket_events_enum_1.SocketEvents.BOARDS_DELETE_FAILURE, (0, helpers_1.getErrorMessage)(err));
    }
});
exports.deleteBoard = deleteBoard;
//# sourceMappingURL=boards.js.map