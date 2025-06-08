import React, { useState, useEffect, useRef } from "react";
import {
  fetchMessages,
  fetchGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  fetchUsers,
  sendMessage as apiSendMessage,
} from "../../utils/api";
import { connectSocket, disconnectSocket } from "../../utils/socket";
import ObjectiveManager from "../ObjectiveManager";
import UserTaskView from "../UserTaskView";
import ObjectiveProgressSummary from "../ObjectiveProgressSummary";
import { generateTempId, formatMessageTime } from "../../utils/chatUtils";

// Import components
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import MessageArea from "./MessageArea";
import MessageInput from "./MessageInput";
import NotificationBanner from "./NotificationBanner";
import GroupModal from "./GroupModal";

const ChatContainer = () => {
  // Estados principales
  const [messages, setMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeGroup, setActiveGroup] = useState("global");

  // Estados de UI
  const [activeTab, setActiveTab] = useState("chats");
  const [search, setSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [showAttachOptions, setShowAttachOptions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [notification, setNotification] = useState(null);
  const [objectiveRefreshKey, setObjectiveRefreshKey] = useState(0);

  // Referencias
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
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
            time: msg.created_at
              ? new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
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
      .catch(() => {});
  }, [token]);

  // Cargar usuarios
  useEffect(() => {
    if (!token) return;
    fetchUsers(token)
      .then((data) => {
        setUsers(data);
      })
      .catch(() => {});
  }, [token]);

  // Configurar Socket.IO
  useEffect(() => {
    if (!token) return;

    const socket = connectSocket(token);
    socketRef.current = socket;

    socket.on("message", (messageData) => {
      setMessages((prev) => [
        ...prev,
        {
          id: messageData.id,
          content: messageData.content,
          isMine: messageData.sender_name === user,
          sender_name: messageData.sender_name,
          group_id: messageData.group_id || "global",
          time: formatMessageTime(messageData.created_at),
        },
      ]);
    });

    socket.on("user_typing", (data) => {
      if (data.username !== user && data.group_id === activeGroup) {
        setIsTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    });

    socket.on("task_completed", (data) => {
      if (data.group_id === activeGroup) {
        showNotification(
          "Tarea completada",
          `${data.completed_by} completó: ${data.title}`
        );
        setObjectiveRefreshKey(prev => prev + 1);
      }
    });

    socket.on("objective_created", (data) => {
      if (data.group_id === activeGroup) {
        showNotification(
          "Nuevo objetivo",
          `Se creó el objetivo: ${data.title}`
        );
        setObjectiveRefreshKey(prev => prev + 1);
      }
    });

    socket.on("objective_completed", (data) => {
      if (data.group_id === activeGroup) {
        showNotification(
          "¡Objetivo completado!",
          `¡Se completó el objetivo: ${data.title}! 🎉`
        );
        setObjectiveRefreshKey(prev => prev + 1);
      }
    });

    socket.on("progress_update", (data) => {
      if (data.group_id === activeGroup) {
        setObjectiveRefreshKey(prev => prev + 1);
      }
    });

    return () => {
      disconnectSocket();
    };
  }, [token, user, activeGroup]);

  // Funciones de manejo
  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const tempId = generateTempId();
    const tempMessage = {
      id: tempId,
      content: message,
      isMine: true,
      sender_name: user,
      group_id: activeGroup,
      time: formatMessageTime(new Date()),
      isTemp: true,
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      await apiSendMessage(message, activeGroup, token);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, isTemp: false } : msg
        )
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, failed: true } : msg
        )
      );
    }
  };

  const retryMessage = (failedMessage) => {
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
      return true;
    } catch (error) {
      showNotification("Error", "No se pudo crear el grupo");
      return false;
    }
  };

  const handleEditGroup = async (groupId, newName) => {
    try {
      await updateGroup(groupId, newName, token);
      const data = await fetchGroups(token);
      const globalGroup = { id: "global", name: "Global" };
      setGroups([globalGroup, ...data.filter((g) => g.id !== "global")]);
      showNotification("Éxito", "Grupo actualizado correctamente");
      return true;
    } catch (error) {
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
      showNotification("Éxito", "Grupo eliminado correctamente");
    } catch (error) {
      showNotification("Error", "No se pudo eliminar el grupo");
    }
  };

  const handleTaskUpdate = () => {
    setObjectiveRefreshKey(prev => prev + 1);
  };

  const handleGroupSelect = (groupId) => {
    setActiveGroup(groupId);
    setSidebarOpen(false);
  };

  const handleSendMessage = async () => {
    await sendMessage(newMessage);
    setNewMessage("");
  };

  const handleRetryMessage = (failedMessage) => {
    retryMessage(failedMessage);
  };

  const handleDeleteMessage = (messageId) => {
    showNotification("Info", "Funcionalidad de eliminar mensaje próximamente");
  };

  const handleCreateGroupSubmit = async () => {
    const success = await handleCreateGroup(groupName);
    if (success) {
      setShowGroupModal(false);
      setGroupName("");
    }
  };

  const handleEditGroupSubmit = async () => {
    const success = await handleEditGroup(editingGroup.id, editGroupName);
    if (success) {
      setShowEditGroupModal(false);
      setEditingGroup(null);
      setEditGroupName("");
    }
  };

  const handleCall = () => {
    showNotification("Info", "Funcionalidad de llamada próximamente");
  };

  const handleVideoCall = () => {
    showNotification("Info", "Funcionalidad de videollamada próximamente");
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const getFilteredMessages = (searchTerm) => {
    return messages.filter(
      (msg) =>
        msg.group_id === activeGroup &&
        msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredMessages = getFilteredMessages(search);

  return (
    <div className="h-screen bg-[#1E1E2E] text-white flex overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        search={search}
        setSearch={setSearch}
        groups={groups}
        users={users}
        activeGroup={activeGroup}
        onGroupSelect={handleGroupSelect}
        userRole={userRole}
        currentUser={user}
        onCreateGroup={() => setShowGroupModal(true)}
        onEditGroup={(group) => {
          setEditingGroup(group);
          setEditGroupName(group.name);
          setShowEditGroupModal(true);
        }}
        onDeleteGroup={handleDeleteGroup}
      />

      {/* Área principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <ChatHeader
          activeGroup={activeGroup}
          groups={groups}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleGroupInfo={() => setShowGroupInfo(!showGroupInfo)}
          onCall={handleCall}
          onVideoCall={handleVideoCall}
          userMenuOpen={userMenuOpen}
          setUserMenuOpen={setUserMenuOpen}
          onLogout={handleLogout}
          currentUser={user}
          userRole={userRole}
        />

        <div className="flex-1 flex min-h-0">
          {/* Mensajes */}
          <div className="flex-1 flex flex-col">
            <MessageArea
              messages={filteredMessages}
              currentUser={user}
              isTyping={isTyping}
              onRetryMessage={handleRetryMessage}
              onDeleteMessage={handleDeleteMessage}
              messagesEndRef={messagesEndRef}
            />

            <MessageInput
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              onSendMessage={handleSendMessage}
              showEmojis={showEmojis}
              setShowEmojis={setShowEmojis}
              showAttachOptions={showAttachOptions}
              setShowAttachOptions={setShowAttachOptions}
              onTyping={emitTyping}
            />
          </div>

          {/* Panel lateral de información del grupo */}
          {showGroupInfo && (
            <div className="w-80 border-l border-[#3C3C4E] bg-[#1E1E2E] overflow-y-auto custom-scrollbar">
              <div className="p-6">
                {/* Progreso de objetivos */}
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-2 text-white">Progreso de Objetivos</h4>
                  <ObjectiveProgressSummary
                    groupId={activeGroup}
                    refreshKey={objectiveRefreshKey}
                  />
                </div>

                {/* Gestor de objetivos (solo admin) */}
                {userRole === "admin" && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium mb-2 text-white">Gestión de Objetivos</h4>
                    <ObjectiveManager
                      groupId={activeGroup}
                      onTaskUpdate={handleTaskUpdate}
                    />
                  </div>
                )}

                {/* Vista de tareas del usuario */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-white">Mis Tareas</h4>
                  <UserTaskView
                    groupId={activeGroup}
                    onTaskUpdate={handleTaskUpdate}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      <GroupModal
        isOpen={showGroupModal}
        onClose={() => {
          setShowGroupModal(false);
          setGroupName("");
        }}
        onSubmit={handleCreateGroupSubmit}
        groupName={groupName}
        setGroupName={setGroupName}
        title="Crear Nuevo Grupo"
        isEdit={false}
      />

      <GroupModal
        isOpen={showEditGroupModal}
        onClose={() => {
          setShowEditGroupModal(false);
          setEditingGroup(null);
          setEditGroupName("");
        }}
        onSubmit={handleEditGroupSubmit}
        groupName={editGroupName}
        setGroupName={setEditGroupName}
        title="Editar Grupo"
        isEdit={true}
      />

      {/* Banner de notificaciones */}
      <NotificationBanner
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default ChatContainer;
