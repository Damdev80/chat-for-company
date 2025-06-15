import React from "react";
import { Phone, Trash2, Info, Menu, ArrowLeft, Bell, PhoneCall, Video } from "lucide-react";
import { getInitials, getAvatarColor } from "../../utils/chatUtils";
import { useCall } from "../../context/CallContext";

const ChatHeader = ({
  activeGroup, 
  groups, 
  onToggleSidebar, 
  onToggleGroupInfo,
  onDeleteChat,
  notifications = [],
  onShowNotifications,
  userRole
}) => {
  const { startGroupCall, isConnecting } = useCall();
  const currentGroup = groups.find(g => g.id === activeGroup);
  const groupName = currentGroup?.name || "Chat";
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleGroupCall = async () => {
    if (activeGroup && activeGroup !== "global") {
      await startGroupCall(activeGroup);
    }
  };
    return (
    <div className="border-b border-[#3C4043] p-3 sm:p-4 bg-gradient-to-r from-[#2C2C34] to-[#252529]">
      <div className="flex items-center justify-between">        {/* Lado izquierdo - Mejorado para móvil */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Botón de menú hamburguesa - Siempre visible en móvil */}
          <button
            onClick={onToggleSidebar}
            className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-xl hover:bg-[#3C4043] transition-all duration-200 lg:hidden flex-shrink-0"
          >
            <Menu size={18} className="sm:w-5 sm:h-5" />
          </button>

          {/* Avatar del grupo */}
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium text-white border-2 border-[#A8E6A3] flex-shrink-0"
            style={{ backgroundColor: getAvatarColor(groupName) }}
          >
            {getInitials(groupName)}
          </div>

          {/* Info del grupo - Adaptada para móvil */}
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-[#E8E8E8] truncate text-sm sm:text-base">{groupName}</h2>
            <p className="text-xs sm:text-sm text-[#A8E6A3] truncate">
              {activeGroup === "global" ? "Chat global" : "Grupo privado"}
            </p>
          </div>
        </div>        {/* Lado derecho - Acciones responsivas */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Notificaciones */}
          <button
            onClick={onShowNotifications}
            className="relative p-1.5 sm:p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-xl hover:bg-[#3C4043] transition-all duration-200"
            title="Notificaciones"
          >
            <Bell size={16} className="sm:w-5 sm:h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center animate-pulse text-[10px] sm:text-xs">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>

          {/* Llamada grupal - Solo visible para grupos privados */}
          {activeGroup && activeGroup !== "global" && (
            <button
              onClick={handleGroupCall}
              disabled={isConnecting}
              className="p-1.5 sm:p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-xl hover:bg-[#3C4043] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Iniciar llamada grupal"
            >
              <PhoneCall size={16} className="sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Eliminar chat/limpiar contenido - Solo para admin */}
          {userRole === "admin" && (
            <button
              onClick={() => onDeleteChat(activeGroup)}
              className="p-1.5 sm:p-2 text-[#B8B8B8] hover:text-red-400 rounded-xl hover:bg-red-900/20 transition-all duration-200"
              title={activeGroup === "global" ? "Limpiar chat global" : "Eliminar grupo"}
            >
              <Trash2 size={16} className="sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Info del grupo */}
          <button
            onClick={onToggleGroupInfo}
            className="p-1.5 sm:p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-xl hover:bg-[#3C4043] transition-all duration-200"
            title="Información del grupo"
          >
            <Info size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
