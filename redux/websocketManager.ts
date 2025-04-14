class WebSocketManager {
    private socket: WebSocket | null = null;
    private static instance: WebSocketManager | null = null;
  
    private constructor(url: string) {
      this.socket = new WebSocket(url);
    }
  
    static getInstance(url: string): WebSocketManager {
      if (!WebSocketManager.instance) {
        WebSocketManager.instance = new WebSocketManager(url);
      }
      return WebSocketManager.instance;
    }
  
    onOpen(callback: () => void) {
      if (this.socket) {
        this.socket.onopen = callback;
      }
    }
  
    onMessage(callback: (event: MessageEvent) => void) {
      if (this.socket) {
        this.socket.onmessage = callback;
      }
    }
  
    onError(callback: (error: Event) => void) {
      if (this.socket) {
        this.socket.onerror = callback;
      }
    }
  
    onClose(callback: () => void) {
      if (this.socket) {
        this.socket.onclose = callback;
      }
    }
  
    sendMessage(message: Object) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(message));
      }
    }
  
    closeConnection() {
      if (this.socket) {
        this.socket.close();
      }
    }
  }
  
  const socketUrl = 'wss://agribot-backend-abck.onrender.com';
  const socketManager = WebSocketManager.getInstance(socketUrl);
  
  export default socketManager;
  