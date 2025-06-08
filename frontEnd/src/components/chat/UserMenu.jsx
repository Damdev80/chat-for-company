import React from "react";
import { LogOut, Settings, User, Sun, Moon } from "lucide-react";

const UserMenu = ({ onLogout, onClose }) => {
  const handleAction = (action) => {
    if (action === "logout") {
      onLogout();
    } else {
      // Placeholder para otras acciones
      alert(`Funcionalidad de ${action} próximamente`);
    }
    onClose();
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
      <div className="py-1">
        <button
          onClick={() => handleAction("profile")}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <User size={16} />
          Mi perfil
        </button>
        
        <button
          onClick={() => handleAction("settings")}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <Settings size={16} />
          Configuración
        </button>
        
        <button
          onClick={() => handleAction("theme")}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <Sun size={16} />
          Cambiar tema
        </button>
        
        <hr className="my-1" />
        
        <button
          onClick={() => handleAction("logout")}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default UserMenu;
