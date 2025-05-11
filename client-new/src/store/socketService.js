import { io } from 'socket.io-client';

// Socket.IO client wrapper service
class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = {};
        this.isConnected = false;
    }

    // Initialize socket connection
    connect(url = import.meta.env.VITE_API_URL || 'http://localhost:5000') {
        if (this.socket) return;

        console.log('Connecting to socket server:', url);
        this.socket = io(url, {
            transports: ['websocket', 'polling'],
            withCredentials: true,
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
            this.isConnected = true;
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }

    // Join a device-specific room to receive targeted updates
    joinDeviceRoom(deviceId) {
        if (!this.socket || !deviceId) return;
        this.socket.emit('joinDeviceRoom', deviceId);
        console.log(`Joined room for device: ${deviceId}`);
    }

    // Add event listener
    on(event, callback) {
        if (!this.socket) return;
        
        // Store the callback so we can remove it later
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
        
        this.socket.on(event, callback);
        console.log(`Added listener for event: ${event}`);
    }

    // Remove event listener
    off(event, callback) {
        if (!this.socket) return;
        
        if (callback && this.listeners[event]) {
            // Remove specific callback
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
            this.socket.off(event, callback);
        } else {
            // Remove all callbacks for this event
            if (this.listeners[event]) {
                this.listeners[event].forEach(cb => this.socket.off(event, cb));
                delete this.listeners[event];
            }
        }
    }

    // Disconnect socket
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.listeners = {};
            this.isConnected = false;
        }
    }
}

// Export a singleton instance
const socketService = new SocketService();
export default socketService;
