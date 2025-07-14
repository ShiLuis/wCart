import { io } from 'socket.io-client';

const URL = process.env.NODE_ENV === 'production' ? 'https://kahit-saan-server.onrender.com' : 'http://localhost:5000';

export const socket = io(URL, {
  autoConnect: false
});

// Helper function to join order room for notifications
export const joinOrderRoom = (orderId) => {
  if (socket.connected) {
    socket.emit('join-order-room', orderId);
    console.log(`Joined order room: ${orderId}`);
  }
};

// Helper function to leave order room
export const leaveOrderRoom = (orderId) => {
  if (socket.connected) {
    socket.emit('leave-order-room', orderId);
    console.log(`Left order room: ${orderId}`);
  }
};
