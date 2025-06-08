import React, { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  Users, 
  MessageSquare, 
  Plus, 
  Settings, 
  Edit2, 
  Trash2, 
  ChevronDown,
  X,
  Target,
  Bell,
  LogOut,
  Check,
  MessageCircle,
  UserPlus,
  Calendar,
  Clock
} from "lucide-react";
import { getInitials, getAvatarColor } from "../../utils/chatUtils";
import UserMenu from "./UserMenu";

const ChatSidebar = ({ 
  activeTab,
  setActiveTab,
  search,
  setSearch,
  groups,
  users,
  activeGroup,
  userRole,
  currentUser,
  sidebarOpen,
  setSidebarOpen,
  userMenuOpen,
  setUserMenuOpen,
  onGroupSelect,
  onCreateGroup,
  onEditGroup,
  onDeleteGroup
}) => {  const [showGroupOptions, setShowGroupOptions] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupForm, setGroupForm] = useState({ name: '', description: '' });
  const filteredGroups = search.trim()
    ? (groups || []).filter(group =>
        group.name.toLowerCase().includes(search.toLowerCase())
      )
    : (groups || []);

  const filteredUsers = search.trim()
    ? (users || []).filter(user =>
        user.username?.toLowerCase().includes(search.toLowerCase())
      )
    : (users || []);
  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
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
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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
  };  const handleSubmitEdit = () => {
    if (groupForm.name.trim() && editingGroup) {
      onEditGroup(editingGroup.id, groupForm);
      setShowEditModal(false);
      setEditingGroup(null);
      setGroupForm({ name: '', description: '' });
    }
  };

  // Funciones para notificaciones
  const unreadNotifications = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message': return <MessageCircle size={16} className="text-[#A8E6A3]" />;
      case 'objective': return <Target size={16} className="text-[#7BC97B]" />;
      case 'user': return <UserPlus size={16} className="text-[#B8B8B8]" />;
      default: return <Bell size={16} className="text-[#A8E6A3]" />;
    }
  };
  // Cleanup para event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <>
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}      {/* Sidebar */}
      <div 
        className={`
          fixed lg:relative top-0 left-0 h-screen bg-gradient-to-b from-[#2C2C34] via-[#252529] to-[#1A1A1F] border-r border-[#3C4043] 
          transform transition-transform duration-300 ease-in-out z-50 shadow-2xl flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ width: sidebarWidth, minWidth: '280px' }}
      >
        {/* Header del sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-[#3C4043] bg-[#252529]">
          <h1 className="text-xl font-bold text-[#A8E6A3] drop-shadow-sm">Chat Hub</h1>
          
          {/* Botón cerrar móvil */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-full hover:bg-[#3C4043] transition-all duration-200 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menú de usuario */}
        <div className="p-4 border-b border-[#3C4043] relative bg-[#252529]">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center justify-between p-3 text-left text-[#E8E8E8] hover:bg-[#3C4043] rounded-xl transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white shadow-lg border-2 border-[#A8E6A3]"
                style={{ backgroundColor: getAvatarColor(currentUser) }}
              >
                {getInitials(currentUser)}
              </div>
              <div>
                <div className="font-semibold text-[#E8E8E8] group-hover:text-[#A8E6A3] transition-colors">
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
            <UserMenu onLogout={handleLogout} onClose={() => setUserMenuOpen(false)} />
          )}
        </div>        {/* Barra de búsqueda */}
        <div className="p-4 bg-[#252529]">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A8E6A3]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-3 bg-[#1A1A1F] border border-[#2C2C34] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6A3] focus:border-transparent text-[#E8E8E8] placeholder-[#B8B8B8] transition-all duration-200"
              />
            </div>
              {/* Botón crear grupo */}
            <button
              onClick={handleCreateGroup}
              className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#A8E6A3] to-[#7DD3C0] text-[#1A1A1F] rounded-xl hover:from-[#98E093] hover:to-[#6BC9B5] transition-all duration-200 shadow-lg hover:shadow-xl group"
              title="Crear grupo"
            >
              <Plus size={18} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="flex border-b border-[#3C4043] bg-[#252529]">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === 'chats'
                ? 'text-[#A8E6A3] border-b-2 border-[#A8E6A3] bg-[#2C2C34]'
                : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
            }`}
          >
            <MessageSquare size={16} />
            Chats
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === 'users'
                ? 'text-[#A8E6A3] border-b-2 border-[#A8E6A3] bg-[#2C2C34]'
                : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
            }`}
          >
            <Users size={16} />
            Usuarios
          </button>
          <button
            onClick={() => setActiveTab('objectives')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === 'objectives'
                ? 'text-[#A8E6A3] border-b-2 border-[#A8E6A3] bg-[#2C2C34]'
                : 'text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043]'
            }`}
          >
            <Target size={16} />
            Objetivos
          </button>
        </div>        {/* Contenido de tabs */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#3C4043] scrollbar-track-[#252529]">
          {activeTab === "chats" && (
            <div className="p-4 space-y-2">
              {/* Lista de grupos */}
              {filteredGroups.map((group) => (
                <div key={group.id} className="relative group">
                  <button
                    onClick={() => onGroupSelect(group.id)}
                    className={`w-full flex items-center gap-3 p-3 text-left rounded-xl transition-all duration-200 ${
                      activeGroup === group.id
                        ? "bg-gradient-to-r from-[#A8E6A3] to-[#7BC97B] text-[#1A1A1F] shadow-lg"
                        : "text-[#E8E8E8] hover:bg-[#3C4043] border border-transparent hover:border-[#4A4A4F]"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium shadow-md ${
                        activeGroup === group.id ? 'text-white bg-[#1A1A1F]' : 'text-white'
                      }`}
                      style={{ backgroundColor: activeGroup === group.id ? '#1A1A1F' : getAvatarColor(group.name) }}
                    >
                      {getInitials(group.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold truncate ${activeGroup === group.id ? 'text-[#1A1A1F]' : 'text-[#E8E8E8]'}`}>
                        {group.name}
                      </div>
                      <div className={`text-sm truncate ${activeGroup === group.id ? 'text-[#1A1A1F]/70' : 'text-[#A8E6A3]'}`}>
                        {group.id === "global" ? "Chat global" : "Grupo privado"}
                      </div>
                    </div>
                  </button>

                  {/* Opciones de grupo (solo admin y no global) */}
                  {userRole === "admin" && group.id !== "global" && (
                    <button
                      onClick={() => setShowGroupOptions(showGroupOptions === group.id ? null : group.id)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <Settings size={14} />
                    </button>
                  )}

                  {/* Menu de opciones */}
                  {showGroupOptions === group.id && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-[#2C2C34] border border-[#3C4043] rounded-xl shadow-2xl z-10 overflow-hidden">                      <button
                        onClick={() => handleEditGroupClick(group)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#E8E8E8] hover:bg-[#3C4043] hover:text-[#A8E6A3] transition-all duration-200"
                      >
                        <Edit2 size={14} />
                        Editar grupo
                      </button>
                      <button
                        onClick={() => {
                          onDeleteGroup(group.id);
                          setShowGroupOptions(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-200"
                      >
                        <Trash2 size={14} />
                        Eliminar grupo
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "users" && (
            <div className="p-4 space-y-2">
              {/* Lista de usuarios con scroll personalizado */}
              <div className="space-y-2 max-h-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#A8E6A3] scrollbar-track-[#3C4043]">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#3C4043] transition-all duration-200 border border-transparent hover:border-[#4A4A4F]">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium text-white shadow-md"
                      style={{ backgroundColor: getAvatarColor(user.username) }}
                    >
                      {getInitials(user.username)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate text-[#E8E8E8]">{user.username}</div>
                      <div className="text-sm text-[#A8E6A3] capitalize">
                        {user.role === 'admin' ? '👑 ' : ''}
                        {user.role}
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full shadow-sm ${
                      user.isOnline ? "bg-[#A8E6A3] shadow-[#A8E6A3]/50" : "bg-[#B8B8B8]"
                    }`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "objectives" && (
            <div className="p-4">
              <div className="bg-[#252529] rounded-xl p-6 border border-[#3C4043] text-center">
                <Target size={48} className="mx-auto mb-4 text-[#A8E6A3]" />
                <h3 className="text-lg font-semibold text-[#E8E8E8] mb-2">Gestión de Objetivos</h3>
                <p className="text-[#B8B8B8] text-sm mb-4">
                  Los objetivos y tareas se gestionan desde el área principal del chat.
                </p>
                <div className="text-xs text-[#A8E6A3] bg-[#A8E6A3]/10 rounded-lg p-3">
                  💡 Selecciona un grupo y accede a los objetivos desde el panel principal
                </div>
              </div>
            </div>
          )}        </div>        {/* Sección inferior del sidebar */}
        <div className="mt-auto border-t border-[#3C4043] bg-[#252529] p-4">
          <div className="flex items-center justify-center">
            {/* Botón de cerrar sesión */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full h-12 bg-red-900/20 rounded-xl hover:bg-red-900/40 transition-all duration-200 shadow-md group border border-red-800/30 hover:border-red-700/50"
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
      </div>{/* Modales para crear/editar grupos */}
      {showCreateModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-[60] animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-[#2C2C34] to-[#1A1A1F] rounded-2xl border border-[#3C4043] p-6 w-96 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-[#A8E6A3] mb-4 flex items-center gap-2">
              <Plus size={20} />
              Crear Nuevo Grupo
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#E8E8E8] mb-2">Nombre del grupo *</label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1A1A1F] border border-[#2C2C34] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6A3] focus:border-transparent text-[#E8E8E8] placeholder-[#B8B8B8] transition-all"
                  placeholder="Ingresa el nombre del grupo"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#E8E8E8] mb-2">Descripción (opcional)</label>
                <textarea
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-[#1A1A1F] border border-[#2C2C34] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6A3] focus:border-transparent text-[#E8E8E8] placeholder-[#B8B8B8] resize-none transition-all"
                  placeholder="Describe el propósito del grupo"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-[#3C4043] text-[#E8E8E8] rounded-xl hover:bg-[#4A4A4F] transition-all duration-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitCreate}
                  disabled={!groupForm.name.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#A8E6A3] to-[#7BC97B] text-[#1A1A1F] rounded-xl hover:from-[#7BC97B] hover:to-[#A8E6A3] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Crear Grupo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-[60] animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-[#2C2C34] to-[#1A1A1F] rounded-2xl border border-[#3C4043] p-6 w-96 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-[#A8E6A3] mb-4 flex items-center gap-2">
              <Edit2 size={20} />
              Editar Grupo
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#E8E8E8] mb-2">Nombre del grupo *</label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1A1A1F] border border-[#2C2C34] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6A3] focus:border-transparent text-[#E8E8E8] placeholder-[#B8B8B8] transition-all"
                  placeholder="Ingresa el nombre del grupo"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#E8E8E8] mb-2">Descripción (opcional)</label>
                <textarea
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-[#1A1A1F] border border-[#2C2C34] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6A3] focus:border-transparent text-[#E8E8E8] placeholder-[#B8B8B8] resize-none transition-all"
                  placeholder="Describe el propósito del grupo"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 bg-[#3C4043] text-[#E8E8E8] rounded-xl hover:bg-[#4A4A4F] transition-all duration-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitEdit}
                  disabled={!groupForm.name.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#A8E6A3] to-[#7BC97B] text-[#1A1A1F] rounded-xl hover:from-[#7BC97B] hover:to-[#A8E6A3] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>          </div>
        </div>
      )}

      {/* Modal de Notificaciones */}
      {showNotifications && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-[60] animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-[#2C2C34] to-[#1A1A1F] rounded-2xl border border-[#3C4043] w-96 max-h-[70vh] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b border-[#3C4043]">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-[#A8E6A3]" />
                <h3 className="text-xl font-bold text-[#A8E6A3]">Notificaciones</h3>
                {unreadNotifications > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                    {unreadNotifications} nuevas
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-lg hover:bg-[#3C4043] transition-all duration-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido de notificaciones */}
            <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-[#3C4043] scrollbar-track-[#252529]">
              {notifications.length > 0 ? (
                <div className="p-4 space-y-3">
                  {/* Botón marcar todas como leídas */}
                  {unreadNotifications > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="w-full flex items-center justify-center gap-2 p-2 text-sm text-[#A8E6A3] hover:bg-[#3C4043] rounded-lg transition-all duration-200"
                    >
                      <Check size={14} />
                      Marcar todas como leídas
                    </button>
                  )}
                  
                  {/* Lista de notificaciones */}
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                        notification.read
                          ? 'bg-[#252529] border-[#3C4043] hover:bg-[#2C2C34]'
                          : 'bg-[#2C2C34] border-[#A8E6A3]/30 hover:bg-[#3C4043]'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className={`font-semibold text-sm ${
                              notification.read ? 'text-[#B8B8B8]' : 'text-[#E8E8E8]'
                            }`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#A8E6A3] flex items-center gap-1">
                                <Clock size={10} />
                                {notification.time}
                              </span>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-[#A8E6A3] rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <p className={`text-sm ${
                            notification.read ? 'text-[#B8B8B8]' : 'text-[#E8E8E8]'
                          }`}>
                            {notification.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Bell size={48} className="mx-auto mb-4 text-[#3C4043]" />
                  <h4 className="text-lg font-semibold text-[#B8B8B8] mb-2">Sin notificaciones</h4>
                  <p className="text-sm text-[#B8B8B8]">
                    No tienes notificaciones pendientes
                  </p>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="p-4 border-t border-[#3C4043] bg-[#252529]">
              <button
                onClick={() => setShowNotifications(false)}
                className="w-full px-4 py-2 bg-[#3C4043] text-[#E8E8E8] rounded-xl hover:bg-[#4A4A4F] transition-all duration-200 font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatSidebar;
