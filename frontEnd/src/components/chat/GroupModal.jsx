import React, { useState } from "react";
import { X, Users, Plus, Edit3, AlertCircle } from "lucide-react";

const GroupModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  groupName, 
  setGroupName,
  isEdit = false
}) => {
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    
    if (!groupName.trim()) {
      newErrors.name = "El nombre del grupo es requerido";
    } else if (groupName.trim().length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres";
    } else if (groupName.trim().length > 50) {
      newErrors.name = "El nombre no puede exceder 50 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(e);
    }
  };

  const handleClose = () => {
    setDescription("");
    setErrors({});
    onClose();
  };

  return (    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-[70] animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-[#2C2C34] via-[#252529] to-[#1A1A1F] rounded-2xl border border-[#3C4043] w-full max-w-md mx-4 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#A8E6A3]/10 to-[#7DD3C0]/10 border-b border-[#3C4043] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#A8E6A3]/20 rounded-xl">
                {isEdit ? (
                  <Edit3 size={20} className="text-[#A8E6A3]" />
                ) : (
                  <Plus size={20} className="text-[#A8E6A3]" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#E8E8E8]">{title}</h3>
                <p className="text-sm text-[#B8B8B8]">
                  {isEdit ? "Modifica los detalles del grupo" : "Crea un nuevo espacio de colaboración"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-xl hover:bg-[#3C4043] transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>            <label 
              htmlFor="groupName" 
              className="flex items-center gap-2 text-sm font-semibold text-[#A8E6A3] mb-3"
            >
              <Users size={16} />
              Nombre del grupo
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: null }));
                }
              }}
              placeholder="Ej: Equipo de Desarrollo"
              className={`w-full px-4 py-3 bg-[#1A1A1F] border rounded-xl focus:outline-none focus:ring-2 text-[#E8E8E8] placeholder-[#B8B8B8] transition-all duration-200 ${
                errors.name 
                  ? 'border-red-500 focus:ring-red-500/30' 
                  : 'border-[#3C4043] focus:ring-[#A8E6A3]/30 focus:border-[#A8E6A3]'
              }`}
              maxLength={50}
            />
            {errors.name && (
              <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                <AlertCircle size={14} />
                {errors.name}
              </div>
            )}
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-[#B8B8B8]">
                Usa un nombre descriptivo y fácil de recordar
              </p>
              <span className={`text-xs ${groupName.length > 40 ? 'text-orange-400' : 'text-[#B8B8B8]'}`}>
                {groupName.length}/50
              </span>
            </div>
          </div>

          <div>
            <label 
              htmlFor="groupDescription" 
              className="block text-sm font-semibold text-[#A8E6A3] mb-3"
            >
              Descripción (opcional)
            </label>
            <textarea
              id="groupDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el propósito y objetivos del grupo..."
              rows={3}
              className="w-full px-4 py-3 bg-[#1A1A1F] border border-[#3C4043] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6A3]/30 focus:border-[#A8E6A3] text-[#E8E8E8] placeholder-[#B8B8B8] resize-none transition-all duration-200"
              maxLength={200}
            />
            <p className="text-xs text-[#B8B8B8] mt-2">
              Ayuda a los miembros a entender el propósito del grupo
            </p>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-[#3C4043] text-[#E8E8E8] rounded-xl hover:bg-[#4A4A4F] transition-all duration-200 font-medium"
            >
              Cancelar            </button>
            <button
              type="submit"
              disabled={!groupName.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#A8E6A3] to-[#7DD3C0] text-[#1A1A1F] rounded-xl hover:from-[#98E093] hover:to-[#6BC9B5] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2"
            >
              {isEdit ? <Edit3 size={16} /> : <Plus size={16} />}
              {isEdit ? "Guardar cambios" : "Crear grupo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupModal;
