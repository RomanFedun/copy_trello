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
exports.deleteColumn = exports.updateColumn = exports.getColumns = exports.createColumn = void 0;
const column_1 = __importDefault(require("../models/column"));
const socket_events_enum_1 = require("../types/socket-events.enum");
const helpers_1 = require("../helpers");
const createColumn = (io, socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!socket.user) {
            socket.emit(socket_events_enum_1.SocketEvents.COLUMNS_CREATE_FAILURE, 'User is unauthorized');
            return;
        }
        const newColumn = new column_1.default({
            title: data.title,
            boardId: data.boardId,
            userId: socket.user.id
        });
        const savedColumn = yield newColumn.save();
        io.to(data.boardId).emit(socket_events_enum_1.SocketEvents.COLUMNS_CREATE_SUCCESS, savedColumn);
    }
    catch (err) {
        socket.emit(socket_events_enum_1.SocketEvents.COLUMNS_CREATE_FAILURE, (0, helpers_1.getErrorMessage)(err));
    }
});
exports.createColumn = createColumn;
const getColumns = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.sendStatus(401);
        }
        const columns = yield column_1.default.find({ boardId: req.params.boardId });
        res.send(columns);
    }
    catch (err) {
        next(err);
    }
});
exports.getColumns = getColumns;
const updateColumn = (io, socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!socket.user) {
            socket.emit(socket_events_enum_1.SocketEvents.COLUMNS_UPDATE_FAILURE, 'User unauthorized');
            return;
        }
        const updatedColumn = yield column_1.default.findByIdAndUpdate(data.columnId, data.fields, { new: true });
        socket.emit(socket_events_enum_1.SocketEvents.COLUMNS_UPDATE_SUCCESS, updatedColumn);
        io.to(data.boardId).emit(socket_events_enum_1.SocketEvents.COLUMNS_UPDATE_SUCCESS, updatedColumn);
    }
    catch (err) {
        socket.emit(socket_events_enum_1.SocketEvents.COLUMNS_UPDATE_FAILURE, (0, helpers_1.getErrorMessage)(err));
    }
});
exports.updateColumn = updateColumn;
const deleteColumn = (io, socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!socket.user) {
            socket.emit(socket_events_enum_1.SocketEvents.COLUMNS_DELETE_FAILURE, 'User unauthorized');
            return;
        }
        yield column_1.default.deleteOne({ _id: data.columnId });
        socket.emit(socket_events_enum_1.SocketEvents.COLUMNS_DELETE_SUCCESS, data.columnId);
        io.to(data.boardId).emit(socket_events_enum_1.SocketEvents.COLUMNS_DELETE_SUCCESS, data.columnId);
    }
    catch (err) {
        socket.emit(socket_events_enum_1.SocketEvents.COLUMNS_DELETE_FAILURE, (0, helpers_1.getErrorMessage)(err));
    }
});
exports.deleteColumn = deleteColumn;
//# sourceMappingURL=columns.js.map