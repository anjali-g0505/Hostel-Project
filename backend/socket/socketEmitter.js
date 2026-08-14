const { getIO } = require('./socketServer');

const emitToMessRoom = (event, payload) => { //helper functions to avoid writing .to.emit boilerplate code everywhere
    getIO().to('mess-room').emit(event, payload);
};

const emitToUser = (userId, event, payload) => {
    getIO().to(`user:${userId}`).emit(event, payload);
};

const emitToMenuSubscribers = (event, payload) => {
    getIO().to('menu-subscribers').emit(event, payload);
};

module.exports = {
    emitToMessRoom,
    emitToUser,
    emitToMenuSubscribers
};
