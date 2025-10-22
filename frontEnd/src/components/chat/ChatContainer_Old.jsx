import React, { useState, useEffect, useRef } from "react";
import {
  fetchMessages,
  fetchGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  fetchUsers,
} from "../../utils/api";
import { connectSocket, disconnectSocket } from "../../utils/socket";
import ObjectiveManager from "../ObjectiveManager";
import UserTaskView from "../UserTaskView";
import ObjectiveProgressSummary from "../ObjectiveProgressSummary";

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
  
  // Estados de modales
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [editGroupName, setEditGroupName] = useState("");

  // Estados adicionales necesarios
  const [notification, setNotification] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [objectiveRefreshKey, setObjectiveRefreshKey] = useState(0);

  // Referencias
  const socketRef = useRef(null);

  // Datos del usuario
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("username") || "";
  const userRole = localStorage.getItem("userRole") || "user";

  // Función para mostrar notificaciones
  const showNotification = (title, message) => {
    setNotification({ title, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Función para filtrar mensajes
  const getFilteredMessages = (searchTerm) => {
    if (!searchTerm) return messages;
    return messages.filter(message => 
      message.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Función para enviar mensajes
  const sendMessage = async (content) => {
    try {
      const messageData = {
        content,
        group_id: activeGroup,
        user_id: user,
        timestamp: new Date().toISOString()
      };
      
      // Aquí iría la lógica para enviar el mensaje
      console.log("Sending message:", messageData);
      showNotification("Éxito", "Mensaje enviado");
    } catch (error) {
      console.error("Error sending message:", error);
      showNotification("Error", "Error al enviar mensaje");
    }
  };

  // Función para reintentar mensajes
  

  // Función para crear grupo
  const handleCreateGroup = async (name) => {
    try {
      await createGroup({ name });
      showNotification("Éxito", "Grupo creado exitosamente");
      // Aquí iría la lógica para actualizar la lista de grupos
      return true;
    } catch (error) {
      console.error("Error creating group:", error);
      showNotification("Error", "Error al crear grupo");
      return false;
    }
  };

  // Función para editar grupo
  const handleEditGroup = async (groupId, name) => {
    try {
      await updateGroup(groupId, { name });
      showNotification("Éxito", "Grupo actualizado exitosamente");
      // Aquí iría la lógica para actualizar la lista de grupos
      return true;
    } catch (error) {
      console.error("Error updating group:", error);
      showNotification("Error", "Error al actualizar grupo");
      return false;
    }
  };

  // Función para eliminar grupo
  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteGroup(groupId);
      showNotification("Éxito", "Grupo eliminado exitosamente");
      // Aquí iría la lógica para actualizar la lista de grupos
    } catch (error) {
      console.error("Error deleting group:", error);
      showNotification("Error", "Error al eliminar grupo");
    }
  };

  // Función para manejar typing
  const emitTyping = () => {
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000);
  };

  // useEffect para cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [messagesData, groupsData, usersData] = await Promise.all([
          fetchMessages(activeGroup),
          fetchGroups(),
          fetchUsers()
        ]);
        
        setMessages(messagesData || []);
        setGroups(groupsData || []);
        setUsers(usersData || []);
      } catch (error) {
        console.error("Error loading initial data:", error);
        showNotification("Error", "Error al cargar datos");
      }
    };

    if (token) {
      loadInitialData();
    }
  }, [activeGroup, token]);

  // useEffect para socket connection
  useEffect(() => {
    if (token) {
      socketRef.current = connectSocket(token);
      
      return () => {
        if (socketRef.current) {
          disconnectSocket();
        }
      };
    }
  }, [token]);

  // Handlers de UI
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    await sendMessage(newMessage);
    setNewMessage("");
  };

  const handleRetryMessage = async (failedMessage) => {
    // Simple retry: re-send the failed message content
    if (!failedMessage || !failedMessage.content) return;
    await sendMessage(failedMessage.content);
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      // Optimistically remove the message from local state
      setMessages(prev => prev.filter(m => m.id !== messageId));
      // If you have an API endpoint to delete messages, call it here.
      // await deleteMessage(messageId);

      showNotification("Éxito", "Mensaje eliminado exitosamente");
    } catch (error) {
      console.error("Error deleting message:", error);
      showNotification("Error", "Error al eliminar mensaje");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    window.location.href = "/login";
  };

  const handleGroupClick = (groupId) => {
    setActiveGroup(groupId);
    setSidebarOpen(false); // Cerrar sidebar en móvil
  };

  const handleCreateGroupSubmit = async (e) => {
    e.preventDefault();
    const success = await handleCreateGroup(groupName);
    if (success) {
      setGroupName("");
      setShowGroupModal(false);
    }
  };

  const handleEditGroupSubmit = async (e) => {
    e.preventDefault();
    if (!editingGroup) return;
    
    const success = await handleEditGroup(editingGroup.id, editGroupName);
    if (success) {
      setEditGroupName("");
      setEditingGroup(null);
      setShowEditGroupModal(false);
    }
  };

  const openEditGroupModal = (group) => {
    setEditingGroup(group);
    setEditGroupName(group.name);
    setShowEditGroupModal(true);
  };

  const handleCall = () => {
    showNotification("Info", "Funcionalidad de llamada próximamente");
  };

  const handleVideoCall = () => {
    showNotification("Info", "Funcionalidad de videollamada próximamente");
  };
  const handleTaskUpdate = () => {
    // El hook ya maneja la actualización automática
    setObjectiveRefreshKey(prev => prev + 1);
  };

  // Mensajes filtrados
  const filteredMessages = getFilteredMessages(search);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ChatSidebar
        activeTab={activeTab}
        search={search}
        groups={groups}
        users={users}
        activeGroup={activeGroup}
        userRole={userRole}
        currentUser={user}
        sidebarOpen={sidebarOpen}
        userMenuOpen={userMenuOpen}
        onTabChange={setActiveTab}
        onSearchChange={(e) => setSearch(e.target.value)}
        onGroupClick={handleGroupClick}
        onCreateGroup={() => setShowGroupModal(true)}
        onEditGroup={openEditGroupModal}
        onDeleteGroup={handleDeleteGroup}
        onCloseSidebar={() => setSidebarOpen(false)}
        onToggleUserMenu={() => setUserMenuOpen(!userMenuOpen)}
        onLogout={handleLogout}
      />

      {/* Área principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <ChatHeader
          activeGroup={activeGroup}
          groups={groups}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleGroupInfo={() => setShowGroupInfo(!showGroupInfo)}
          onCall={handleCall}
          onVideoCall={handleVideoCall}
          isMobile={true}
        />

        {/* Contenido principal */}
        <div className="flex-1 flex">
          {/* Área de mensajes */}
          <div className="flex-1 flex flex-col">
            <MessageArea
              messages={filteredMessages}
              onRetryMessage={handleRetryMessage}
              onDeleteMessage={handleDeleteMessage}
              userRole={userRole}
              currentUser={user}
              isTyping={isTyping}
            />
            
            <MessageInput
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              onSendMessage={handleSendMessage}
              onTyping={emitTyping}
            />
          </div>

          {/* Panel lateral de información del grupo */}
          {showGroupInfo && (
            <div className="w-80 border-l bg-white overflow-y-auto">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Información del Grupo</h3>
                
                {/* Progreso de objetivos */}
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-2">Progreso de Objetivos</h4>
                  <ObjectiveProgressSummary
                    groupId={activeGroup}
                    refreshKey={objectiveRefreshKey}
                  />
                </div>

                {/* Gestor de objetivos (solo admin) */}
                {userRole === "admin" && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium mb-2">Gestión de Objetivos</h4>
                    <ObjectiveManager
                      groupId={activeGroup}
                      onTaskUpdate={handleTaskUpdate}
                    />
                  </div>
                )}

                {/* Vista de tareas del usuario */}
                <div>
                  <h4 className="text-md font-medium mb-2">Mis Tareas</h4>
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
        title="Crear Nuevo Grupo"
        buttonText="Crear Grupo"
        groupName={groupName}
        setGroupName={setGroupName}
      />

      <GroupModal
        isOpen={showEditGroupModal}
        onClose={() => {
          setShowEditGroupModal(false);
          setEditGroupName("");
          setEditingGroup(null);
        }}
        onSubmit={handleEditGroupSubmit}
        title="Editar Grupo"
        buttonText="Guardar Cambios"
        groupName={editGroupName}
        setGroupName={setEditGroupName}
        isEditing={true}
      />

      {/* Notificaciones */}
      <NotificationBanner
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default ChatContainer;
