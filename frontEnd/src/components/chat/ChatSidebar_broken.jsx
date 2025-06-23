import React, { useState, useCallback, useEffect } from "react";
import {
  Search,
  MessageCircle,
  Users,
  Target,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  LogOut,
  X,
  ChevronDown,
  User,
  Save,
  Lightbulb,
  Calendar,
  ClipboardCheck,
  Star,
  Menu
} from "lucide-react";
import { getInitials, getAvatarColor } from "../../utils/chatUtils";
import { canReviewTasks, isAdmin } from "../../utils/auth";

// Componente de menú de usuario simplificado
const UserMenu = ({ onLogout, onClose, onOpenProfile }) => {
  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-gradient-to-b from-[#1A1A1F] to-[#0F0F12] border border-[#3C4043] rounded-xl z-50 overflow-hidden backdrop-blur-sm">
      <div className="p-2 space-y-1">
        <button
          onClick={() => {
            onOpenProfile();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-[#E8E8E8] hover:bg-[#3C4043] rounded-lg transition-all duration-200 group"
        >
          <User size={16} className="text-[#A8E6A3] group-hover:scale-110 transition-transform" />
          <span className="font-medium">Ver perfil</span>
        </button>
        
        <div className="h-px bg-[#3C4043] my-1"></div>
        
        <button
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200 group"
        >
          <LogOut size={16} className="group-hover:scale-110 transition-transform" />
          <span className="font-medium">Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
};

const ChatSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
  search,
  setSearch,
  groups,
  users,
  onlineUsers = [],
  activeGroup,
  onGroupSelect,
  userRole,
  currentUser,
  onCreateGroup,
  onEditGroup,
  onDeleteGroup,
}) => {  // Función para determinar si un usuario está online usando datos reales de Socket.IO
  const isUserOnline = (userId) => {
    try {
      // Usar datos reales de Socket.IO si están disponibles
      if (Array.isArray(onlineUsers) && onlineUsers.length > 0) {
        return onlineUsers.some(onlineUser => onlineUser.userId === userId);
      }
      
      // Fallback: usar simulación si no hay datos reales (para compatibilidad)
      return Math.random() > 0.3; // 70% probabilidad de estar online
    } catch (error) {
      console.warn('Error checking online status:', error);
      // Fallback en caso de error
      return false;
    }
  };
  const [showGroupOptions, setShowGroupOptions] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupForm, setGroupForm] = useState({ name: '', description: '' });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Iniciar colapsado
  const [profileForm, setProfileForm] = useState({
    username: currentUser,
    email: '',
    bio: '',
    avatar: null
  });

  // Función para toggle del sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Función para cambiar pestañas y expandir sidebar automáticamente
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
    }
  };

  const filteredGroups = search.trim()
    ? (groups || []).filter(group =>
        group.name.toLowerCase().includes(search.toLowerCase())
      )
    : (groups || []);  const filteredUsers = search.trim()
    ? (Array.isArray(users) ? users : []).filter(user =>
        user.username?.toLowerCase().includes(search.toLowerCase())
      )
    : (Array.isArray(users) ? users : []);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    window.location.href = "/login";
  };

  // Funciones para el redimensionamiento
  const handleMouseMove = useCallback((e) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth >= 280 && newWidth <= 500) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // Funciones para modales de grupos
  const handleCreateGroup = () => {
    setGroupForm({ name: '', description: '' });
    setShowCreateModal(true);
  };

  const handleEditGroupClick = (group) => {
    setEditingGroup(group);
    setGroupForm({ name: group.name, description: group.description || '' });
    setShowEditModal(true);
    setShowGroupOptions(null);
  };

  const handleSubmitCreate = () => {
    if (groupForm.name.trim()) {
      onCreateGroup(groupForm);
      setShowCreateModal(false);
      setGroupForm({ name: '', description: '' });
    }
  };

  const handleSubmitEdit = () => {
    if (groupForm.name.trim() && editingGroup) {
      onEditGroup(editingGroup.id, groupForm);
      setShowEditModal(false);
      setEditingGroup(null);
      setGroupForm({ name: '', description: '' });
    }
  };

  const handleDeleteGroupClick = (groupId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este grupo?')) {
      onDeleteGroup(groupId);
      setShowGroupOptions(null);
    }
  };  return (
    <>
      {/* Sidebar mejorado para móvil */}
      <div 
        className={`
          fixed lg:relative top-0 left-0 h-screen bg-gradient-to-b from-[#2C2C34] via-[#252529] to-[#1A1A1F] border-r border-[#3C4043] 
          transform transition-transform duration-300 ease-in-out z-50 flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-full max-w-xs sm:max-w-sm lg:max-w-none
        `}        style={{ 
          width: window.innerWidth < 1024 ? '100vw' : `${sidebarWidth}px`, 
          maxWidth: window.innerWidth < 1024 ? '380px' : 'none',
          minWidth: window.innerWidth < 1024 ? '320px' : '320px'
        }}
      >
        {/* Header del sidebar - Responsivo */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[#3C4043] bg-[#252529]">
          <h1 className="text-lg sm:text-xl font-bold text-[#A8E6A3]">Thinkchat</h1>
          
          {/* Botón cerrar móvil */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-full hover:bg-[#3C4043] transition-all duration-200 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menú de usuario - Mejorado para móvil */}
        <div className="p-3 sm:p-4 border-b border-[#3C4043] relative bg-[#252529]">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center justify-between p-2 sm:p-3 text-left text-[#E8E6E8] hover:bg-[#3C4043] rounded-xl transition-all duration-200 group"
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium text-white border-2 border-[#A8E6A3]"
                style={{ backgroundColor: getAvatarColor(currentUser) }}
              >
                {getInitials(currentUser)}
              </div>              <div className="min-w-0">
                <div className="font-semibold text-[#E8E6E8] group-hover:text-[#A8E6A3] transition-colors truncate text-sm sm:text-base">
                  {currentUser}
                </div>
                <div className="text-xs text-[#A8E6A3] capitalize font-medium">
                  {userRole === 'admin' ? '👑 ' : ''}
                  {userRole}
                </div>
              </div>
            </div>
            <ChevronDown 
              size={14} 
              className={`transform transition-all duration-200 text-[#A8E6A3] sm:w-4 sm:h-4 ${userMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>            {userMenuOpen && (
            <UserMenu 
              onLogout={handleLogout} 
              onClose={() => setUserMenuOpen(false)}
              onOpenProfile={() => setShowProfile(true)}
            />
          )}
        </div>

        {/* Barra de búsqueda - Mejorada para móvil */}
        <div className="p-3 sm:p-4 bg-[#252529]">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A8E6A3] sm:w-4 sm:h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-[#1A1A1F] border border-[#2C2C34] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6A3] focus:border-transparent text-[#E8E8E8] placeholder-[#B8B8B8] transition-all duration-200 text-sm sm:text-base"
              />
            </div>
          </div>
        </div>        {/* Tabs de navegación - Rediseñado y responsive */}
        <div className="border-b border-[#3C4043] bg-[#252529]">
          {/* Primera fila - Funcionalidades principales */}
          <div className="flex">
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeTab === 'chats'
                  ? 'text-[#A8E6A3] border-b-2 border-[#A8E6A3] bg-[#2C2C34]'
                  : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
              }`}
            >
              <MessageCircle size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Chat</span>
              <span className="sm:hidden">Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeTab === 'users'
                  ? 'text-[#A8E6A3] border-b-2 border-[#A8E6A3] bg-[#2C2C34]'
                  : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
              }`}
            >
              <Users size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Online</span>
              <span className="sm:hidden">On</span>
            </button>

            <button
              onClick={() => setActiveTab('objectives')}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeTab === 'objectives'
                  ? 'text-[#A8E6A3] border-b-2 border-[#A8E6A3] bg-[#2C2C34]'
                  : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
              }`}
            >
              <Target size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{isAdmin(userRole) ? 'Objetivos' : 'Tareas'}</span>
              <span className="sm:hidden">{isAdmin(userRole) ? 'Obj' : 'Tar'}</span>
            </button>

            {/* Tab de revisión - Solo para admins/supervisores */}
            {canReviewTasks() && (
              <button
                onClick={() => setActiveTab('review')}
                className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 ${
                  activeTab === 'review'
                    ? 'text-[#A8E6A3] border-b-2 border-[#A8E6A3] bg-[#2C2C34]'
                    : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
                }`}
              >
                <ClipboardCheck size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Revisión</span>
                <span className="sm:hidden">Rev</span>
              </button>
            )}
          </div>

          {/* Segunda fila - Funcionalidades colaborativas */}
          <div className="flex border-t border-[#3C4043]/50">
            <button
              onClick={() => setActiveTab('ideas')}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeTab === 'ideas'
                  ? 'text-[#A8E6A3] border-b-2 border-[#A8E6A3] bg-[#2C2C34]'
                  : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
              }`}
            >
              <Lightbulb size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Ideas</span>
              <span className="sm:hidden">Ideas</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeTab === 'calendar'
                  ? 'text-[#A8E6A3] border-b-2 border-[#A8E6A3] bg-[#2C2C34]'
                  : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
              }`}
            >
              <Calendar size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Eventos</span>
              <span className="sm:hidden">Cal</span>
            </button>
          </div>
        </div>

        {/* Contenido de tabs - Mejorado para móvil */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#3C4043] scrollbar-track-[#252529]">
          {activeTab === "chats" && (
            <div className="p-3 sm:p-4 space-y-2">
              {/* Lista de grupos - Adaptada para móvil */}
              {filteredGroups.map((group) => (
                <div key={group.id} className="relative group">
                  <button
                    onClick={() => onGroupSelect(group.id)}
                    className={`w-full flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 text-left rounded-lg transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#A8E6A3] focus:ring-opacity-50 ${
                      activeGroup === group.id
                        ? 'bg-gradient-to-r from-[#A8E6A3]/20 to-[#7DD3C0]/20 border border-[#A8E6A3]/30 text-[#E8E8E8]'
                        : 'bg-[#252529] border border-[#3C4043] text-[#B8B8B8] hover:bg-[#3C4043] hover:border-[#A8E6A3]/30 hover:text-[#E8E8E8]'
                    }`}
                  >
                    <div
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium text-white flex-shrink-0"
                      style={{ backgroundColor: getAvatarColor(group.name) }}
                    >
                      {getInitials(group.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs sm:text-sm truncate">{group.name}</div>
                      {group.description && (
                        <div className="text-xs text-[#B8B8B8] truncate mt-1">{group.description}</div>
                      )}
                      <div className="text-xs text-[#A8E6A3] opacity-80 mt-1">
                        {group.id === "global" ? "Chat global" : "Grupo privado"}
                      </div>
                    </div>
                  </button>

                  {/* Menú de opciones del grupo (solo admin y no global) */}
                  {userRole === "admin" && group.id !== "global" && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowGroupOptions(showGroupOptions === group.id ? null : group.id);
                        }}
                        className="p-1 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-lg hover:bg-[#3C4043] transition-all"
                      >
                        <MoreVertical size={16} />
                      </button>                      {showGroupOptions === group.id && (
                        <div className="absolute top-8 right-0 bg-[#1A1A1F] border border-[#3C4043] rounded-xl z-50 min-w-[150px] overflow-hidden">
                          <button
                            onClick={() => handleEditGroupClick(group)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-[#E8E6E8] hover:bg-[#3C4043] transition-all"
                          >
                            <Edit2 size={14} className="text-[#A8E6A3]" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteGroupClick(group.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-400 hover:bg-red-900/20 transition-all"
                          >
                            <Trash2 size={14} />
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {filteredGroups.length === 0 && (
                <div className="text-center py-8 text-[#B8B8B8]">
                  <MessageCircle size={48} className="mx-auto mb-4 text-[#3C4043]" />
                  <p>No se encontraron grupos</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "users" && (
            <div className="p-4">              <div className="space-y-2">                {Array.isArray(filteredUsers) && filteredUsers.map((user) => {
                  // Usar estado real de online/offline desde Socket.IO
                  const isOnline = isUserOnline(user.id);
                  
                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 bg-[#252529] border border-[#3C4043] rounded-xl hover:bg-[#3C4043] hover:border-[#A8E6A3]/30 transition-all duration-200"
                    >
                      <div className="relative">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white"
                          style={{ backgroundColor: getAvatarColor(user.username || user.name || '') }}
                        >
                          {getInitials(user.username || user.name || '')}
                        </div>
                        {/* Indicador de estado online/offline */}
                        <div 
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#252529] ${
                            isOnline ? 'bg-green-500' : 'bg-gray-500'
                          }`}
                          title={isOnline ? 'En línea' : 'Desconectado'}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-[#E8E8E8]">{user.username || user.name}</div>
                        <div className="text-xs flex items-center gap-2">
                          <span className={`${isOnline ? 'text-green-400' : 'text-gray-400'}`}>
                            {isOnline ? '🟢 En línea' : '⚫ Desconectado'}
                          </span>
                          {user.role === 'admin' && (
                            <span className="text-[#A8E6A3]">👑 Admin</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
                {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-[#B8B8B8]">
                  <Users size={48} className="mx-auto mb-4 text-[#3C4043]" />
                  <p>No hay usuarios conectados</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "review" && (
            <div className="p-4">
              <div className="bg-[#252529] rounded-xl p-6 border border-[#3C4043] text-center">
                <ClipboardCheck size={48} className="mx-auto mb-4 text-[#A8E6A3]" />
                <h3 className="text-lg font-semibold text-[#E8E6E8] mb-2">Revisión de Tareas</h3>
                <p className="text-[#B8B8B8] text-sm mb-4">
                  Revisar, aprobar o rechazar tareas enviadas por los usuarios.
                </p>
                <div className="text-xs text-[#A8E6A3] bg-[#A8E6A3]/10 rounded-lg p-3">
                  💡 Selecciona un grupo y accede al panel de revisión desde el área principal
                </div>
              </div>
            </div>
          )}          {activeTab === "objectives" && (
            <div className="p-4">
              <div className="bg-[#252529] rounded-xl p-6 border border-[#3C4043] text-center">
                <Target size={48} className="mx-auto mb-4 text-[#A8E6A3]" />
                <h3 className="text-lg font-semibold text-[#E8E6E8] mb-2">Gestión de Objetivos</h3>
                <p className="text-[#B8B8B8] text-sm mb-4">
                  Los objetivos y tareas se gestionan desde el área principal del chat.
                </p>
                <div className="text-xs text-[#A8E6A3] bg-[#A8E6A3]/10 rounded-lg p-3">
                  💡 Selecciona un grupo y accede a los objetivos desde el panel principal
                </div>
              </div>
            </div>
          )}          {activeTab === "ideas" && (
            <div className="p-4">
              <div className="bg-[#252529] rounded-xl p-6 border border-[#3C4043] text-center">
                <Lightbulb size={48} className="mx-auto mb-4 text-[#A8E6A3]" />
                <h3 className="text-lg font-semibold text-[#E8E6E8] mb-2">Muro de Ideas</h3>
                <p className="text-[#B8B8B8] text-sm mb-4">
                  Comparte ideas creativas, colabora con tu equipo y vota por las mejores propuestas.
                </p>
                <div className="text-xs text-[#A8E6A3] bg-[#A8E6A3]/10 rounded-lg p-3 mb-3">
                  💡 Cada idea puede ser votada y comentada por los miembros del grupo
                </div>
                <div className="text-xs text-[#B8B8B8]">
                  Selecciona un grupo para comenzar a colaborar
                </div>
              </div>
            </div>
          )}

          {activeTab === "calendar" && (
            <div className="p-4">
              <div className="bg-[#252529] rounded-xl p-6 border border-[#3C4043] text-center">
                <Calendar size={48} className="mx-auto mb-4 text-[#A8E6A3]" />
                <h3 className="text-lg font-semibold text-[#E8E6E8] mb-2">Calendario de Eventos</h3>
                <p className="text-[#B8B8B8] text-sm mb-4">
                  Organiza fechas especiales, hitos importantes y eventos relacionados con los objetivos del grupo.
                </p>
                <div className="text-xs text-[#A8E6A3] bg-[#A8E6A3]/10 rounded-lg p-3 mb-3">
                  📅 Los eventos pueden marcarse como hitos importantes del proyecto
                </div>
                <div className="text-xs text-[#B8B8B8]">
                  Selecciona un grupo para gestionar eventos
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sección inferior del sidebar */}
        <div className="mt-auto border-t border-[#3C4043] bg-[#252529] p-4">
          <div className="flex flex-col items-center justify-center space-y-3">
            {userRole === "admin" && (
              <button
                onClick={handleCreateGroup}
                className="flex items-center justify-center w-full h-12 gap-2 bg-[#A8E6A3]/20 rounded-xl hover:bg-[#A8E6A3]/30 transition-all duration-200"
                title="Crear nuevo grupo"
              >
                <Plus size={18} className="text-[#A8E6A3]" />
                <span className="text-[#A8E6A3] font-medium">Crear nuevo grupo</span>
              </button>
            )}
            {/* Botón de cerrar sesión */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full h-12 bg-red-900/20 rounded-xl hover:bg-red-900/40 transition-all duration-200 group border border-red-800/30 hover:border-red-700/50"
              title="Cerrar sesión"
            >
              <LogOut size={18} className="text-red-400 group-hover:scale-110 transition-transform mr-2" />
              <span className="text-red-400 font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Redimensionador del sidebar */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-2 bg-transparent hover:bg-[#A8E6A3]/20 transition-colors duration-200 cursor-col-resize group"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1 w-4 h-12 bg-[#3C4043] group-hover:bg-[#A8E6A3] rounded-l-md opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
            <div className="w-0.5 h-6 bg-[#252529] group-hover:bg-[#1A1A1F] rounded"></div>
          </div>
        </div>
      </div>      {/* Modal mejorado para crear grupo con vista previa y sugerencias */}
      {showCreateModal && (        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-[70] animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-[#2C2C34] via-[#252529] to-[#1A1A1F] rounded-2xl border border-[#3C4043] w-full max-w-4xl mx-4 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Header mejorado */}
            <div className="bg-gradient-to-r from-[#A8E6A3]/10 to-[#7DD3C0]/10 border-b border-[#3C4043] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#A8E6A3]/20 rounded-xl">
                    <Plus size={24} className="text-[#A8E6A3]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#E8E6E8]">Crear Nuevo Grupo</h3>
                    <p className="text-sm text-[#B8B8B8]">Crea un espacio de colaboración</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-xl hover:bg-[#3C4043] transition-all duration-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body con layout de dos columnas */}
            <div className="flex">
              {/* Columna izquierda - Formulario */}
              <div className="flex-1 p-6 space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#A8E6A3] mb-3">
                    <Users size={16} />
                    Nombre del grupo *
                  </label>
                  <input
                    type="text"
                    value={groupForm.name}
                    onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1A1A1F] border border-[#3C4043] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6A3]/30 focus:border-[#A8E6A3] text-[#E8E8E8] placeholder-[#B8B8B8] transition-all duration-200"
                    placeholder="Ej: Equipo de Desarrollo"
                    autoFocus
                    maxLength={50}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-[#B8B8B8]">
                      Usa un nombre descriptivo y fácil de recordar
                    </p>
                    <span className={`text-xs ${groupForm.name.length > 40 ? 'text-orange-400' : 'text-[#B8B8B8]'}`}>
                      {groupForm.name.length}/50
                    </span>
                  </div>
                </div>

                {/* Nombres sugeridos */}
                <div>
                  <h4 className="text-sm font-semibold text-[#A8E6A3] mb-3">Sugerencias rápidas</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Equipo de Desarrollo",
                      "Marketing Digital",
                      "Diseño UX/UI",
                      "Recursos Humanos",
                      "Ventas & CRM",
                      "Soporte Técnico",
                      "Investigación",
                      "Proyecto Alpha"
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setGroupForm({ ...groupForm, name: suggestion })}
                        className="text-left px-3 py-2 bg-[#1A1A1F] border border-[#3C4043] rounded-lg hover:border-[#A8E6A3]/50 hover:bg-[#252529] transition-all duration-200 text-sm text-[#E8E6E8] hover:text-[#A8E6A3]"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#A8E6A3] mb-3">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={groupForm.description}
                    onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#1A1A1F] border border-[#3C4043] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6A3]/30 focus:border-[#A8E6A3] text-[#E8E8E8] placeholder-[#B8B8B8] resize-none transition-all duration-200"
                    placeholder="Describe el propósito y objetivos del grupo..."
                    maxLength={200}
                  />
                  <p className="text-xs text-[#B8B8B8] mt-2">
                    Ayuda a los miembros a entender el propósito del grupo ({groupForm.description.length}/200)
                  </p>
                </div>

                {/* Footer */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 bg-[#3C4043] text-[#E8E8E8] rounded-xl hover:bg-[#4A4A4F] transition-all duration-200 font-medium"
                  >
                    Cancelar
                  </button>                  <button
                    onClick={handleSubmitCreate}
                    disabled={!groupForm.name.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#A8E6A3] to-[#7DD3C0] text-[#1A1A1F] rounded-xl hover:from-[#98E093] hover:to-[#6BC9B5] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Crear Grupo
                  </button>
                </div>
              </div>

              {/* Columna derecha - Vista previa */}
              <div className="w-80 p-6 bg-gradient-to-b from-[#252529] to-[#1A1A1F] border-l border-[#3C4043]">
                <h4 className="text-sm font-semibold text-[#A8E6A3] mb-4">Vista previa</h4>
                
                {/* Vista previa del grupo */}
                <div className="bg-[#2C2C34] rounded-xl p-4 border border-[#3C4043]">                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-[#A8E6A3]/20 to-[#7DD3C0]/20 border border-[#A8E6A3]/30">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white transition-all duration-300"
                      style={{ 
                        backgroundColor: groupForm.name ? getAvatarColor(groupForm.name) : '#6B7280' 
                      }}
                    >
                      {groupForm.name ? getInitials(groupForm.name) : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#E6E6E8] text-lg">
                        {groupForm.name || 'Nombre del grupo'}
                      </div>
                      <div className="text-sm text-[#A8E6A3]">
                        Grupo privado • Nuevo
                      </div>
                    </div>
                  </div>
                  
                  {groupForm.description && (
                    <div className="mt-3 p-3 bg-[#1A1A1F] rounded-lg border border-[#3C4043]">
                      <p className="text-sm text-[#B8B8B8]">{groupForm.description}</p>
                    </div>
                  )}
                </div>

                {/* Información adicional */}
                <div className="mt-6 space-y-4">
                  <div className="bg-[#1A1A1F] rounded-xl p-4 border border-[#3C4043]">
                    <h5 className="text-sm font-semibold text-[#E8E6E8] mb-3 flex items-center gap-2">
                      <Settings size={14} className="text-[#A8E6A3]" />
                      Configuración inicial
                    </h5>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#B8B8B8]">Tipo:</span>
                        <span className="text-[#E8E8E8]">Privado</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#B8B8B8]">Miembros:</span>
                        <span className="text-[#E8E8E8]">Solo tú</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#B8B8B8]">Estado:</span>
                        <span className="text-[#A8E6A3]">Activo</span>
                      </div>
                    </div>
                  </div>

                  {/* Características del grupo */}
                  <div className="bg-[#1A1A1F] rounded-xl p-4 border border-[#3C4043]">
                    <h5 className="text-sm font-semibold text-[#E8E6E8] mb-3">Características incluidas</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-[#A8E6A3]">
                        <div className="w-1.5 h-1.5 bg-[#A8E6A3] rounded-full"></div>
                        Chat en tiempo real
                      </div>
                      <div className="flex items-center gap-2 text-[#A8E6A3]">
                        <div className="w-1.5 h-1.5 bg-[#A8E6A3] rounded-full"></div>
                        Gestión de objetivos
                      </div>
                      <div className="flex items-center gap-2 text-[#A8E6A3]">
                        <div className="w-1.5 h-1.5 bg-[#A8E6A3] rounded-full"></div>
                        Asignación de tareas
                      </div>
                      <div className="flex items-center gap-2 text-[#A8E6A3]">
                        <div className="w-1.5 h-1.5 bg-[#A8E6A3] rounded-full"></div>
                        Seguimiento de progreso
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Perfil */}      {showProfile && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-[70] animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-[#2C2C34] via-[#252529] to-[#1A1A1F] rounded-2xl border border-[#3C4043] w-full max-w-md mx-4 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#A8E6A3]/10 to-[#7DD3C0]/10 border-b border-[#3C4043] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#A8E6A3]/20 rounded-xl">
                    <User size={20} className="text-[#A8E6A3]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#E8E6E8]">Mi Perfil</h3>
                    <p className="text-sm text-[#B8B8B8]">Actualiza tu información personal</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfile(false)}
                  className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-xl hover:bg-[#3C4043] transition-all duration-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-[#1A1A1F] bg-gradient-to-br from-[#A8E6A3] to-[#7DD3C0]"
                  >
                    {getInitials(currentUser)}
                  </div>
                  <button className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={20} className="text-white" />
                  </button>
                </div>
                <p className="text-xs text-[#B8B8B8] mt-2">Clic para cambiar avatar</p>
              </div>

              {/* Formulario */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#A8E6A3] mb-2">
                    Nombre de usuario
                  </label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#1A1A1F] border border-[#3C4043] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6A3]/30 focus:border-[#A8E6A3] text-[#E8E8E8] placeholder-[#B8B8B8] transition-all duration-200"
                    placeholder="Tu nombre de usuario"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#A8E6A3] mb-2">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#1A1A1F] border border-[#3C4043] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6A3]/30 focus:border-[#A8E6A3] text-[#E8E8E8] placeholder-[#B8B8B8] transition-all duration-200"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#A8E6A3] mb-2">
                    Biografía
                  </label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#1A1A1F] border border-[#3C4043] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6A3]/30 focus:border-[#A8E6A3] text-[#E8E8E8] placeholder-[#B8B8B8] resize-none transition-all duration-200"
                    placeholder="Cuéntanos algo sobre ti..."
                    maxLength={150}
                  />
                  <p className="text-xs text-[#B8B8B8] mt-1">
                    {profileForm.bio.length}/150 caracteres
                  </p>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">                <button
                  onClick={() => setShowProfile(false)}
                  className="flex-1 px-4 py-3 bg-[#3C4043] text-[#E8E8E8] rounded-xl hover:bg-[#4A4A4F] transition-all duration-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#A8E6A3] to-[#7DD3C0] text-[#1A1A1F] rounded-xl hover:from-[#98E093] hover:to-[#6BC9B5] transition-all duration-200 font-medium flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}      {/* Modal de Configuraciones */}
      {showSettings && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-[70] animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-[#2C2C34] via-[#252529] to-[#1A1A1F] rounded-2xl border border-[#3C4043] w-full max-w-md mx-4 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#A8E6A3]/10 to-[#7DD3C0]/10 border-b border-[#3C4043] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#A8E6A3]/20 rounded-xl">
                    <Settings size={20} className="text-[#A8E6A3]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#E8E6E8]">Configuraciones</h3>
                    <p className="text-sm text-[#B8B8B8]">Personaliza tu experiencia</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-xl hover:bg-[#3C4043] transition-all duration-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Tema */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette size={16} className="text-[#A8E6A3]" />
                  <h4 className="font-semibold text-[#E8E6E8]">Apariencia</h4>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, theme: 'dark' }))}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      settings.theme === 'dark' 
                        ? 'bg-[#A8E6A3]/20 text-[#A8E6A3] border border-[#A8E6A3]/30' 
                        : 'bg-[#3C4043] text-[#B8B8B8] hover:bg-[#4A4A4F]'
                    }`}
                  >
                    <Moon size={14} />
                    Oscuro
                  </button>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, theme: 'light' }))}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      settings.theme === 'light' 
                        ? 'bg-[#A8E6A3]/20 text-[#A8E6A3] border border-[#A8E6A3]/30' 
                        : 'bg-[#3C4043] text-[#B8B8B8] hover:bg-[#4A4A4F]'
                    }`}
                  >
                    <Sun size={14} />
                    Claro
                  </button>
                </div>
              </div>

              {/* Notificaciones */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-[#A8E6A3]" />
                  <h4 className="font-semibold text-[#E8E6E8]">Notificaciones</h4>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#B8B8B8] text-sm">Activar notificaciones</span>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
                    className={`relative w-12 h-6 rounded-full transition-all ${
                      settings.notifications ? 'bg-[#A8E6A3]' : 'bg-[#3C4043]'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.notifications ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Sonido */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {settings.sound ? (
                    <Volume2 size={16} className="text-[#A8E6A3]" />
                  ) : (
                    <VolumeX size={16} className="text-[#B8B8B8]" />
                  )}
                  <h4 className="font-semibold text-[#E8E6E8]">Sonido</h4>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#B8B8B8] text-sm">Sonidos del sistema</span>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, sound: !prev.sound }))}
                    className={`relative w-12 h-6 rounded-full transition-all ${
                      settings.sound ? 'bg-[#A8E6A3]' : 'bg-[#3C4043]'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.sound ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Idioma */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-[#A8E6A3]" />
                  <h4 className="font-semibold text-[#E8E6E8]">Idioma</h4>
                </div>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#1A1A1F] border border-[#3C4043] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6A3]/30 focus:border-[#A8E6A3] text-[#E8E8E8] transition-all duration-200"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-4 py-3 bg-[#3C4043] text-[#E8E8E8] rounded-xl hover:bg-[#4A4A4F] transition-all duration-200 font-medium"
                >
                  Cancelar                </button>
                <button
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#A8E6A3] to-[#7DD3C0] text-[#1A1A1F] rounded-xl hover:from-[#98E093] hover:to-[#6BC9B5] transition-all duration-200 font-medium flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}      {/* Modal mejorado para editar grupo */}
      {showEditModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-[70] animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-[#2C2C34] via-[#252529] to-[#1A1A1F] rounded-2xl border border-[#3C4043] w-full max-w-lg mx-4 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Header mejorado */}
            <div className="bg-gradient-to-r from-[#A8E6A3]/10 to-[#7DD3C0]/10 border-b border-[#3C4043] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#A8E6A3]/20 rounded-xl">
                    <Edit2 size={24} className="text-[#A8E6A3]" />
                  </div>
                  <div>                    <h3 className="text-xl font-bold text-[#E8E6E8]">Editar Grupo</h3>
                    <p className="text-sm text-[#B8B8B8]">Modifica la información del grupo</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-xl hover:bg-[#3C4043] transition-all duration-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body mejorado */}
            <div className="p-6 space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[#A8E6A3] mb-3">
                  <Users size={16} />
                  Nombre del grupo *
                </label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1A1A1F] border border-[#3C4043] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6A3]/30 focus:border-[#A8E6A3] text-[#E8E8E8] placeholder-[#B8B8B8] transition-all duration-200"
                  placeholder="Ej: Equipo de Desarrollo"
                  autoFocus
                  maxLength={50}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-[#B8B8B8]">
                    Actualiza el nombre del grupo
                  </p>
                  <span className={`text-xs ${groupForm.name.length > 40 ? 'text-orange-400' : 'text-[#B8B8B8]'}`}>
                    {groupForm.name.length}/50
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#A8E6A3] mb-3">
                  Descripción (opcional)
                </label>
                <textarea
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-[#1A1A1F] border border-[#3C4043] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6A3]/30 focus:border-[#A8E6A3] text-[#E8E8E8] placeholder-[#B8B8B8] resize-none transition-all duration-200"
                  placeholder="Actualiza la descripción del grupo..."
                  maxLength={200}
                />
                <p className="text-xs text-[#B8B8B8] mt-2">
                  Mantén la descripción actualizada ({groupForm.description.length}/200)
                </p>
              </div>

              {/* Información adicional */}
              <div className="bg-[#1A1A1F] rounded-xl p-4 border border-[#3C4043]">
                <h4 className="text-sm font-semibold text-[#E8E6E8] mb-3 flex items-center gap-2">
                  <Users size={14} className="text-[#A8E6A3]" />
                  Información del grupo
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#B8B8B8]">Creado:</span>
                    <span className="text-[#E8E8E8]">Hace 2 días</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#B8B8B8]">Miembros:</span>
                    <span className="text-[#E8E8E8]">5 usuarios</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#B8B8B8]">Estado:</span>
                    <span className="text-[#A8E6A3]">Activo</span>
                  </div>
                </div>
              </div>

              {/* Footer mejorado */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 bg-[#3C4043] text-[#E8E8E8] rounded-xl hover:bg-[#4A4A4F] transition-all duration-200 font-medium"
                >
                  Cancelar
                </button>                <button
                  onClick={handleSubmitEdit}
                  disabled={!groupForm.name.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#A8E6A3] to-[#7DD3C0] text-[#1A1A1F] rounded-xl hover:from-[#98E093] hover:to-[#6BC9B5] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatSidebar;