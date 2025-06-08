import React from "react";
import { Phone, Video, Info, Menu, ArrowLeft, Bell } from "lucide-react";
import { getInitials, getAvatarColor } from "../../utils/chatUtils";

const ChatHeader = ({ 
  activeGroup, 
  groups, 
  onToggleSidebar, 
  onToggleGroupInfo,
  onCall,
  onVideoCall,
  isMobile = false,
  notifications = [],
  onShowNotifications
}) => {
  const currentGroup = groups.find(g => g.id === activeGroup);
  const groupName = currentGroup?.name || "Chat";
  const unreadNotifications = notifications.filter(n => !n.read).length;
  
  return (
    <div className="border-b border-[#3C4043] p-4 bg-gradient-to-r from-[#2C2C34] to-[#252529]">
      <div className="flex items-center justify-between">
        {/* Lado izquierdo */}
        <div className="flex items-center gap-3">
          {/* Botón de menú móvil */}
          {isMobile && (
            <button
              onClick={onToggleSidebar}
              className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-xl hover:bg-[#3C4043] transition-all duration-200 lg:hidden"
            >
              <Menu size={20} />
            </button>
          )}

          {/* Avatar del grupo */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white border-2 border-[#A8E6A3]"
            style={{ backgroundColor: getAvatarColor(groupName) }}
          >
            {getInitials(groupName)}
          </div>

          {/* Info del grupo */}
          <div>
            <h2 className="font-semibold text-[#E8E8E8]">{groupName}</h2>
            <p className="text-sm text-[#A8E6A3]">
              {activeGroup === "global" ? "Chat global" : "Grupo privado"}
            </p>
          </div>
        </div>

        {/* Lado derecho - Acciones */}
        <div className="flex items-center gap-2">
          {/* Notificaciones */}
          <button
            onClick={onShowNotifications}
            className="relative p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-xl hover:bg-[#3C4043] transition-all duration-200"
            title="Notificaciones"
          >
            <Bell size={20} />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>

          {/* Llamada de voz */}
          <button
            onClick={onCall}
            className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-xl hover:bg-[#3C4043] transition-all duration-200"
            title="Llamada de voz"
          >
            <Phone size={20} />
          </button>

          {/* Videollamada */}
          <button
            onClick={onVideoCall}
            className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-xl hover:bg-[#3C4043] transition-all duration-200"
            title="Videollamada"
          >
            <Video size={20} />
          </button>          {/* Info del grupo */}
          <button
            onClick={onToggleGroupInfo}
            className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-xl hover:bg-[#3C4043] transition-all duration-200"
            title="Información del grupo"
          >
            <Info size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
