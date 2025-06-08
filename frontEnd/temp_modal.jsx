// Modal de crear grupo completamente mejorado con vista previa y sugerencias
{showCreateModal && (
  <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-[70] animate-in fade-in duration-300">
    <div className="bg-gradient-to-br from-[#2C2C34] via-[#252529] to-[#1A1A1F] rounded-2xl border border-[#3C4043] shadow-2xl w-full max-w-4xl mx-4 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      {/* Header mejorado */}
      <div className="bg-gradient-to-r from-[#A8E6A3]/10 to-[#7DD3C0]/10 border-b border-[#3C4043] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#A8E6A3]/20 rounded-xl">
              <Plus size={24} className="text-[#A8E6A3]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#E8E8E8]">Crear Nuevo Grupo</h3>
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
                  className="text-left px-3 py-2 bg-[#1A1A1F] border border-[#3C4043] rounded-lg hover:border-[#A8E6A3]/50 hover:bg-[#252529] transition-all duration-200 text-sm text-[#E8E8E8] hover:text-[#A8E6A3]"
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
            </button>
            <button
              onClick={handleSubmitCreate}
              disabled={!groupForm.name.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#A8E6A3] to-[#7DD3C0] text-[#1A1A1F] rounded-xl hover:from-[#98E093] hover:to-[#6BC9B5] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg flex items-center justify-center gap-2"
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
          <div className="bg-[#2C2C34] rounded-xl p-4 border border-[#3C4043]">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-[#A8E6A3]/20 to-[#7DD3C0]/20 border border-[#A8E6A3]/30">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg transition-all duration-300"
                style={{ 
                  backgroundColor: groupForm.name ? getAvatarColor(groupForm.name) : '#6B7280' 
                }}
              >
                {groupForm.name ? getInitials(groupForm.name) : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[#E8E8E8] text-lg">
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
              <h5 className="text-sm font-semibold text-[#E8E8E8] mb-3 flex items-center gap-2">
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
              <h5 className="text-sm font-semibold text-[#E8E8E8] mb-3">Características incluidas</h5>
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
