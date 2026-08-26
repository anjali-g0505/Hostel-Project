import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || undefined;

// Single connection for the whole session - created once, connected/disconnected

export const socket = io(SOCKET_URL, { //every file gets the same socket instance, it is not mounted/unmounted per page, so it is not re-created per page
    autoConnect: false,
    auth: {}
});

export const connectSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    socket.auth = { token };
    if (!socket.connected) {
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
