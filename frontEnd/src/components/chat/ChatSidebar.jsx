import React, { useState, useEffect } from "react";
import logoThinkchat from "../../assets/logo-thinkchat.png";
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
  Menu,
  Settings,
  Brain
} from "lucide-react";
import { getInitials, getAvatarColor } from "../../utils/chatUtils";
import { canReviewTasks, isAdmin } from "../../utils/auth";
import { useMediaAutoHide } from "../../hooks/useMediaAutoHide";

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

// Modal de perfil de usuario
const ProfileModal = ({ isOpen, onClose, currentUser, userRole }) => {
  const [profileData, setProfileData] = useState({
    username: currentUser || 'Usuario',
    email: 'usuario@thinkchat.com', // Simular desde localStorage o API
    role: userRole || 'user'
  });

  useEffect(() => {
    // Intentar cargar datos del localStorage o API
    const loadProfileData = () => {
      try {
        // Simular datos - Aquí puedes conectar con tu API real
        const savedData = {
          username: localStorage.getItem('username') || currentUser || 'Usuario',
          email: localStorage.getItem('userEmail') || 'usuario@thinkchat.com',
          role: localStorage.getItem('userRole') || userRole || 'user'
        };
        setProfileData(savedData);
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    };

    if (isOpen) {
      loadProfileData();
    }
  }, [isOpen, currentUser, userRole]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-[70] animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-[#2C2C34] via-[#252529] to-[#1A1A1F] rounded-2xl border border-[#3C4043] w-full max-w-md mx-4 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#A8E6A3]/10 to-[#7DD3C0]/10 border-b border-[#3C4043] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#A8E6A3]/20 rounded-xl">
                <User size={24} className="text-[#A8E6A3]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#E8E6E8]">Mi Perfil</h3>
                <p className="text-sm text-[#B8B8B8]">Información de usuario</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-xl hover:bg-[#3C4043] transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Avatar y nombre */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white border-2 border-[#A8E6A3]"
              style={{ backgroundColor: getAvatarColor(profileData.username) }}
            >
              {getInitials(profileData.username)}
            </div>
            <div>
              <h4 className="text-lg font-bold text-[#E8E6E8]">{profileData.username}</h4>
              <p className="text-sm text-[#A8E6A3] capitalize">
                {profileData.role === 'admin' ? '👑 Administrador' : 'Usuario'}
              </p>
            </div>
          </div>

          {/* Información */}
          <div className="space-y-4">
            <div className="bg-[#1A1A1F] rounded-xl p-4 border border-[#3C4043]">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[#A8E6A3] font-medium">NOMBRE DE USUARIO</label>
                  <p className="text-[#E8E8E8] font-medium">{profileData.username}</p>
                </div>
                
                <div className="h-px bg-[#3C4043]"></div>
                
                <div>
                  <label className="text-xs text-[#A8E6A3] font-medium">CORREO ELECTRÓNICO</label>
                  <p className="text-[#E8E8E8]">{profileData.email}</p>
                </div>
                
                <div className="h-px bg-[#3C4043]"></div>
                
                <div>
                  <label className="text-xs text-[#A8E6A3] font-medium">ROL</label>
                  <p className="text-[#E8E8E8] capitalize">
                    {profileData.role === 'admin' ? 'Administrador' : 'Usuario'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#A8E6A3] to-[#7DD3C0] text-[#1A1A1F] rounded-xl hover:from-[#98E093] hover:to-[#6BC9B5] transition-all duration-200 font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
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
  // Estados principales
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Iniciar colapsado
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showGroupOptions, setShowGroupOptions] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupForm, setGroupForm] = useState({ name: '', description: '' });

  // Hook para auto-ocultar en móvil con multimedia
  useMediaAutoHide(setSidebarOpen);

  // Función para determinar si un usuario está online
  const isUserOnline = (userId) => {
    try {
      if (Array.isArray(onlineUsers) && onlineUsers.length > 0) {
        return onlineUsers.some(onlineUser => onlineUser.userId === userId);
      }
      return Math.random() > 0.3; // Fallback simulado
    } catch (error) {
      console.warn('Error checking online status:', error);
      return false;
    }
  };

  // Función para toggle del sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Función para manejar navegación de iconos
  const handleIconNavigation = (tab) => {
    // Cambiar pestaña
    setActiveTab(tab);
    
    // Solo expandir sidebar para apartados principales (no calendario/ideas)
    if (sidebarCollapsed && tab !== 'calendar' && tab !== 'ideas') {
      setSidebarCollapsed(false);
    }
  };

  // Función para manejar logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    window.location.href = "/login";
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

  // Filtros para búsqueda
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

  return (
    <>
      {/* Sidebar principal */}
      <div 
        className={`
          fixed lg:relative top-0 left-0 h-screen bg-gradient-to-b from-[#2C2C34] via-[#252529] to-[#1A1A1F] border-r border-[#3C4043] 
          transform transition-all duration-300 ease-in-out z-50 flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'w-16' : 'w-80'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3C4043] bg-[#252529] min-h-[72px]">          {sidebarCollapsed ? (            <div className="flex flex-col items-center gap-2">
              <img 
                src={logoThinkchat} 
                alt="Thinkchat" 
                className="w-12 h-12 object-contain cursor-pointer hover:scale-110 transition-transform"
                onClick={toggleSidebar}
                title="Thinkchat - Expandir menú"
              />
            </div>
          ) : (<>              <div className="flex items-center gap-2">
                <img 
                  src={logoThinkchat} 
                  alt="Thinkchat" 
                  className="w-10 h-10 object-contain"
                />
                <h1 className="text-xl font-bold text-[#A8E6A3]">Thinkchat</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSidebar}
                  className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-lg hover:bg-[#3C4043] transition-all duration-200"
                >
                  <Menu size={18} />
                </button>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-lg hover:bg-[#3C4043] transition-all duration-200 lg:hidden"
                >
                  <X size={18} />
                </button>
              </div>
            </>
          )}
        </div>        {/* Navegación por iconos (modo colapsado) */}
        {sidebarCollapsed && (
          <div className="flex flex-col h-full p-2">
            {/* Iconos principales */}
            <div className="space-y-2">
              <button
                onClick={() => handleIconNavigation('chats')}
                className={`w-full p-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'chats'
                    ? 'bg-[#A8E6A3]/20 text-[#A8E6A3]'
                    : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
                }`}              title="Chats"
            >
              <MessageCircle size={22} />
            </button>

              <button
                onClick={() => handleIconNavigation('users')}
                className={`w-full p-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'users'
                    ? 'bg-[#A8E6A3]/20 text-[#A8E6A3]'
                    : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
                }`}              title="Usuarios"
            >
              <Users size={22} />
            </button>

              <button
                onClick={() => handleIconNavigation('objectives')}
                className={`w-full p-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'objectives'
                    ? 'bg-[#A8E6A3]/20 text-[#A8E6A3]'
                    : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
                }`}              title={isAdmin(userRole) ? 'Objetivos' : 'Tareas'}
            >
              <Target size={22} />
            </button>

              {canReviewTasks() && (
                <button
                  onClick={() => handleIconNavigation('review')}
                  className={`w-full p-3 rounded-lg transition-all duration-200 ${
                    activeTab === 'review'
                      ? 'bg-[#A8E6A3]/20 text-[#A8E6A3]'
                      : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
                  }`}                title="Revisión"
              >
                <ClipboardCheck size={22} />
              </button>
              )}

              <div className="h-px bg-[#3C4043] my-2"></div>

              {/* Iconos secundarios (solo cambian pestaña) */}
              <button
                onClick={() => setActiveTab('ideas')}
                className={`w-full p-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'ideas'
                    ? 'bg-[#A8E6A3]/20 text-[#A8E6A3]'
                    : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
                }`}              title="Ideas"
            >
              <Lightbulb size={22} />
            </button>

              <button
                onClick={() => setActiveTab('calendar')}
                className={`w-full p-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'calendar'
                    ? 'bg-[#A8E6A3]/20 text-[#A8E6A3]'
                    : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
                }`}              title="Calendario"
            >
              <Calendar size={22} />
            </button>
            </div>

            {/* Configuraciones - Movido más arriba */}
            <div className="mt-4 border-t border-[#3C4043]/50 pt-4">
              <div className="relative">
                <button                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-full p-3 rounded-lg text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043] transition-all duration-200"                title="Configuración"
              >
                <Settings size={22} />
              </button>
                {userMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-48">
                    <UserMenu 
                      onLogout={handleLogout} 
                      onClose={() => setUserMenuOpen(false)}
                      onOpenProfile={() => setShowProfile(true)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contenido expandido */}
        {!sidebarCollapsed && (
          <>
            {/* Menú de usuario */}
            <div className="p-4 border-b border-[#3C4043] relative bg-[#252529]">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center justify-between p-3 text-left text-[#E8E6E8] hover:bg-[#3C4043] rounded-xl transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white border-2 border-[#A8E6A3]"
                    style={{ backgroundColor: getAvatarColor(currentUser) }}
                  >
                    {getInitials(currentUser)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-[#E8E6E8] group-hover:text-[#A8E6A3] transition-colors truncate">
                      {currentUser}
                    </div>
                    <div className="text-xs text-[#A8E6A3] capitalize font-medium">
                      {userRole === 'admin' ? '👑 ' : ''}
                      {userRole}
                    </div>
                  </div>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`transform transition-all duration-200 text-[#A8E6A3] ${userMenuOpen ? 'rotate-180' : ''}`}
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
            <div className="p-4 bg-[#252529]">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A8E6A3]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-10 pr-4 py-3 bg-[#1A1A1F] border border-[#2C2C34] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6A3] focus:border-transparent text-[#E8E8E8] placeholder-[#B8B8B8] transition-all duration-200"
                />
              </div>
            </div>            {/* Tabs de navegación */}
            <div className="border-b border-[#3C4043] bg-[#252529]">
              <div className="flex">                <button
                  onClick={() => setActiveTab('chats')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-all duration-200 min-w-[80px] ${
                    activeTab === 'chats'
                      ? 'text-[#A8E6A3] border-b-2 border-[#A8E6A3] bg-[#2C2C34]'
                      : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
                  }`}                >
                  <MessageCircle size={22} />
                  Chat
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-all duration-200 min-w-[80px] ${
                    activeTab === 'users'
                      ? 'text-[#A8E6A3] border-b-2 border-[#A8E6A3] bg-[#2C2C34]'
                      : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
                  }`}                >
                  <Users size={22} />
                  Online
                </button><button
                  onClick={() => setActiveTab('objectives')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-all duration-200 min-w-[90px] ${
                    activeTab === 'objectives'
                      ? 'text-[#A8E6A3] border-b-2 border-[#A8E6A3] bg-[#2C2C34]'
                      : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
                  }`}                >
                  <Target size={22} />
                  {isAdmin(userRole) ? 'Objetivos' : 'Tareas'}
                </button>

                {canReviewTasks() && (
                  <button
                    onClick={() => setActiveTab('review')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-all duration-200 min-w-[90px] ${
                      activeTab === 'review'
                        ? 'text-[#A8E6A3] border-b-2 border-[#A8E6A3] bg-[#2C2C34]'
                        : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
                    }`}                  >
                    <ClipboardCheck size={22} />
                    Revisión
                  </button>
                )}
              </div>              <div className="flex border-t border-[#3C4043]/50">
                <button
                  onClick={() => setActiveTab('ideas')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-all duration-200 min-w-[70px] ${
                    activeTab === 'ideas'
                      ? 'text-[#A8E6A3] border-b-2 border-[#A8E6A3] bg-[#2C2C34]'
                      : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
                  }`}                >
                  <Lightbulb size={22} />
                  Ideas
                </button>

                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-all duration-200 min-w-[80px] ${
                    activeTab === 'calendar'
                      ? 'text-[#A8E6A3] border-b-2 border-[#A8E6A3] bg-[#2C2C34]'
                      : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
                  }`}                >
                  <Calendar size={22} />
                  Eventos
                </button>
              </div>
            </div>            {/* Botón de ajustes - Movido más arriba */}
            <div className="p-3 border-b border-[#3C4043] bg-[#252529]">
              <div className="relative">                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}                  className="w-full flex items-center justify-center gap-2 p-2 text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043] rounded-lg transition-all duration-200"
                  title="Configuración"                >
                  <Settings size={22} />
                  <span className="text-sm font-medium">Ajustes</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-10">
                    <UserMenu 
                      onLogout={handleLogout} 
                      onClose={() => setUserMenuOpen(false)}
                      onOpenProfile={() => setShowProfile(true)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Contenido de tabs */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#3C4043] scrollbar-track-[#252529]">
              {activeTab === "chats" && (
                <div className="p-4 space-y-2">
                  {/* Botón crear grupo */}
                  <button
                    onClick={handleCreateGroup}
                    className="w-full flex items-center gap-3 p-3 text-left rounded-lg bg-gradient-to-r from-[#A8E6A3]/10 to-[#7DD3C0]/10 border border-[#A8E6A3]/30 text-[#A8E6A3] hover:from-[#A8E6A3]/20 hover:to-[#7DD3C0]/20 transition-all duration-200"
                  >
                    <Plus size={20} />
                    <span className="font-medium">Crear grupo</span>
                  </button>

                  {/* Lista de grupos */}
                  {filteredGroups.map((group) => (
                    <div key={group.id} className="relative group">
                      <button
                        onClick={() => onGroupSelect(group.id)}
                        className={`w-full flex items-center gap-3 p-3 text-left rounded-lg transition-all duration-200 ${
                          activeGroup === group.id
                            ? 'bg-gradient-to-r from-[#A8E6A3]/20 to-[#7DD3C0]/20 border border-[#A8E6A3]/30 text-[#E8E8E8]'
                            : 'bg-[#252529] border border-[#3C4043] text-[#B8B8B8] hover:bg-[#3C4043] hover:text-[#E8E8E8]'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white flex-shrink-0"
                          style={{ backgroundColor: getAvatarColor(group.name) }}
                        >
                          {getInitials(group.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{group.name}</div>
                          {group.description && (
                            <div className="text-xs text-[#B8B8B8] truncate mt-1">{group.description}</div>
                          )}
                        </div>
                      </button>

                      {/* Opciones del grupo */}
                      {group.id !== "global" && (
                        <button
                          onClick={() => setShowGroupOptions(showGroupOptions === group.id ? null : group.id)}
                          className="absolute top-2 right-2 p-1.5 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-lg hover:bg-[#3C4043] transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical size={16} />
                        </button>
                      )}

                      {showGroupOptions === group.id && (
                        <div className="absolute top-10 right-2 bg-[#1A1A1F] border border-[#3C4043] rounded-lg z-10 overflow-hidden">
                          <button
                            onClick={() => handleEditGroupClick(group)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-[#E8E8E8] hover:bg-[#3C4043] transition-all"
                          >
                            <Edit2 size={14} />
                            <span className="text-sm">Editar</span>
                          </button>
                          <button
                            onClick={() => handleDeleteGroupClick(group.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-400 hover:bg-red-900/20 transition-all"
                          >
                            <Trash2 size={14} />
                            <span className="text-sm">Eliminar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "users" && (
                <div className="p-4 space-y-2">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#252529] border border-[#3C4043]">
                      <div className="relative">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white"
                          style={{ backgroundColor: getAvatarColor(user.username) }}
                        >
                          {getInitials(user.username)}
                        </div>
                        {isUserOnline(user.id) && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1A1A1F]"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-[#E8E8E8] truncate">{user.username}</div>
                        <div className="text-xs text-[#A8E6A3]">
                          {isUserOnline(user.id) ? 'En línea' : 'Desconectado'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Otros tabs mostrarán contenido placeholder */}
              {(activeTab === "objectives" || activeTab === "review" || activeTab === "ideas" || activeTab === "calendar") && (
                <div className="p-4 text-center text-[#B8B8B8]">
                  <div className="text-4xl mb-4">
                    {activeTab === "objectives" && "🎯"}
                    {activeTab === "review" && "📋"}
                    {activeTab === "ideas" && "💡"}
                    {activeTab === "calendar" && "📅"}
                  </div>
                  <p>Contenido de {activeTab} próximamente</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal de perfil */}
      <ProfileModal 
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        currentUser={currentUser}
        userRole={userRole}
      />

      {/* Modal crear grupo */}
      {showCreateModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-[70] animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-[#2C2C34] via-[#252529] to-[#1A1A1F] rounded-2xl border border-[#3C4043] w-full max-w-lg mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-[#A8E6A3]/10 to-[#7DD3C0]/10 border-b border-[#3C4043] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#A8E6A3]/20 rounded-xl">
                    <Plus size={24} className="text-[#A8E6A3]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#E8E6E8]">Crear Grupo</h3>
                    <p className="text-sm text-[#B8B8B8]">Nuevo grupo de chat</p>
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
                  placeholder="Describe el propósito del grupo..."
                  maxLength={200}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-[#3C4043] text-[#E8E8E8] rounded-xl hover:bg-[#4A4A4F] transition-all duration-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitCreate}
                  disabled={!groupForm.name.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#A8E6A3] to-[#7DD3C0] text-[#1A1A1F] rounded-xl hover:from-[#98E093] hover:to-[#6BC9B5] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Crear Grupo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar grupo */}
      {showEditModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-[70] animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-[#2C2C34] via-[#252529] to-[#1A1A1F] rounded-2xl border border-[#3C4043] w-full max-w-lg mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-[#A8E6A3]/10 to-[#7DD3C0]/10 border-b border-[#3C4043] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#A8E6A3]/20 rounded-xl">
                    <Edit2 size={24} className="text-[#A8E6A3]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#E8E6E8]">Editar Grupo</h3>
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
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 bg-[#3C4043] text-[#E8E8E8] rounded-xl hover:bg-[#4A4A4F] transition-all duration-200 font-medium"
                >
                  Cancelar
                </button>
                <button
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
