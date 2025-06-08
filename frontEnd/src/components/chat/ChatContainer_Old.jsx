import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Menu,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  Users,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Check,
  Plus,
  X,
  Info,
  MessageSquare,
  UserPlus,
  ArrowLeft,
  ImageIcon,
  Mic,
  Trash2,
  Edit2,
  User,
  Eye,
  Target,
  Sun,
  Moon,
} from "lucide-react";
import {
  fetchMessages,
  fetchGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  fetchUsers,
  deleteGroupMessages,
  deleteMessage,
  sendMessage as apiSendMessage,
} from "../../utils/api";
import { connectSocket, disconnectSocket } from "../../utils/socket";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/vs2015.css";
import "../../styles/markdown.css";
import ObjectiveManager from "../ObjectiveManager";
import UserTaskView from "../UserTaskView";
import ObjectiveProgressSummary from "../ObjectiveProgressSummary";
import { getInitials, getAvatarColor, generateTempId, formatMessageTime } from "../../utils/chatUtils";

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

  // Handlers de UI
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    await sendMessage(newMessage);
    setNewMessage("");
  };

  const handleRetryMessage = (failedMessage) => {
    retryMessage(failedMessage);
  };

  const handleDeleteMessage = async (messageId) => {
    // Placeholder - implementar cuando sea necesario
    console.log("Message to delete:", messageId);
    showNotification("Info", "Funcionalidad de eliminar mensaje próximamente");
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
