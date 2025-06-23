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
import { canReviewTasks } from "../../utils/auth";
import logoThinkchat from "../../assets/logo-thinkchat.png";

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
}) => {
  // Estados
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
    username: currentUser || '',
    email: '',
    role: userRole || '',
    bio: '',
    avatar: null
  });

  // Función para determinar si un usuario está online
  const isUserOnline = (userId) => {
    try {
      if (Array.isArray(onlineUsers) && onlineUsers.length > 0) {
        return onlineUsers.some(onlineUser => onlineUser.userId === userId);
      }
      return Math.random() > 0.3; // Fallback
    } catch (error) {
      console.warn('Error checking online status:', error);
      return false;
    }
  };

  // Función para toggle del sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Función para cambiar pestañas y expandir sidebar si está colapsado
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (sidebarCollapsed && tab !== 'calendar' && tab !== 'ideas') {
      setSidebarCollapsed(false);
    }
  };

  // Auto-ocultar sidebar cuando se abren imágenes/videos
  useEffect(() => {
    const handleMediaOpen = () => {
      if (window.innerWidth < 1024) { // Solo en móvil
        setSidebarOpen(false);
      }
    };

    // Detectar clics en imágenes/videos
    const handleClick = (e) => {
      const target = e.target;
      if (target.tagName === 'IMG' || target.tagName === 'VIDEO' || 
          target.closest('.media-viewer') || target.closest('.image-modal')) {
        handleMediaOpen();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [setSidebarOpen]);

  // Filtros
  const filteredGroups = search.trim()
    ? (groups || []).filter(group =>
        group.name.toLowerCase().includes(search.toLowerCase())
      )
    : (groups || []);

  const filteredUsers = search.trim()
    ? (Array.isArray(users) ? users : []).filter(user =>
        user.username?.toLowerCase().includes(search.toLowerCase())
      )
    : (Array.isArray(users) ? users : []);

  // Funciones
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    window.location.href = "/login";
  };

  // Cargar datos del perfil desde localStorage/API
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const username = localStorage.getItem('username') || currentUser;
        const role = localStorage.getItem('userRole') || userRole;
        
        // Aquí podrías hacer una llamada a la API para obtener más datos
        // const response = await fetch('/api/user/profile', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
        // const userData = await response.json();
        
        setProfileForm({
          username: username,
          email: `${username}@company.com`, // Placeholder - reemplazar con datos reales de la API
          role: role,
          bio: 'Usuario del sistema', // Placeholder
          avatar: null
        });
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    if (showProfile) {
      loadUserProfile();
    }
  }, [showProfile, currentUser, userRole]);

  // Funciones para redimensionamiento
  const handleMouseMove = useCallback((e) => {
    if (isResizing && !sidebarCollapsed) {
      const newWidth = e.clientX;
      if (newWidth >= 280 && newWidth <= 500) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing, sidebarCollapsed]);

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
    if (!sidebarCollapsed) {
      e.preventDefault();
      setIsResizing(true);
    }
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
  };

  return (
    <>
      {/* Sidebar principal */}      <div 
        className={`
          fixed lg:relative top-0 left-0 h-screen bg-gradient-to-b from-[#2C2C34] via-[#252529] to-[#1A1A1F] border-r border-[#3C4043] 
          transform transition-all duration-300 ease-in-out z-50 flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'lg:w-16' : ''}
        `}
        style={{ 
          width: window.innerWidth < 1024 
            ? (sidebarOpen ? '100vw' : '0') 
            : (sidebarCollapsed ? '64px' : `${sidebarWidth}px`),
          maxWidth: window.innerWidth < 1024 ? '380px' : 'none',
          minWidth: sidebarCollapsed ? '64px' : '320px'
        }}
      >
        {/* Header del sidebar */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[#3C4043]">
          <div className="flex items-center gap-3">
            {/* Botón hamburguesa */}
            <button
              onClick={toggleSidebar}
              className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-xl transition-all duration-200 hover:bg-[#3C4043] lg:block hidden"
            >
              <Menu size={20} />
            </button>            {/* Logo/Título - Ocultar cuando colapsado */}
            {!sidebarCollapsed && (
              <div className="flex items-center">
                <img 
                  src={logoThinkchat} 
                  alt="Thinkchat" 
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </div>
            )}
          </div>
          
          {/* Botón cerrar móvil */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-full hover:bg-[#3C4043] transition-all duration-200 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>        {/* Contenido colapsado - Solo iconos */}
        {sidebarCollapsed && (
          <div className="flex flex-col items-center py-4 px-2 space-y-4 w-full max-w-[64px]">
            {/* Avatar del usuario colapsado */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-[#A8E6A3] cursor-pointer hover:scale-105 transition-transform mx-auto"
              style={{ backgroundColor: getAvatarColor(currentUser) }}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              title={currentUser}
            >
              {getInitials(currentUser)}
            </div>

            {/* Iconos de navegación colapsados */}
            <div className="flex flex-col items-center space-y-3 w-full">
              <button
                onClick={() => handleTabChange('chats')}
                className={`w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center mx-auto ${
                  activeTab === 'chats' 
                    ? 'bg-[#A8E6A3] text-[#1A1A1F]' 
                    : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
                }`}
                title="Chats"
              >
                <MessageCircle size={14} />
              </button>
              
              <button
                onClick={() => handleTabChange('users')}
                className={`w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center mx-auto ${
                  activeTab === 'users' 
                    ? 'bg-[#A8E6A3] text-[#1A1A1F]' 
                    : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
                }`}
                title="Usuarios"
              >
                <Users size={14} />
              </button>
              
              <button
                onClick={() => handleTabChange('objectives')}
                className={`w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center mx-auto ${
                  activeTab === 'objectives' 
                    ? 'bg-[#A8E6A3] text-[#1A1A1F]' 
                    : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
                }`}
                title="Objetivos"
              >
                <Target size={14} />
              </button>

              {/* Solo para admin/moderador */}
              {canReviewTasks(userRole) && (
                <button
                  onClick={() => handleTabChange('review')}
                  className={`w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center mx-auto ${
                    activeTab === 'review' 
                      ? 'bg-[#A8E6A3] text-[#1A1A1F]' 
                      : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
                  }`}
                  title="Revisar Tareas"
                >
                  <ClipboardCheck size={14} />
                </button>
              )}

              {/* Calendario e Ideas - Solo van a su pestaña, NO abren sidebar */}
              <button
                onClick={() => setActiveTab('calendar')}
                className={`w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center mx-auto ${
                  activeTab === 'calendar' 
                    ? 'bg-[#A8E6A3] text-[#1A1A1F]' 
                    : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
                }`}
                title="Calendario"
              >
                <Calendar size={14} />
              </button>
              
              <button
                onClick={() => setActiveTab('ideas')}
                className={`w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center mx-auto ${
                  activeTab === 'ideas' 
                    ? 'bg-[#A8E6A3] text-[#1A1A1F]' 
                    : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
                }`}
                title="Ideas"
              >
                <Lightbulb size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Contenido expandido */}
        {!sidebarCollapsed && (
          <>
            {/* Menú de usuario */}
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
                  </div>
                  <div className="min-w-0">
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
              </button>
                
              {userMenuOpen && (
                <UserMenu 
                  onLogout={handleLogout} 
                  onClose={() => setUserMenuOpen(false)}
                  onOpenProfile={() => setShowProfile(true)}
                />
              )}
            </div>

            {/* Barra de búsqueda */}
            <div className="p-3 sm:p-4 bg-[#252529]">
              <div className="relative">
                <Search 
                  size={16} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B8B8B8]" 
                />
                <input
                  type="text"
                  placeholder="Buscar conversaciones..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#1A1A1F] border border-[#3C4043] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6A3]/30 focus:border-[#A8E6A3] text-[#E8E8E8] placeholder-[#B8B8B8] text-sm sm:text-base transition-all duration-200"
                />
              </div>
            </div>            {/* Pestañas */}
            <div className="flex bg-[#1A1A1F] border-b border-[#3C4043] overflow-x-auto">
              <button
                onClick={() => setActiveTab('chats')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                  activeTab === 'chats'
                    ? 'text-[#A8E6A3] border-[#A8E6A3] bg-[#252529]'
                    : 'text-[#B8B8B8] border-transparent hover:text-[#A8E6A3] hover:bg-[#252529]'
                }`}
              >
                <MessageCircle size={20} />
                Chats
              </button>
              
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                  activeTab === 'users'
                    ? 'text-[#A8E6A3] border-[#A8E6A3] bg-[#252529]'
                    : 'text-[#B8B8B8] border-transparent hover:text-[#A8E6A3] hover:bg-[#252529]'
                }`}
              >
                <Users size={100} />
                Usuarios
              </button>
              
              <button
                onClick={() => setActiveTab('objectives')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                  activeTab === 'objectives'
                    ? 'text-[#A8E6A3] border-[#A8E6A3] bg-[#252529]'
                    : 'text-[#B8B8B8] border-transparent hover:text-[#A8E6A3] hover:bg-[#252529]'
                }`}
              >
                <Target size={16} />
                Objetivos
              </button>
            </div>

            {/* Segunda fila de pestañas */}
            <div className="flex bg-[#1A1A1F] border-b border-[#3C4043] overflow-x-auto">
              {canReviewTasks(userRole) && (
                <button
                  onClick={() => setActiveTab('review')}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                    activeTab === 'review'
                      ? 'text-[#A8E6A3] border-[#A8E6A3] bg-[#252529]'
                      : 'text-[#B8B8B8] border-transparent hover:text-[#A8E6A3] hover:bg-[#252529]'
                  }`}
                >
                  <ClipboardCheck size={16} />
                  Review
                </button>
              )}
              
              <button
                onClick={() => setActiveTab('calendar')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                  activeTab === 'calendar'
                    ? 'text-[#A8E6A3] border-[#A8E6A3] bg-[#252529]'
                    : 'text-[#B8B8B8] border-transparent hover:text-[#A8E6A3] hover:bg-[#252529]'
                }`}
              >
                <Calendar size={16} />
                Calendario
              </button>
              
              <button
                onClick={() => setActiveTab('ideas')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                  activeTab === 'ideas'
                    ? 'text-[#A8E6A3] border-[#A8E6A3] bg-[#252529]'
                    : 'text-[#B8B8B8] border-transparent hover:text-[#A8E6A3] hover:bg-[#252529]'
                }`}
              >
                <Lightbulb size={16} />
                Ideas
              </button>
            </div>

            {/* Contenido de las pestañas */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'chats' && (
                <div className="flex flex-col h-full">
                  {/* Header de grupos con botón crear */}
                  {(userRole === 'admin' || userRole === 'moderator') && (
                    <div className="p-3 sm:p-4 border-b border-[#3C4043] bg-[#252529]">
                      <button
                        onClick={handleCreateGroup}
                        className="w-full flex items-center justify-center gap-2 p-2.5 sm:p-3 bg-gradient-to-r from-[#A8E6A3] to-[#7DD3C0] text-[#1A1A1F] rounded-xl hover:from-[#98E093] hover:to-[#6BC9B5] transition-all duration-200 font-medium text-sm sm:text-base"
                      >
                        <Plus size={16} />
                        Crear Grupo
                      </button>
                    </div>
                  )}

                  {/* Lista de grupos */}
                  <div className="flex-1 overflow-y-auto">
                    {filteredGroups.length > 0 ? (
                      <div className="p-2 sm:p-3 space-y-1 sm:space-y-2">
                        {filteredGroups.map((group) => (
                          <div
                            key={group.id}
                            className={`group relative flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                              activeGroup === group.id
                                ? 'bg-gradient-to-r from-[#A8E6A3]/20 to-[#7DD3C0]/20 border border-[#A8E6A3]/30'
                                : 'hover:bg-[#3C4043] border border-transparent'
                            }`}
                            onClick={() => onGroupSelect(group.id)}
                          >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-[#A8E6A3] to-[#7DD3C0] flex items-center justify-center text-xs sm:text-sm font-bold text-[#1A1A1F]">
                              {group.name.charAt(0).toUpperCase()}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-[#E8E6E8] group-hover:text-[#A8E6A3] transition-colors truncate text-sm sm:text-base">
                                  {group.name}
                                </h3>
                                {(userRole === 'admin' || userRole === 'moderator') && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowGroupOptions(showGroupOptions === group.id ? null : group.id);
                                    }}
                                    className="p-1 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                                  >
                                    <MoreVertical size={14} />
                                  </button>
                                )}
                              </div>
                              
                              {group.description && (
                                <p className="text-xs sm:text-sm text-[#B8B8B8] truncate mt-0.5">
                                  {group.description}
                                </p>
                              )}
                            </div>

                            {/* Menú de opciones del grupo */}
                            {showGroupOptions === group.id && (
                              <div className="absolute top-full right-0 mt-1 bg-gradient-to-b from-[#1A1A1F] to-[#0F0F12] border border-[#3C4043] rounded-xl z-50 overflow-hidden backdrop-blur-sm min-w-[140px]">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditGroupClick(group);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-[#E8E8E8] hover:bg-[#3C4043] transition-all duration-200 text-sm"
                                >
                                  <Edit2 size={14} />
                                  Editar
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteGroupClick(group.id);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-400 hover:bg-red-900/20 transition-all duration-200 text-sm"
                                >
                                  <Trash2 size={14} />
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                        <MessageCircle size={32} className="text-[#B8B8B8] mb-2" />
                        <p className="text-[#B8B8B8] text-sm">
                          {search.trim() ? 'No se encontraron grupos' : 'No hay grupos disponibles'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1 sm:space-y-2">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl hover:bg-[#3C4043] transition-all duration-200 group"
                      >
                        <div className="relative">
                          <div
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium text-white border-2 border-[#A8E6A3]"
                            style={{ backgroundColor: getAvatarColor(user.username) }}
                          >
                            {getInitials(user.username)}
                          </div>
                          {isUserOnline(user.id) && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#A8E6A3] rounded-full border-2 border-[#252529]"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#E8E6E8] group-hover:text-[#A8E6A3] transition-colors truncate text-sm sm:text-base">
                              {user.username}
                            </span>
                            {user.role === 'admin' && (
                              <span className="text-xs text-[#A8E6A3]">👑</span>
                            )}
                          </div>
                          <div className="text-xs sm:text-sm text-[#B8B8B8] capitalize">
                            {user.role}
                          </div>
                        </div>
                        
                        <div className="text-xs text-[#B8B8B8]">
                          {isUserOnline(user.id) ? 'En línea' : 'Desconectado'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                      <Users size={32} className="text-[#B8B8B8] mb-2" />
                      <p className="text-[#B8B8B8] text-sm">
                        {search.trim() ? 'No se encontraron usuarios' : 'No hay usuarios conectados'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'objectives' && (
                <div className="flex-1 overflow-y-auto p-2 sm:p-3">
                  <div className="text-center py-8">
                    <Target size={32} className="text-[#B8B8B8] mb-2 mx-auto" />
                    <p className="text-[#B8B8B8] text-sm">Objetivos próximamente</p>
                  </div>
                </div>
              )}

              {activeTab === 'review' && canReviewTasks(userRole) && (
                <div className="flex-1 overflow-y-auto p-2 sm:p-3">
                  <div className="text-center py-8">
                    <ClipboardCheck size={32} className="text-[#B8B8B8] mb-2 mx-auto" />
                    <p className="text-[#B8B8B8] text-sm">Review de tareas próximamente</p>
                  </div>
                </div>
              )}

              {activeTab === 'calendar' && (
                <div className="flex-1 overflow-y-auto p-2 sm:p-3">
                  <div className="text-center py-8">
                    <Calendar size={32} className="text-[#B8B8B8] mb-2 mx-auto" />
                    <p className="text-[#B8B8B8] text-sm">Calendario próximamente</p>
                  </div>
                </div>
              )}

              {activeTab === 'ideas' && (
                <div className="flex-1 overflow-y-auto p-2 sm:p-3">
                  <div className="text-center py-8">
                    <Lightbulb size={32} className="text-[#B8B8B8] mb-2 mx-auto" />
                    <p className="text-[#B8B8B8] text-sm">Ideas próximamente</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Barra de redimensionamiento - Solo en desktop y expandido */}
        {!sidebarCollapsed && (
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-ew-resize bg-transparent hover:bg-[#A8E6A3] transition-colors duration-200 group"
            onMouseDown={handleMouseDown}
            title="Redimensionar sidebar"
          >
            <div className="w-1 h-full bg-transparent group-hover:bg-[#A8E6A3] transition-colors duration-200"></div>
          </div>
        )}
      </div>

      {/* Modal de perfil mejorado con datos reales */}
      {showProfile && (
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
                    <p className="text-sm text-[#B8B8B8]">Información del usuario</p>
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
            <div className="p-6 space-y-4">
              {/* Avatar */}
              <div className="flex items-center justify-center mb-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white border-4 border-[#A8E6A3]"
                  style={{ backgroundColor: getAvatarColor(profileForm.username) }}
                >
                  {getInitials(profileForm.username)}
                </div>
              </div>

              {/* Información del usuario */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#A8E6A3] mb-2">
                    Nombre de usuario
                  </label>
                  <div className="px-3 py-2 bg-[#1A1A1F] border border-[#3C4043] rounded-lg text-[#E8E8E8]">
                    {profileForm.username}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#A8E6A3] mb-2">
                    Correo electrónico
                  </label>
                  <div className="px-3 py-2 bg-[#1A1A1F] border border-[#3C4043] rounded-lg text-[#E8E8E8]">
                    {profileForm.email}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#A8E6A3] mb-2">
                    Rol
                  </label>
                  <div className="px-3 py-2 bg-[#1A1A1F] border border-[#3C4043] rounded-lg text-[#E8E8E8] capitalize">
                    {profileForm.role === 'admin' ? '👑 ' : ''}
                    {profileForm.role}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#A8E6A3] mb-2">
                    Estado
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1F] border border-[#3C4043] rounded-lg">
                    <div className="w-2 h-2 bg-[#A8E6A3] rounded-full"></div>
                    <span className="text-[#E8E8E8]">Conectado</span>
                  </div>
                </div>
              </div>

              {/* Botón cerrar */}
              <div className="pt-4">
                <button
                  onClick={() => setShowProfile(false)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-[#A8E6A3] to-[#7DD3C0] text-[#1A1A1F] rounded-xl hover:from-[#98E093] hover:to-[#6BC9B5] transition-all duration-200 font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resto de modales simplificados */}
      {showCreateModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-[70]">
          <div className="bg-gradient-to-br from-[#2C2C34] via-[#252529] to-[#1A1A1F] rounded-2xl border border-[#3C4043] w-full max-w-md mx-4 p-6">
            <h3 className="text-xl font-bold text-[#E8E6E8] mb-4">Crear Nuevo Grupo</h3>
            <input
              type="text"
              value={groupForm.name}
              onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
              placeholder="Nombre del grupo"
              className="w-full px-4 py-3 bg-[#1A1A1F] border border-[#3C4043] rounded-xl text-[#E8E8E8] mb-4"
            />
            <textarea
              value={groupForm.description}
              onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
              placeholder="Descripción (opcional)"
              className="w-full px-4 py-3 bg-[#1A1A1F] border border-[#3C4043] rounded-xl text-[#E8E8E8] mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 bg-[#3C4043] text-[#E8E8E8] rounded-xl hover:bg-[#4A4A4F] transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitCreate}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#A8E6A3] to-[#7DD3C0] text-[#1A1A1F] rounded-xl hover:from-[#98E093] hover:to-[#6BC9B5] transition-all duration-200"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-[70]">
          <div className="bg-gradient-to-br from-[#2C2C34] via-[#252529] to-[#1A1A1F] rounded-2xl border border-[#3C4043] w-full max-w-md mx-4 p-6">
            <h3 className="text-xl font-bold text-[#E8E6E8] mb-4">Editar Grupo</h3>
            <input
              type="text"
              value={groupForm.name}
              onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
              placeholder="Nombre del grupo"
              className="w-full px-4 py-3 bg-[#1A1A1F] border border-[#3C4043] rounded-xl text-[#E8E8E8] mb-4"
            />
            <textarea
              value={groupForm.description}
              onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
              placeholder="Descripción (opcional)"
              className="w-full px-4 py-3 bg-[#1A1A1F] border border-[#3C4043] rounded-xl text-[#E8E8E8] mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-3 bg-[#3C4043] text-[#E8E8E8] rounded-xl hover:bg-[#4A4A4F] transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitEdit}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#A8E6A3] to-[#7DD3C0] text-[#1A1A1F] rounded-xl hover:from-[#98E093] hover:to-[#6BC9B5] transition-all duration-200"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatSidebar;
