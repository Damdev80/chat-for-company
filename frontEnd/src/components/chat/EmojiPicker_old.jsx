import React, { useState, useRef, useEffect } from "react";
import { Search, Clock, X } from "lucide-react";
import { emojiCategories, emojiNames } from "../../utils/chatUtils";

const EmojiPicker = ({ onEmojiSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('frecuentes');
  const [searchTerm, setSearchTerm] = useState('');
  const [recentEmojis, setRecentEmojis] = useState(() => {
    const saved = localStorage.getItem('recentEmojis');
    return saved ? JSON.parse(saved) : ["😊", "👍", "❤️", "😂"];
  });
  const scrollContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  // Filtrar emojis basado en búsqueda mejorada
  const filteredEmojis = searchTerm 
    ? Object.values(emojiCategories).flatMap(cat => 
        cat.emojis.filter(emoji => {
          const searchLower = searchTerm.toLowerCase();
          const emojiNamesForThis = emojiNames[emoji] || [];
          
          // Buscar en nombres del emoji o en el emoji mismo
          return emojiNamesForThis.some(name => 
            name.toLowerCase().includes(searchLower)
          ) || emoji.includes(searchTerm);
        })
      )
    : emojiCategories[activeCategory]?.emojis || [];

  // Manejar selección de emoji
  const handleEmojiSelect = (emoji) => {
    // Agregar a recientes
    const newRecents = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 8);
    setRecentEmojis(newRecents);
    localStorage.setItem('recentEmojis', JSON.stringify(newRecents));
    
    onEmojiSelect(emoji);
  };
  // Efecto para el foco en búsqueda y navegación con teclado
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    // Manejar teclas especiales
    const handleKeyDown = (e) => {
      // Tecla "/" para enfocar búsqueda
      if (e.key === '/' && !searchTerm && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Escape para cerrar
      else if (e.key === 'Escape') {
        if (searchTerm) {
          setSearchTerm('');
        } else if (onClose) {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchTerm, onClose]);

  return (
    <div className="bg-gradient-to-br from-[#2C2C34] via-[#252529] to-[#1A1A1F] border border-[#3C4043] rounded-2xl shadow-2xl backdrop-blur-xl w-80 sm:w-96 animate-in slide-in-from-bottom-4 duration-300 max-h-96 flex flex-col">
      {/* Header con búsqueda */}
      <div className="p-4 border-b border-[#3C4043]/50 bg-gradient-to-r from-[#2C2C34] to-[#252529]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#A8E6A3] flex items-center gap-2">
            <span className="text-lg">😊</span>
            Emojis
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-lg hover:bg-[#3C4043] transition-all"
            >
              <X size={16} />
            </button>
          )}
        </div>
          {/* Barra de búsqueda mejorada */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B8B8B8]" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar: feliz, amor, comida..."
            className="w-full pl-9 pr-3 py-2 bg-[#1A1A1F] border border-[#3C4043] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6A3]/30 focus:border-[#A8E6A3] text-[#E8E8E8] placeholder-[#B8B8B8] text-sm transition-all duration-200"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#B8B8B8] hover:text-[#A8E6A3] transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sugerencias de búsqueda rápida */}
        {!searchTerm && (
          <div className="mt-2 flex flex-wrap gap-1">
            {["feliz", "amor", "comida", "fuego", "ok"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setSearchTerm(suggestion)}
                className="px-2 py-1 text-xs bg-[#3C4043]/40 text-[#B8B8B8] rounded-lg hover:bg-[#A8E6A3]/20 hover:text-[#A8E6A3] transition-all duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>      {/* Pestañas de categorías */}
      {!searchTerm && (
        <div className="flex overflow-x-auto scrollbar-none bg-[#252529]/50 border-b border-[#3C4043]/30">
          {/* Recientes primero */}
          {recentEmojis.length > 0 && (
            <button
              onClick={() => setActiveCategory('recientes')}
              className={`flex-shrink-0 flex items-center justify-center p-3 text-lg transition-all duration-200 border-b-2 emoji-category-tab ${
                activeCategory === 'recientes'
                  ? 'border-[#A8E6A3] bg-[#A8E6A3]/10 text-[#A8E6A3]'
                  : 'border-transparent hover:bg-[#3C4043]/50 text-[#B8B8B8] hover:text-[#A8E6A3]'
              }`}
              title="Recientes"
            >
              <Clock size={18} className="animate-soft-pulse" />
            </button>
          )}
          
          {/* Categorías */}
          {Object.entries(emojiCategories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`flex-shrink-0 flex items-center justify-center p-3 text-lg transition-all duration-200 border-b-2 emoji-category-tab ${
                activeCategory === key
                  ? 'border-[#A8E6A3] bg-[#A8E6A3]/10'
                  : 'border-transparent hover:bg-[#3C4043]/50'
              }`}
              title={category.name}
            >
              <span className="emoji-bounce">{category.icon}</span>
            </button>
          ))}
        </div>
      )}      {/* Grid de emojis */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 emoji-picker-scrollbar"
      >
        {/* Mostrar recientes si está seleccionado */}
        {activeCategory === 'recientes' && !searchTerm && (            <div className="grid grid-cols-8 gap-1">
              {recentEmojis.map((emoji, index) => (
                <button
                  key={`recent-${index}`}
                  onClick={() => handleEmojiSelect(emoji)}
                  className="w-10 h-10 flex items-center justify-center text-xl hover:bg-[#3C4043]/60 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 border border-transparent hover:border-[#A8E6A3]/30 emoji-bounce relative group"
                  title="Emoji reciente"
                >
                  {emoji}
                  {/* Indicador de reciente */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#A8E6A3] rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-soft-pulse"></div>
                </button>
              ))}
            </div>
        )}

        {/* Grid principal de emojis */}
        {(activeCategory !== 'recientes' || searchTerm) && (
          <>
            {searchTerm && (
              <div className="mb-3">
                <p className="text-xs text-[#B8B8B8] mb-2">
                  {filteredEmojis.length} resultados para "{searchTerm}"
                </p>
              </div>
            )}
              <div className="grid grid-cols-8 gap-1">
              {filteredEmojis.map((emoji, index) => (
                <button
                  key={`${activeCategory}-${index}`}
                  onClick={() => handleEmojiSelect(emoji)}
                  className="w-10 h-10 flex items-center justify-center text-xl hover:bg-[#3C4043]/60 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 border border-transparent hover:border-[#A8E6A3]/30 relative group emoji-bounce"
                >
                  {emoji}
                  {/* Tooltip mejorado */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-[#1A1A1F] text-xs text-[#E8E8E8] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10 whitespace-nowrap border border-[#3C4043] emoji-tooltip">
                    {emoji}
                  </div>
                </button>
              ))}
            </div>            {filteredEmojis.length === 0 && searchTerm && (
              <div className="text-center py-8 text-[#B8B8B8]">
                <div className="text-4xl mb-3 animate-bounce">🔍</div>
                <p className="text-sm font-medium text-[#E8E8E8] mb-1">No se encontraron emojis</p>
                <p className="text-xs mb-3">para "{searchTerm}"</p>
                <div className="mt-4 p-3 bg-[#2C2C34]/50 rounded-lg border border-[#3C4043]/30">
                  <p className="text-xs text-[#A8E6A3] mb-2">💡 Prueba con:</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {["feliz", "amor", "comida", "ok", "gracias"].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setSearchTerm(suggestion)}
                        className="px-2 py-1 text-xs bg-[#A8E6A3]/20 text-[#A8E6A3] rounded-lg hover:bg-[#A8E6A3]/30 transition-all duration-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>      {/* Footer con info mejorado */}
      <div className="px-4 py-2 border-t border-[#3C4043]/30 bg-[#252529]/30">
        <div className="flex items-center justify-between text-xs text-[#B8B8B8]">
          <span className="flex items-center gap-1">
            {searchTerm ? (
              <>
                <Search size={12} />
                {filteredEmojis.length} resultado{filteredEmojis.length !== 1 ? 's' : ''}
              </>
            ) : (
              <>
                {activeCategory === 'recientes' ? (
                  <>
                    <Clock size={12} />
                    Emojis recientes
                  </>
                ) : (
                  <>
                    <span className="text-sm">{emojiCategories[activeCategory]?.icon}</span>
                    {emojiCategories[activeCategory]?.name}
                  </>
                )}
              </>
            )}
          </span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[#3C4043] rounded text-xs font-mono">Esc</kbd>
              <span>cerrar</span>
            </span>
            {!searchTerm && (
              <span className="flex items-center gap-1 opacity-75">
                <kbd className="px-1.5 py-0.5 bg-[#3C4043] rounded text-xs font-mono">/</kbd>
                <span>buscar</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmojiPicker;
