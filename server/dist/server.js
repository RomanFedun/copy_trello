"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const mongoose = __importStar(require("mongoose"));
const usersController = __importStar(require("./controllers/users"));
const boardsController = __importStar(require("./controllers/boards"));
const columnsController = __importStar(require("./controllers/columns"));
const tasksController = __importStar(require("./controllers/tasks"));
const body_parser_1 = __importDefault(require("body-parser"));
const auth_1 = __importDefault(require("./middlewares/auth"));
const cors_1 = __importDefault(require("cors"));
const socket_events_enum_1 = require("./types/socket-events.enum");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const user_1 = __importDefault(require("./models/user"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*'
    }
});
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
mongoose.set('toJSON', {
    virtuals: true,
    transform: (_, converted) => {
        delete converted._id;
    }
});
app.get('/', (req, res) => {
    res.send('API is UP');
});
app.post('/api/users', usersController.register);
app.post('/api/users/login', usersController.login);
app.get('/api/user', auth_1.default, usersController.currentUser);
app.get('/api/boards', auth_1.default, boardsController.getBoards);
app.post('/api/boards', auth_1.default, boardsController.createBoard);
app.get('/api/boards/:boardId', auth_1.default, boardsController.getBoard);
app.get('/api/boards/:boardId/columns', auth_1.default, columnsController.getColumns);
app.get('/api/boards/:boardId/tasks', auth_1.default, tasksController.getTasks);
io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = socket.handshake.auth.token) !== null && _a !== void 0 ? _a : '';
        const data = jsonwebtoken_1.default.verify(token.split(' ')[1], config_1.secret);
        const user = yield user_1.default.findById(data.id);
        if (!user) {
            return next(new Error('Authentication error'));
        }
        socket.user = user;
        next();
    }
    catch (err) {
        next(new Error('Authentication error'));
    }
})).on('connection', (socket) => {
    socket.on(socket_events_enum_1.SocketEvents.BOARDS_JOIN, (data) => {
        boardsController.joinBoard(io, socket, data);
    });
    socket.on(socket_events_enum_1.SocketEvents.BOARDS_LEAVE, (data) => {
        boardsController.leaveBoard(io, socket, data);
    });
    socket.on(socket_events_enum_1.SocketEvents.COLUMNS_CREATE, (data) => {
        columnsController.createColumn(io, socket, data);
    });
    socket.on(socket_events_enum_1.SocketEvents.TASKS_CREATE, (data) => {
        tasksController.createTask(io, socket, data);
    });
    socket.on(socket_events_enum_1.SocketEvents.BOARDS_UPDATE, (data) => {
        boardsController.updateBoard(io, socket, data);
    });
    socket.on(socket_events_enum_1.SocketEvents.BOARDS_DELETE, (data) => {
        boardsController.deleteBoard(io, socket, data);
    });
    socket.on(socket_events_enum_1.SocketEvents.COLUMNS_DELETE, (data) => {
        columnsController.deleteColumn(io, socket, data);
    });
    socket.on(socket_events_enum_1.SocketEvents.COLUMNS_UPDATE, (data) => {
        columnsController.updateColumn(io, socket, data);
    });
    socket.on(socket_events_enum_1.SocketEvents.TASKS_UPDATE, (data) => {
        tasksController.updateTask(io, socket, data);
    });
    socket.on(socket_events_enum_1.SocketEvents.TASKS_DELETE, (data) => {
        tasksController.deleteTask(io, socket, data);
    });
});
mongoose.connect('mongodb://127.0.0.1:27017/mytrello').then(() => {
    console.log('mongo connect');
    httpServer.listen(4001, () => {
        console.log('server start on 4001 port');
    });
});
//# sourceMappingURL=server.js.map