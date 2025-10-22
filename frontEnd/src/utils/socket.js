// src/utils/socket.js
import { io } from "socket.io-client";

// Función para conectar a Socket.io y manejar eventos comunes
export const connectSocket = (token) => {
  if (!token) {
    console.error("No se puede conectar a Socket.io sin token");
    return null;
  }
  
  // IMPORTANTE: Socket.io debe conectarse a la URL base, no a la ruta /api
  const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";
  
  // Crear una nueva conexión con opciones de alta disponibilidad
  const socket = io(socketUrl, {
    auth: { token },
    transports: ['websocket', 'polling'], // Intentar websocket primero, luego polling
    reconnection: true, // Habilitar reconexión automática
    reconnectionDelay: 1000, // Intentar reconectar después de 1 segundo
    reconnectionDelayMax: 5000, // Máximo 5 segundos entre intentos
    reconnectionAttempts: 10, // Intentar reconectar 10 veces
    timeout: 10000 // Timeout de conexión de 10 segundos
  });
  
  // Manejar eventos comunes de conexión
  socket.on("connect", () => {
    
    // Enviar ping de prueba para verificar comunicación bidireccional
    setTimeout(() => {
      socket.emit("ping_server", { message: "Verificando conexión" });
    }, 1000);
  });
  
  socket.on("pong_client", () => {
  });
  
  socket.on("connect_error", (error) => {
    console.error("❌ Error conectando a Socket.io:", error.message);
  });
  
  socket.on("disconnect", (reason) => {
    console.warn("⚠️ Socket.io desconectado, razón:", reason);
  });
  
  socket.on("reconnect", () => {
  });
  
  socket.on("error", (error) => {
    console.error("🚨 Error de Socket.io:", error);
  });
  
  return socket;
};

// Función para desconectar Socket.io de forma limpia
export const disconnectSocket = (socket) => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};
