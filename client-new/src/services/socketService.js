import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.listeners = {};
    }

    connect(url = import.meta.env.VITE_API_URL || 'http://localhost:5000') {
        if (this.socket) return;

        console.log('Connecting to WebSocket server at:', url);
        
        // Connect to the socket server
        this.socket = io(url, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        // Set up event handlers
        this.socket.on('connect', () => {
            console.log('Socket connected! ID:', this.socket.id);
            this.isConnected = true;
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
        });
    }

    // Subscribe to a device's updates
    subscribeToDevice(deviceId) {
        if (!this.socket || !deviceId) return;
        
        console.log(`Subscribing to updates for device: ${deviceId}`);
        this.socket.emit('joinDeviceRoom', deviceId);
    }

    // Listen for events
    on(event, callback) {
        if (!this.socket) return;
        
        console.log(`Adding listener for event: ${event}`);
        
        // Store the callback for later cleanup
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
        
        this.socket.on(event, callback);
    }

    // Remove listeners
    off(event, callback) {
        if (!this.socket) return;
        
        if (callback) {
            // Remove specific callback
            this.socket.off(event, callback);
            
            if (this.listeners[event]) {
                this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
            }
        } else {
            // Remove all callbacks for this event
            if (this.listeners[event]) {
                this.listeners[event].forEach(cb => this.socket.off(event, cb));
                delete this.listeners[event];
            }
        }
    }

    // Clean up all listeners
    cleanup() {
        if (!this.socket) return;
        
        // Remove all registered listeners
        Object.keys(this.listeners).forEach(event => {
            this.listeners[event].forEach(callback => {
                this.socket.off(event, callback);
            });
        });
        
        this.listeners = {};
    }

    // Disconnect socket
    disconnect() {
        if (this.socket) {
            this.cleanup();
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
