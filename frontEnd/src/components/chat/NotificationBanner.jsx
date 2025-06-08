import React, { useEffect } from "react";
import { X, Bell } from "lucide-react";

const NotificationBanner = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-gradient-to-br from-[#2C2C34] via-[#252529] to-[#1A1A1F] border border-[#3C4043] rounded-xl p-4 flex items-start gap-3 backdrop-blur-sm animate-in slide-in-from-top-2 fade-in duration-300">
        {/* Icono */}
        <div className="flex-shrink-0 w-8 h-8 bg-[#A8E6A3]/20 rounded-full flex items-center justify-center">
          <Bell size={16} className="text-[#A8E6A3]" />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-[#E8E8E8] mb-1">
            {notification.title}
          </h4>
          <p className="text-sm text-[#B8B8B8] break-words">
            {notification.message}
          </p>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-lg hover:bg-[#3C4043] transition-all duration-200"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default NotificationBanner;
