const { Server } = require('socket.io'); //server is a class that we can use to create a new socket.io server instance
const { verifyToken } = require('../utils/authUtils');

let io = null;

const initSocket = (httpServer) => {
    io = new Server(httpServer, { //io is an instance of the socket.io server
        cors: {
            origin: '*'
        }
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token; // Extract the token from the handshake auth data that is sent by the client when establishing the connection
        if (!token) {
            const err = new Error('Unauthorized, JWT token is required');
            err.data = { status: 401 }; 
            return next(err);
        }
        try {
            socket.user = verifyToken(token);
            next();
        } catch (err) {
            const authErr = new Error('Invalid token, wrong or expired');
            authErr.data = { status: 401 }; //same as ensureAuthenticated middleware in Auth.js
            next(authErr);
        }
    });

    io.on('connection', (socket) => {
        const { role, id } = socket.user; //3 rooms -> mess-room to get order pending and paid updates, menu-subscribers (shared room by warden and student to get menu updates), user-specific room for warden/students to get order status updates
        if (role === 'student' || role === 'warden') {
            socket.join('menu-subscribers');
            socket.join(`user:${id}`);
        } else if (role === 'mess') {
            socket.join('mess-room');
        }
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized. Call initSocket(httpServer) first.');
    }
    return io;
};

module.exports = {
    initSocket,
    getIO
};
