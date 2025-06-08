import { useState, useEffect, useRef } from "react";
import { 
  fetchMessages, 
  fetchGroups, 
  fetchUsers,
  createGroup,
  updateGroup,
  deleteGroup
} from "../utils/api";
import { connectSocket, disconnectSocket } from "../utils/socket";
import { generateTempId, formatMessageTime } from "../utils/chatUtils";

export const useChat = () => {
  // Estados principales
  const [messages, setMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeGroup, setActiveGroup] = useState("global");
  const [notification, setNotification] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [objectiveRefreshKey, setObjectiveRefreshKey] = useState(0);

  // Referencias
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Datos del usuario
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("username") || "";
  const userRole = localStorage.getItem("userRole") || "user";

  // Función para mostrar notificaciones
  const showNotification = (title, message) => {
    setNotification({ title, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Cargar mensajes
  useEffect(() => {
    if (!token) return;
    
    fetchMessages(token)
      .then((msgs) => {
        const ordered = [...msgs].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        setMessages(
          ordered.map((msg) => ({
            id: msg.id,
            content: msg.content,
            isMine: msg.sender_name === user,
            sender_name: msg.sender_name,
            group_id: msg.group_id || "global",
            time: formatMessageTime(msg.created_at),
          }))
        );
      })
      .catch(() => {});
  }, [token, user]);

  // Cargar grupos
  useEffect(() => {
    if (!token) return;
    
    fetchGroups(token)
      .then((data) => {
        const globalGroup = { id: "global", name: "Global" };
        setGroups([globalGroup, ...data.filter((g) => g.id !== "global")]);
      })
      .catch(() => setGroups([{ id: "global", name: "Global" }]));
  }, [token]);

  // Validar grupo activo
  useEffect(() => {
    if (activeGroup !== "global" && !groups.find((g) => g.id === activeGroup)) {
      setActiveGroup("global");
    }
  }, [groups, activeGroup]);

  // Cargar usuarios
  useEffect(() => {
    if (!token) return;
    
    fetchUsers(token)
      .then((data) => {
        setUsers(data.users || []);
      })
      .catch(() => setUsers([]));
  }, [token]);

  // Conexión socket
  useEffect(() => {
    if (!token) return;
    
    const socket = connectSocket(token);
    socketRef.current = socket;
    
    if (!socket) {
      showNotification("Error de conexión", "No se pudo conectar al servidor de chat");
      return;
    }

    socket.emit("join_group", activeGroup);

    // Eventos de socket
    socket.on("receive_message", (msg) => {
      setMessages((prev) => {
        const isMyOptimisticMessage =
          (msg.temp_id && prev.some((m) => m.id === msg.temp_id)) ||
          (msg.sender_name === user &&
            prev.some(
              (m) =>
                m.content === msg.content &&
                m.sender_name === msg.sender_name &&
                m.isOptimistic
            ));

        if (isMyOptimisticMessage) {
          return prev.map((m) =>
            (msg.temp_id && m.id === msg.temp_id) ||
            (m.content === msg.content && m.sender_name === msg.sender_name && m.isOptimistic)
              ? {
                  ...m,
                  id: msg.id || m.id,
                  isOptimistic: false,
                  time: formatMessageTime(msg.created_at) || m.time,
                }
              : m
          );
        }

        if (prev.some((m) => m.id === msg.id)) return prev;

        return [
          ...prev,
          {
            id: msg.id || Date.now(),
            content: msg.content,
            isMine: msg.sender_name === user,
            sender_name: msg.sender_name,
            group_id: msg.group_id || "global",
            time: formatMessageTime(msg.created_at),
          },
        ];
      });

      if (msg.sender_name !== user && msg.group_id !== activeGroup) {
        showNotification(`Nuevo mensaje de ${msg.sender_name}`, msg.content);
      }
    });

    socket.on("message_error", (errorData) => {
      setMessages((prev) =>
        prev.map((m) =>
          errorData.temp_id && m.id === errorData.temp_id
            ? { ...m, error: true, isOptimistic: false }
            : m
        )
      );
      showNotification("Error", "No se pudo enviar el mensaje. Intenta nuevamente.");
    });

    socket.on("user_typing", (data) => {
      if (data.sender_name !== user && data.group_id === activeGroup) {
        setIsTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    });

    // Eventos de tareas y objetivos
    socket.on("task_assigned", (data) => {
      if (data.assigned_to === user) {
        showNotification("Nueva tarea asignada", `Se te ha asignado la tarea: ${data.title}`);
      }
    });

    socket.on("task_completed", (data) => {
      if (data.group_id === activeGroup) {
        showNotification("Tarea completada", `${data.completed_by} completó: ${data.title}`);
        setObjectiveRefreshKey(prev => prev + 1);
      }
    });

    socket.on("objective_created", (data) => {
      if (data.group_id === activeGroup) {
        showNotification("Nuevo objetivo", `Objetivo creado: ${data.title}`);
        setObjectiveRefreshKey(prev => prev + 1);
      }
    });

    socket.on("objective_completed", (data) => {
      if (data.group_id === activeGroup) {
        showNotification("Objetivo completado", `Objetivo completado: ${data.title}`);
        setObjectiveRefreshKey(prev => prev + 1);
      }
    });

    socket.on("progress_update", (data) => {
      if (data.group_id === activeGroup) {
        setObjectiveRefreshKey(prev => prev + 1);
      }
    });

    return () => {
      disconnectSocket(socket);
      socketRef.current = null;
    };
  }, [token, user, activeGroup]);

  // Unirse a room al cambiar grupo
  useEffect(() => {
    if (socketRef.current && activeGroup) {
      socketRef.current.emit("join_group", activeGroup);
    }
  }, [activeGroup]);

  // Funciones del chat
  const sendMessage = async (content) => {
    if (!content.trim()) return;
    
    try {
      const tempId = generateTempId();

      socketRef.current.emit("send_message", {
        content,
        sender_name: user,
        group_id: activeGroup,
        temp_id: tempId,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          content,
          isMine: true,
          sender_name: user,
          group_id: activeGroup,
          time: formatMessageTime(new Date()),
          isOptimistic: true,
        },
      ]);
    } catch (error) {
      showNotification("Error", "No se pudo enviar el mensaje");
    }
  };

  const retryMessage = (failedMessage) => {
    const tempId = generateTempId();

    socketRef.current.emit("send_message", {
      content: failedMessage.content,
      sender_name: user,
      group_id: failedMessage.group_id || activeGroup,
      temp_id: tempId,
    });

    setMessages((prev) =>
      prev.map((m) =>
        m.id === failedMessage.id
          ? { ...m, id: tempId, isOptimistic: true, error: false }
          : m
      )
    );

    showNotification("Reintentando", "Enviando mensaje nuevamente...");
  };

  const handleCreateGroup = async (groupName) => {
    if (userRole !== "admin" || !groupName.trim()) return;
    
    try {
      const newGroup = await createGroup(token, groupName);
      setGroups(prev => [...prev, newGroup]);
      showNotification("Éxito", `Grupo "${groupName}" creado correctamente`);
      return true;
    } catch (error) {
      showNotification("Error", "No se pudo crear el grupo");
      return false;
    }
  };

  const handleEditGroup = async (groupId, newName) => {
    if (userRole !== "admin" || !newName.trim()) return;
    
    try {
      await updateGroup(token, groupId, newName);
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, name: newName } : g));
      showNotification("Éxito", "Grupo actualizado correctamente");
      return true;
    } catch (error) {
      showNotification("Error", "No se pudo actualizar el grupo");
      return false;
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (userRole !== "admin") return;
    
    if (!confirm("¿Estás seguro de que quieres eliminar este grupo?")) return;
    
    try {
      await deleteGroup(token, groupId);
      setGroups(prev => prev.filter(g => g.id !== groupId));
      if (activeGroup === groupId) {
        setActiveGroup("global");
      }
      showNotification("Éxito", "Grupo eliminado correctamente");
      return true;
    } catch (error) {
      showNotification("Error", "No se pudo eliminar el grupo");
      return false;
    }
  };

  const emitTyping = () => {
    socketRef.current?.emit("user_typing", {
      sender_name: user,
      group_id: activeGroup,
    });
  };

  return {
    // Estados
    messages,
    groups,
    users,
    activeGroup,
    setActiveGroup,
    notification,
    setNotification,
    isTyping,
    objectiveRefreshKey,
    
    // Datos del usuario
    user,
    userRole,
    token,
    
    // Funciones
    sendMessage,
    retryMessage,
    handleCreateGroup,
    handleEditGroup,
    handleDeleteGroup,
    emitTyping,
    showNotification,
    
    // Filtros
    getFilteredMessages: (search) => {
      const groupMessages = messages.filter(msg => msg.group_id === activeGroup);
      return search.trim()
        ? groupMessages.filter(msg =>
            msg.content.toLowerCase().includes(search.toLowerCase()) ||
            (msg.sender_name && msg.sender_name.toLowerCase().includes(search.toLowerCase()))
          )
        : groupMessages;
    }
  };
};
