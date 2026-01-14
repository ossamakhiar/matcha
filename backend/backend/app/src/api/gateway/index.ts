import { Server, Socket } from "socket.io";
import registerChatHandlers from "./chat.gateway.js";
import { authMiddleware } from "../middlewares/socket.middleware.js";
import socketManager from "../services/socketManager.service.js";
import ioEmitter from "../services/emitter.service.js";
import { extractUserId } from "../services/socket.service.js";
import { registerNotificationHandlers } from "./notification.gateway.js";


type RegisterHandler = (client: Socket) => void;

function onConnection(client: Socket) {
    const userId = extractUserId(client);
    const registerHandlers: RegisterHandler[] = [registerChatHandlers, registerNotificationHandlers];

    // console.log(`new Client userID ${userId} socketID ${client.id}`)

    socketManager.addSocket(userId, client);
    // Register all the socket listeners
    // registerChatHandlers(io, client);

    // Add more domain-specific handlers here
    registerHandlers.forEach((registerHandler) => {
        registerHandler(client);
    })

    // console.log("broadcasting....");
    client.broadcast.emit("global:online-users", socketManager.getConnectedUsers());
    // console.log(socketManager.getSockets().length);
    // socketManager.getSockets().forEach((socket) => {
    //     socket.emit('global:online-users', {onlineUsers: socketManager.getConnectedUsers()});
    // })

    client.on("disconnect", (reason) => {
        // console.log(`disconnect ${reason}`);    
        handleDisconnect(client);
    });
}


function handleDisconnect(socket: Socket) {
    const userId = extractUserId(socket);
    // console.log(`Client userId ${userId}, socketId ${socket.id} disconnected`)
    socketManager.removeSocket(userId, socket);

    if (!socketManager.isUserOnline(userId))
        socket.broadcast.emit('global:online-users', socketManager.getConnectedUsers())
}


function createIoServer(server: any) {
    const corsOptions = {
        origin: process.env.FRONTEND_ORIGIN,
        credentials: true
    }

    // Max Payload Bytes 1e7 (10MB)
    const io = new Server(server, {cors: corsOptions, maxHttpBufferSize: 1e7});
    ioEmitter.initIoServer = io; // * intisalize io Server


    io.use(authMiddleware); // ? authetication middleware that gets executed for every incoming connection for checking auth (JWT token)
    io.on('connection', (socket) => onConnection(socket));
}


export default createIoServer;