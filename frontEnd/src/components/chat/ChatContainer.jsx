import React, { useState, useEffect, useRef } from "react";
import { Target, Bell, X, MessageCircle, Users, ClipboardCheck } from "lucide-react";
import {  fetchMessages,
  fetchGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  deleteGroupMessages,
  fetchUsers,
} from "../../utils/api";
import { connectSocket, disconnectSocket } from "../../utils/socket";
import { canReviewTasks } from "../../utils/auth";
import ObjectiveManager from "../ObjectiveManager";
import UserTaskView from "../UserTaskView";
import TaskReviewPanel from "../TaskReviewPanel";
import ObjectiveProgressSummary from "../ObjectiveProgressSummary";
import { generateTempId, formatMessageTime } from "../../utils/chatUtils";

// Import components
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import ChatProgressBar from "./ChatProgressBar";
import MessageArea from "./MessageArea";
import MessageInput from "./MessageInput";
import NotificationBanner from "./NotificationBanner";
import DeleteChatModal from "./DeleteChatModal";


const ChatContainer = () => {  // Estados principales
  const [messages, setMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeGroup, setActiveGroup] = useState("global");// Estados de UI
  const [activeTab, setActiveTab] = useState("chats");
  const [search, setSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);  const [showEmojis, setShowEmojis] = useState(false);
  const [showAttachOptions, setShowAttachOptions] = useState(false);
  const [showDeleteChatModal, setShowDeleteChatModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [isDeletingChat, setIsDeletingChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [notification, setNotification] = useState(null);
  const [objectiveRefreshKey, setObjectiveRefreshKey] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'message',
      title: 'Nuevo mensaje',
      content: 'Tienes un nuevo mensaje en el grupo Global',
      time: '2 min',
      read: false
    },
    {
      id: 2,
      type: 'objective',
      title: 'Objetivo completado',
      content: 'Se completó el objetivo "Configurar sistema"',
      time: '1 hora',
      read: false
    },
    {
      id: 3,
      type: 'user',
      title: 'Nuevo usuario',
      content: 'Un nuevo usuario se ha unido al sistema',
      time: '3 horas',
      read: true
    }
  ]);

  // Referencias
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Datos del usuario
  const token = localStorage.getItem("token");  const user = localStorage.getItem("username") || "";  const userRole = localStorage.getItem("userRole") || "user";

  // Función para mostrar notificaciones
  const showNotification = (title, message) => {
    setNotification({ title, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Funciones para el manejo de notificaciones
  const handleShowNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  const handleMarkNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };
  // Cargar mensajes
  useEffect(() => {
    if (!token) return;
    
    fetchMessages(token)
      .then((msgs) => {
        const ordered = [...msgs].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );        const processedMessages = ordered.map((msg) => ({
            id: msg.id,
            content: msg.content,
            isMine: msg.sender_name === user,
            sender_name: msg.sender_name,
            group_id: msg.group_id || "global",
            time: msg.created_at
              ? new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
            attachments: msg.attachments || [],
          }));
          setMessages(processedMessages);
        
        // Debug inicial después de cargar mensajes - MEJORADO
        if (typeof window !== 'undefined' && window.innerWidth < 430) {
          console.log('📱 [MOBILE INITIAL LOAD] Messages loaded from backend:', {
            totalMessages: processedMessages.length,
            messagesByGroup: processedMessages.reduce((acc, msg) => {
              const groupId = msg.group_id || 'undefined';
              if (!acc[groupId]) acc[groupId] = [];
              acc[groupId].push({
                id: msg.id,
                content: msg.content?.substring(0, 30),
                sender: msg.sender_name
              });
              return acc;
            }, {}),
            sampleMessages: processedMessages.slice(0, 3).map(m => ({
              id: m.id,
              group_id: m.group_id,
              group_id_type: typeof m.group_id,
              content: m.content?.substring(0, 40)
            }))
          });        }
        
      })
      .catch(() => {});
  }, [token, user, activeGroup]);

  // Cargar grupos
  useEffect(() => {
    if (!token) return;
    fetchGroups(token)
      .then((data) => {
        const globalGroup = { id: "global", name: "Global" };
        setGroups([globalGroup, ...data.filter((g) => g.id !== "global")]);
      })
      .catch(() => {});
  }, [token]);
  // Cargar usuarios
  useEffect(() => {
    if (!token) return;
    fetchUsers(token)
      .then((data) => {
        // El backend devuelve { users: [...] }, necesitamos extraer el array
        setUsers(data.users || []);
      })
      .catch(() => {
        setUsers([]); // Asegurar que siempre sea un array
      });
  }, [token]);

  // Configurar Socket.IO
  useEffect(() => {
    if (!token) return;

    const socket = connectSocket(token);
    socketRef.current = socket;    socket.on("receive_message", (messageData) => {
      console.log("Mensaje recibido por Socket.IO:", messageData);
      setMessages((prev) => {
        // Si es mi mensaje optimista, actualizarlo con los datos reales
        const isMyOptimisticMessage = 
          (messageData.temp_id && prev.some(msg => msg.id === messageData.temp_id)) ||
          (messageData.sender_name === user && 
           prev.some(msg => 
             msg.content === messageData.content && 
             msg.sender_name === messageData.sender_name && 
             msg.isOptimistic
           ));        if (isMyOptimisticMessage) {
          return prev.map(msg =>
            (messageData.temp_id && msg.id === messageData.temp_id) ||
            (msg.content === messageData.content && 
             msg.sender_name === messageData.sender_name && 
             msg.isOptimistic)              ? {
                  ...msg,
                  id: messageData.id || msg.id,
                  isOptimistic: false,
                  time: formatMessageTime(messageData.created_at) || msg.time,
                  attachments: messageData.attachments || msg.attachments || [],
                }
              : msg
          );
        }

        // Evitar duplicados para mensajes que no son míos
        if (prev.some(msg => msg.id === messageData.id)) {
          return prev;
        }
        
        // Agregar nuevo mensaje de otro usuario
        return [
          ...prev,
          {
            id: messageData.id,
            content: messageData.content,
            isMine: messageData.sender_name === user,
            sender_name: messageData.sender_name,
            group_id: messageData.group_id || "global",
            time: formatMessageTime(messageData.created_at),
            attachments: messageData.attachments || [],
          },
        ];
      });

      // Mostrar notificación solo para mensajes de otros usuarios
      if (messageData.sender_name !== user && messageData.group_id !== activeGroup) {
        showNotification(`Nuevo mensaje de ${messageData.sender_name}`, messageData.content);
      }
    });

    socket.on("message_error", (errorData) => {
      console.error("Error de mensaje Socket.IO:", errorData);
      setMessages((prev) =>
        prev.map((msg) =>
          errorData.temp_id && msg.id === errorData.temp_id
            ? { ...msg, error: true, isOptimistic: false }
            : msg
        )
      );
      showNotification("Error", "No se pudo enviar el mensaje. Intenta nuevamente.");
    });

    socket.on("user_typing", (data) => {
      if (data.username !== user && data.group_id === activeGroup) {
        setIsTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    });    socket.on("task_completed", (data) => {
      if (data.group_id === activeGroup) {
        showNotification(
          "Tarea completada",
          `${data.completed_by} completó: ${data.title}`
        );
        setObjectiveRefreshKey(prev => prev + 1);
        
        // Emitir evento para ChatProgressBar
        window.dispatchEvent(new CustomEvent('objectiveProgressUpdate', {
          detail: { group_id: data.group_id, type: 'task_completed', data }
        }));
      }
    });

    socket.on("objective_created", (data) => {
      if (data.group_id === activeGroup) {
        showNotification(
          "Nuevo objetivo",
          `Se creó el objetivo: ${data.title}`
        );
        setObjectiveRefreshKey(prev => prev + 1);
        
        // Emitir evento para ChatProgressBar
        window.dispatchEvent(new CustomEvent('objectiveProgressUpdate', {
          detail: { group_id: data.group_id, type: 'objective_created', data }
        }));
      }
    });

    socket.on("objective_completed", (data) => {
      if (data.group_id === activeGroup) {
        showNotification(
          "¡Objetivo completado!",
          `¡Se completó el objetivo: ${data.title}! 🎉`
        );
        setObjectiveRefreshKey(prev => prev + 1);
        
        // Emitir evento para ChatProgressBar
        window.dispatchEvent(new CustomEvent('objectiveProgressUpdate', {
          detail: { group_id: data.group_id, type: 'objective_completed', data }
        }));
      }
    });    socket.on("progress_update", (data) => {
      if (data.group_id === activeGroup) {
        setObjectiveRefreshKey(prev => prev + 1);
        
        // Emitir evento para ChatProgressBar
        window.dispatchEvent(new CustomEvent('objectiveProgressUpdate', {
          detail: { group_id: data.group_id, type: 'progress_update', data }
        }));
      }
    });

    // Eventos para tracking de usuarios online
    socket.on("user_connected", (data) => {
      console.log("Usuario conectado:", data);
      // Solicitar lista actualizada de forma segura
      try {
        socket.emit("get_online_users");
      } catch (error) {
        console.warn("Error solicitando usuarios online:", error);
      }
    });

    socket.on("user_disconnected", (data) => {
      console.log("Usuario desconectado:", data);
      // Solicitar lista actualizada de forma segura
      try {
        socket.emit("get_online_users");
      } catch (error) {
        console.warn("Error solicitando usuarios online:", error);
      }
    });

    socket.on("online_users_updated", (usersList) => {
      console.log("Lista de usuarios online actualizada:", usersList);
      try {
        if (Array.isArray(usersList)) {
          setOnlineUsers(usersList);
        } else {
          console.warn("Lista de usuarios online inválida:", usersList);
          setOnlineUsers([]);
        }
      } catch (error) {
        console.error("Error procesando usuarios online:", error);
        setOnlineUsers([]);
      }
    });

    socket.on("online_users_list", (usersList) => {
      console.log("Lista inicial de usuarios online:", usersList);
      try {
        if (Array.isArray(usersList)) {
          setOnlineUsers(usersList);
        } else {
          console.warn("Lista inicial de usuarios online inválida:", usersList);
          setOnlineUsers([]);
        }
      } catch (error) {
        console.error("Error procesando lista inicial de usuarios:", error);
        setOnlineUsers([]);
      }
    });

    // Manejo de errores de conexión
    socket.on("connect_error", (error) => {
      console.error("Error de conexión Socket.IO:", error);
      // Mantener el estado de usuarios vacío si hay problemas de conexión
      setOnlineUsers([]);
    });

    socket.on("disconnect", (reason) => {
      console.warn("Socket.IO desconectado:", reason);
      // Limpiar lista de usuarios online cuando se pierde la conexión
      setOnlineUsers([]);
    });    // Solicitar lista inicial de usuarios online de forma segura
    try {
      socket.emit("get_online_users");
    } catch (error) {
      console.warn("Error solicitando lista inicial de usuarios:", error);
    }

    // Unirse al grupo activo
    socket.emit("join_group", activeGroup);
    console.log("Uniéndose al grupo:", activeGroup);

    return () => {
      disconnectSocket();
    };
  }, [token, user, activeGroup]);

  // Unirse a nuevo grupo cuando cambie activeGroup
  useEffect(() => {
    if (socketRef.current && activeGroup) {
      socketRef.current.emit("join_group", activeGroup);
      console.log("Cambiando a grupo:", activeGroup);
    }
  }, [activeGroup]);  // Funciones de manejo
  const sendMessage = async (message, attachments = null) => {
    if (!message.trim() && (!attachments || attachments.length === 0)) return;
    if (!socketRef.current) {
      console.error("Socket no está conectado");
      showNotification("Error", "No hay conexión con el servidor");
      return;
    }

    const tempId = generateTempId();
    const tempMessage = {
      id: tempId,
      content: message,
      isMine: true,
      sender_name: user,
      group_id: activeGroup,
      time: formatMessageTime(new Date()),
      isOptimistic: true,
      attachments: attachments || [],
    };

    // Agregar mensaje optimista
    setMessages((prev) => [...prev, tempMessage]);

    try {
      // Enviar por Socket.IO para tiempo real
      socketRef.current.emit("send_message", {
        content: message,
        sender_name: user,
        group_id: activeGroup,
        temp_id: tempId,
        attachments: attachments || [],
      });
      
      console.log("Mensaje enviado por Socket.IO:", {
        content: message,
        sender_name: user,
        group_id: activeGroup,
        temp_id: tempId,
        attachments: attachments || [],
      });

    } catch (error) {
      console.error("Error enviando mensaje:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, error: true, isOptimistic: false } : msg
        )
      );
      showNotification("Error", "No se pudo enviar el mensaje");
    }
  };
  const retryMessage = (failedMessage) => {
    console.log("Reintentando mensaje:", failedMessage);
    showNotification("Info", "Funcionalidad de reintento próximamente");
  };

  const emitTyping = () => {
    if (socketRef.current) {
      socketRef.current.emit("typing", {
        group_id: activeGroup,
        username: user,
      });
    }
  };

  const handleCreateGroup = async (name) => {
    try {
      await createGroup(name, token);
      const data = await fetchGroups(token);
      const globalGroup = { id: "global", name: "Global" };
      setGroups([globalGroup, ...data.filter((g) => g.id !== "global")]);
      showNotification("Éxito", "Grupo creado correctamente");
      return true;    } catch (error) {
      console.error("Error creando grupo:", error);
      showNotification("Error", "No se pudo crear el grupo");
      return false;
    }
  };
  const handleEditGroup = async (groupId, groupData) => {
    try {
      await updateGroup(groupId, groupData.name, token);
      const data = await fetchGroups(token);
      const globalGroup = { id: "global", name: "Global" };
      setGroups([globalGroup, ...data.filter((g) => g.id !== "global")]);
      showNotification("Éxito", "Grupo actualizado correctamente");
      return true;    } catch (error) {
      console.error("Error actualizando grupo:", error);
      showNotification("Error", "No se pudo actualizar el grupo");
      return false;
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteGroup(groupId, token);
      const data = await fetchGroups(token);
      const globalGroup = { id: "global", name: "Global" };
      setGroups([globalGroup, ...data.filter((g) => g.id !== "global")]);
      if (activeGroup === groupId) {
        setActiveGroup("global");
      }
      showNotification("Éxito", "Grupo eliminado correctamente");    } catch (error) {
      console.error("Error eliminando grupo:", error);
      showNotification("Error", "No se pudo eliminar el grupo");
    }
  };

  const handleTaskUpdate = () => {
    setObjectiveRefreshKey(prev => prev + 1);
  };  const handleGroupSelect = (groupId) => {
    // Debug mejorado para el cambio de grupo
    if (typeof window !== 'undefined' && window.innerWidth < 430) {
      console.log('📱 [MOBILE GROUP CHANGE - DETAILED]', {
        fromGroup: activeGroup,
        toGroup: groupId,
        fromGroupType: typeof activeGroup,
        toGroupType: typeof groupId,
        totalMessages: messages.length,
        messagesInOldGroup: messages.filter(m => m.group_id === activeGroup).length,
        messagesInNewGroup: messages.filter(m => m.group_id === groupId).length,
        
        // Verificar si el grupo existe en los mensajes
        groupExists: messages.some(m => m.group_id === groupId),
        availableGroups: [...new Set(messages.map(m => m.group_id))],
        
        timestamp: new Date().toISOString()
      });    }
    
    setActiveGroup(groupId);
    setSidebarOpen(false);
  };
  const handleSendMessage = async (e, attachments = null) => {
    // Si es un evento, prevenir default behavior
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    await sendMessage(newMessage, attachments);
    setNewMessage("");
  };

  const handleRetryMessage = (failedMessage) => {
    retryMessage(failedMessage);
  };  const handleDeleteMessage = (messageId) => {
    console.log("Eliminando mensaje:", messageId);
    showNotification("Info", "Funcionalidad de eliminar mensaje próximamente");
  };
  const handleDeleteChat = (chatId) => {
    // Buscar el chat/grupo para eliminar
    let chatToDeleteData;
    if (chatId === "global") {
      chatToDeleteData = { id: "global", name: "Chat Global" };
    } else {
      chatToDeleteData = groups.find(g => g.id === chatId);
    }
    
    if (chatToDeleteData) {
      setChatToDelete(chatToDeleteData);
      setShowDeleteChatModal(true);
    }
  };  const handleConfirmDeleteChat = async () => {
    if (!chatToDelete) return;
    
    setIsDeletingChat(true);
    try {
      // Para TODOS los grupos (incluyendo global), solo limpiar mensajes
      await deleteGroupMessages(chatToDelete.id, token);
      
      // Limpiar mensajes del estado local para el grupo
      setMessages(prevMessages => prevMessages.filter(msg => msg.group_id !== chatToDelete.id));
      
      // Mensaje de notificación apropiado
      const isGlobal = chatToDelete.id === "global";
      const chatName = isGlobal ? "Chat Global" : chatToDelete.name;
      showNotification("¡CHAT LIMPIADO!", `El contenido del ${chatName} ha sido eliminado exitosamente`);
      
      // Reproducir sonido de éxito (opcional)
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS1/LUeysEI3bC8N+VQAURWK3g67NbGAk9k9n0wnUlBSaByO3aiToHGGC36+OZURE');
        audio.play();
      } catch {
        // Si el audio falla, no es crítico
      }
      
      setShowDeleteChatModal(false);
      setChatToDelete(null);
    } catch (error) {
      console.error("Error eliminando chat:", error);
      showNotification("ERROR", "No se pudo eliminar el chat/contenido");
    } finally {
      setIsDeletingChat(false);
    }
  };
  const handleCall = () => {
    showNotification("Info", "Funcionalidad de llamada próximamente");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    window.location.href = "/login";
  };  const getFilteredMessages = (searchTerm) => {
    // FIXED: Ensure proper string comparison for group IDs to handle UUID issues
    const groupMessages = messages.filter(msg => {
      // Convert both to strings to handle UUID comparison issues
      const msgGroupId = String(msg.group_id || '');
      const activeGroupId = String(activeGroup || '');
      return msgGroupId === activeGroupId;
    });
      if (!searchTerm || !searchTerm.trim()) {
      return groupMessages;
    }
    
    return groupMessages.filter(msg =>
      (msg.content && msg.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (msg.sender_name && msg.sender_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const filteredMessages = getFilteredMessages(search);  return (
    <div className="h-screen bg-gradient-to-br from-[#2C2C34] via-[#1A1A1F] to-[#0F0F12] text-[#E8E8E8] flex overflow-hidden relative chat-container viewport-constrained no-horizontal-overflow">
      {/* Sidebar - Mejorado para móvil */}
      <ChatSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        search={search}
        setSearch={setSearch}
        groups={groups}
        users={users}
        onlineUsers={onlineUsers}
        activeGroup={activeGroup}
        onGroupSelect={handleGroupSelect}
        userRole={userRole}
        currentUser={user}
        onCreateGroup={(groupData) => handleCreateGroup(groupData.name)}
        onEditGroup={(groupId, groupData) => handleEditGroup(groupId, groupData)}
        onDeleteGroup={handleDeleteGroup}
        onTaskUpdate={handleTaskUpdate}
        objectiveRefreshKey={objectiveRefreshKey}
      />

      {/* Overlay para móvil cuando sidebar está abierto */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}      {/* Área principal - Mejorada para móvil */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 viewport-constrained no-horizontal-overflow">{/* Header */}<ChatHeader
          activeGroup={activeGroup}
          groups={groups}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleGroupInfo={() => setShowGroupInfo(!showGroupInfo)}
          onCall={handleCall}
          onDeleteChat={handleDeleteChat}
          userMenuOpen={userMenuOpen}
          setUserMenuOpen={setUserMenuOpen}
          onLogout={handleLogout}          currentUser={user}
          userRole={userRole}
          notifications={notifications}
          onShowNotifications={handleShowNotifications}
        />        <div className="flex-1 flex min-h-0 no-horizontal-overflow">
          {/* Contenido principal - Mensajes o Objetivos */}          <div className="flex-1 flex flex-col no-horizontal-overflow">{activeTab === 'objectives' ? (
              // Área de gestión de objetivos - Mejorada para móvil
              <div className="flex-1 flex flex-col bg-gradient-to-br from-[#2C2C34] via-[#1A1A1F] to-[#0F0F12] overflow-hidden">
                <div className="border-b border-[#3C4043] bg-[#252529] p-3 sm:p-4">
                  <h2 className="text-lg sm:text-xl font-bold text-[#A8E6A3] flex items-center gap-2">
                    <Target size={20} className="sm:w-6 sm:h-6" />
                    <span className="hidden sm:inline">Gestión de Objetivos</span>
                    <span className="sm:hidden">Objetivos</span>
                    {activeGroup !== "global" && (
                      <span className="text-xs sm:text-sm text-[#B8B8B8] font-normal truncate">
                        - {groups.find(g => g.id === activeGroup)?.name || "Grupo"}
                      </span>
                    )}
                  </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Resumen de progreso - Adaptado para móvil */}
                  <div className="bg-[#252529] rounded-xl border border-[#3C4043] p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-semibold text-[#E8E8E8] mb-3 sm:mb-4">
                      Resumen de Progreso
                    </h3>
                    <ObjectiveProgressSummary 
                      groupId={activeGroup}
                      refreshKey={objectiveRefreshKey}
                    />
                  </div>

                  {/* Gestión de objetivos - Adaptada para móvil */}
                  <div className="bg-[#252529] rounded-xl border border-[#3C4043] p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-semibold text-[#E8E8E8] mb-3 sm:mb-4">
                      Objetivos del Grupo
                    </h3>
                    <ObjectiveManager 
                      groupId={activeGroup}
                      userRole={userRole}
                      refreshKey={objectiveRefreshKey}
                      onRefresh={() => setObjectiveRefreshKey(prev => prev + 1)}
                    />
                  </div>

                  {/* Vista de tareas del usuario - Adaptada para móvil */}
                  <div className="bg-[#252529] rounded-xl border border-[#3C4043] p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-semibold text-[#E8E8E8] mb-3 sm:mb-4">
                      Mis Tareas
                    </h3>
                    <UserTaskView 
                      groupId={activeGroup}
                      onTaskUpdate={() => setObjectiveRefreshKey(prev => prev + 1)}
                    />
                  </div>
                </div>
              </div>
            ) : activeTab === 'review' && canReviewTasks() ? (
              // Área de revisión de tareas - Solo para admins/supervisores
              <div className="flex-1 flex flex-col bg-gradient-to-br from-[#2C2C34] via-[#1A1A1F] to-[#0F0F12] overflow-hidden">
                <div className="border-b border-[#3C4043] bg-[#252529] p-3 sm:p-4">
                  <h2 className="text-lg sm:text-xl font-bold text-[#A8E6A3] flex items-center gap-2">
                    <ClipboardCheck size={20} className="sm:w-6 sm:h-6" />
                    <span className="hidden sm:inline">Revisión de Tareas</span>
                    <span className="sm:hidden">Revisión</span>
                    {activeGroup !== "global" && (
                      <span className="text-xs sm:text-sm text-[#B8B8B8] font-normal truncate">
                        - {groups.find(g => g.id === activeGroup)?.name || "Grupo"}
                      </span>
                    )}
                  </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                  <TaskReviewPanel 
                    groupId={activeGroup}
                    onTaskUpdate={() => setObjectiveRefreshKey(prev => prev + 1)}
                  />
                </div>
              </div>
            ) : (
              // Área de mensajes normal
              <>                {/* Barra de progreso en el chat */}
                <ChatProgressBar 
                  groupId={activeGroup}
                  onToggleObjectives={() => setActiveTab('objectives')}
                  key={`progress-${activeGroup}-${objectiveRefreshKey}`}
                />
                
                <MessageArea
                  messages={filteredMessages}
                  currentUser={user}
                  isTyping={isTyping}
                  onRetryMessage={handleRetryMessage}
                  onDeleteMessage={handleDeleteMessage}
                  messagesEndRef={messagesEndRef}
                />                <MessageInput
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  onSendMessage={handleSendMessage}
                  showEmojis={showEmojis}
                  setShowEmojis={setShowEmojis}
                  showAttachOptions={showAttachOptions}
                  setShowAttachOptions={setShowAttachOptions}
                  onTyping={emitTyping}
                  onNotification={showNotification}
                />
              </>
            )}
          </div>          {/* Panel lateral de información del grupo - Mejorado para móvil */}
          {showGroupInfo && (
            <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-[60] animate-in fade-in duration-300 p-4">
              <div className="bg-gradient-to-br from-[#2C2C34] to-[#1A1A1F] rounded-2xl border border-[#3C4043] w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-hidden animate-in slide-in-from-top-4 duration-300">
                {/* Header del modal */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#3C4043]">
                  <h3 className="text-lg sm:text-xl font-semibold text-[#A8E6A3]">Info del Grupo</h3>
                  <button onClick={() => setShowGroupInfo(false)} className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-xl hover:bg-[#3C4043]/30 transition-all">
                    <X size={20} />
                  </button>
                </div>
                {/* Contenido del modal */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[70vh]">
                  {/* Información básica del grupo */}
                  <div className="p-3 sm:p-4 bg-[#252529] rounded-xl border border-[#3C4043]">
                    <h4 className="text-sm sm:text-md font-medium mb-2 text-[#E8E8E8]">Detalles</h4>
                    <div className="space-y-2 text-xs sm:text-sm text-[#B8B8B8]">
                      <p><span className="text-[#A8E6A3]">Grupo:</span> {groups.find(g => g.id === activeGroup)?.name || 'Global'}</p>
                      <p><span className="text-[#A8E6A3]">Miembros:</span> {users.length} usuarios</p>
                      <p><span className="text-[#A8E6A3]">Estado:</span> Activo</p>
                    </div>
                  </div>
                  {/* Estadísticas de mensajes */}
                  <div className="p-3 sm:p-4 bg-[#252529] rounded-xl border border-[#3C4043]">
                    <h4 className="text-sm sm:text-md font-medium mb-2 text-[#E8E8E8]">Actividad</h4>
                    <div className="space-y-2 text-xs sm:text-sm text-[#B8B8B8]">
                      <p><span className="text-[#A8E6A3]">Mensajes hoy:</span> {filteredMessages.length}</p>
                      <p><span className="text-[#A8E6A3]">Última actividad:</span> {filteredMessages.length > 0 ? 'Hace unos minutos' : 'Sin actividad'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}</div>
      </div>      {/* Modal de notificaciones mejorado para móvil */}
      {showNotifications && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-start justify-center pt-16 sm:pt-20 z-[60] animate-in fade-in duration-300 p-4">
          <div className="bg-gradient-to-br from-[#2C2C34] via-[#252529] to-[#1A1A1F] rounded-2xl border border-[#3C4043] w-full max-w-sm sm:max-w-md max-h-[80vh] overflow-hidden animate-in slide-in-from-top-4 duration-300">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-[#A8E6A3]/10 to-[#7DD3C0]/10 border-b border-[#3C4043] p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#A8E6A3]/20 rounded-xl">
                    <Bell size={18} className="text-[#A8E6A3] sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#E8E8E8]">Notificaciones</h3>
                    <p className="text-xs sm:text-sm text-[#B8B8B8]">
                      {notifications.filter(n => !n.read).length} sin leer
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-xl hover:bg-[#3C4043] transition-all duration-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Contenido del modal */}
            <div className="p-3 sm:p-4">
              {notifications.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="p-3 sm:p-4 bg-[#A8E6A3]/10 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 flex items-center justify-center">
                    <Bell size={24} className="text-[#A8E6A3] sm:w-8 sm:h-8" />                </div>
                  <h4 className="text-base sm:text-lg font-semibold text-[#E8E8E8] mb-2">Todo al día</h4>
                  <p className="text-sm sm:text-base text-[#B8B8B8]">No tienes notificaciones pendientes</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-48 sm:max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-[#A8E6A3] scrollbar-track-[#3C4043] pr-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`group p-3 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                        notif.read 
                          ? 'bg-[#252529] border-[#3C4043] text-[#B8B8B8] hover:bg-[#2C2C34]' 
                          : 'bg-gradient-to-r from-[#A8E6A3]/10 to-[#7DD3C0]/10 border-[#A8E6A3]/30 text-[#E8E8E8] hover:from-[#A8E6A3]/20 hover:to-[#7DD3C0]/20'
                      }`}
                      onClick={() => handleMarkNotificationAsRead(notif.id)}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className={`p-1.5 sm:p-2 rounded-lg ${notif.read ? 'bg-[#3C4043]' : 'bg-[#A8E6A3]/20'}`}>
                          {notif.type === 'message' && <MessageCircle size={14} className={`sm:w-4 sm:h-4 ${notif.read ? 'text-[#B8B8B8]' : 'text-[#A8E6A3]'}`} />}
                          {notif.type === 'objective' && <Target size={14} className={`sm:w-4 sm:h-4 ${notif.read ? 'text-[#B8B8B8]' : 'text-[#A8E6A3]'}`} />}
                          {notif.type === 'user' && <Users size={14} className={`sm:w-4 sm:h-4 ${notif.read ? 'text-[#B8B8B8]' : 'text-[#A8E6A3]'}`} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-xs sm:text-sm leading-snug truncate">{notif.title}</h4>
                            <span className="text-xs opacity-60 whitespace-nowrap">{notif.time}</span>
                          </div>
                          <p className="text-xs sm:text-sm mt-1 opacity-80 leading-relaxed line-clamp-2">{notif.content}</p>
                          {!notif.read && (
                            <div className="flex items-center gap-1 mt-2">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#A8E6A3] rounded-full animate-pulse"></div>
                              <span className="text-xs text-[#A8E6A3] font-medium">Nuevo</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer del modal */}
            {notifications.length > 0 && (
              <div className="border-t border-[#3C4043] p-3 sm:p-4 bg-[#252529]/50">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    }}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#3C4043] text-[#E8E8E8] rounded-xl hover:bg-[#4A4A4F] transition-all duration-200 text-xs sm:text-sm font-medium"
                  >
                    Marcar todas como leídas
                  </button>
                  <button
                    onClick={handleClearAllNotifications}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 bg-red-900/20 text-red-400 rounded-xl hover:bg-red-900/30 transition-all duration-200 text-xs sm:text-sm font-medium border border-red-800/30"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}      {/* Banner de notificaciones */}
      <NotificationBanner
        notification={notification}
        onClose={() => setNotification(null)}
      />      {/* Modal de confirmación para eliminar chat */}
      <DeleteChatModal
        isOpen={showDeleteChatModal}
        onClose={() => setShowDeleteChatModal(false)}
        onConfirm={handleConfirmDeleteChat}        chatName={chatToDelete?.name || ""}
        isDeleting={isDeletingChat}
        isGlobalChat={chatToDelete?.id === "global"}
      />
    </div>
  );
};

export default ChatContainer;
