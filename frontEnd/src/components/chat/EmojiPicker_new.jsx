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
    const newRecents = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 12);
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
    <div className="bg-gradient-to-br from-[#2C2C34] via-[#252529] to-[#1A1A1F] border border-[#3C4043] rounded-2xl shadow-2xl backdrop-blur-xl w-[28rem] sm:w-[32rem] animate-in slide-in-from-bottom-4 duration-300 max-h-[36rem] flex flex-col">
      {/* Header con búsqueda - Más grande */}
      <div className="p-5 border-b border-[#3C4043]/50 bg-gradient-to-r from-[#2C2C34] to-[#252529]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#A8E6A3] flex items-center gap-3">
            <span className="text-2xl">😊</span>
            <span>Selector de Emojis</span>
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-lg hover:bg-[#3C4043] transition-all"
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        {/* Barra de búsqueda mejorada */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B8B8B8]" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar: feliz, amor, comida, fuego, ok..."
            className="w-full pl-10 pr-10 py-3 bg-[#1A1A1F] border border-[#3C4043] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6A3]/30 focus:border-[#A8E6A3] text-[#E8E8E8] placeholder-[#B8B8B8] text-sm transition-all duration-200"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#B8B8B8] hover:text-[#A8E6A3] transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sugerencias de búsqueda rápida */}
        {!searchTerm && (
          <div className="mt-3 flex flex-wrap gap-2">
            {["feliz", "amor", "comida", "fuego", "ok", "gracias"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setSearchTerm(suggestion)}
                className="px-3 py-1.5 text-xs bg-[#3C4043]/40 text-[#B8B8B8] rounded-lg hover:bg-[#A8E6A3]/20 hover:text-[#A8E6A3] transition-all duration-200 border border-transparent hover:border-[#A8E6A3]/30"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pestañas de categorías con nombres */}
      {!searchTerm && (
        <div className="flex flex-col bg-[#252529]/50 border-b border-[#3C4043]/30">
          <div className="flex overflow-x-auto scrollbar-none">
            {/* Recientes primero */}
            {recentEmojis.length > 0 && (
              <button
                onClick={() => setActiveCategory('recientes')}
                className={`flex-shrink-0 flex flex-col items-center justify-center p-3 min-w-[5rem] transition-all duration-200 border-b-2 emoji-category-tab ${
                  activeCategory === 'recientes'
                    ? 'border-[#A8E6A3] bg-[#A8E6A3]/10 text-[#A8E6A3]'
                    : 'border-transparent hover:bg-[#3C4043]/50 text-[#B8B8B8] hover:text-[#A8E6A3]'
                }`}
              >
                <Clock size={20} className="animate-soft-pulse mb-1" />
                <span className="text-xs font-medium">Recientes</span>
              </button>
            )}
            
            {/* Categorías con nombres */}
            {Object.entries(emojiCategories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`flex-shrink-0 flex flex-col items-center justify-center p-3 min-w-[5rem] transition-all duration-200 border-b-2 emoji-category-tab ${
                  activeCategory === key
                    ? 'border-[#A8E6A3] bg-[#A8E6A3]/10 text-[#A8E6A3]'
                    : 'border-transparent hover:bg-[#3C4043]/50 text-[#B8B8B8] hover:text-[#A8E6A3]'
                }`}
              >
                <span className="emoji-bounce text-xl mb-1">{category.icon}</span>
                <span className="text-xs font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid de emojis más grande */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-5 emoji-picker-scrollbar"
      >
        {/* Mostrar recientes si está seleccionado */}
        {activeCategory === 'recientes' && !searchTerm && (
          <>
            <div className="mb-4">
              <h4 className="text-sm font-medium text-[#A8E6A3] mb-2 flex items-center gap-2">
                <Clock size={16} />
                Emojis usados recientemente
              </h4>
            </div>
            <div className="grid grid-cols-10 gap-2">
              {recentEmojis.map((emoji, index) => (
                <button
                  key={`recent-${index}`}
                  onClick={() => handleEmojiSelect(emoji)}
                  className="w-12 h-12 flex items-center justify-center text-2xl hover:bg-[#3C4043]/60 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 border border-transparent hover:border-[#A8E6A3]/30 emoji-bounce relative group"
                  title="Emoji reciente"
                >
                  {emoji}
                  {/* Indicador de reciente */}
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#A8E6A3] rounded-full opacity-60 group-hover:opacity-100 transition-opacity animate-soft-pulse"></div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Grid principal de emojis */}
        {(activeCategory !== 'recientes' || searchTerm) && (
          <>
            {/* Header de categoría o resultados de búsqueda */}
            <div className="mb-4">
              {searchTerm ? (
                <h4 className="text-sm font-medium text-[#A8E6A3] mb-2 flex items-center gap-2">
                  <Search size={16} />
                  {filteredEmojis.length} resultado{filteredEmojis.length !== 1 ? 's' : ''} para "{searchTerm}"
                </h4>
              ) : (
                <h4 className="text-sm font-medium text-[#A8E6A3] mb-2 flex items-center gap-2">
                  <span className="text-lg">{emojiCategories[activeCategory]?.icon}</span>
                  {emojiCategories[activeCategory]?.name}
                </h4>
              )}
            </div>
            
            <div className="grid grid-cols-10 gap-2">
              {filteredEmojis.map((emoji, index) => (                <button
                  key={`${activeCategory}-${index}`}
                  onClick={() => handleEmojiSelect(emoji)}
                  className="w-12 h-12 flex items-center justify-center text-2xl hover:bg-[#3C4043]/60 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 border border-transparent hover:border-[#A8E6A3]/30 emoji-bounce"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {filteredEmojis.length === 0 && searchTerm && (
              <div className="text-center py-12 text-[#B8B8B8]">
                <div className="text-5xl mb-4 animate-bounce">🔍</div>
                <p className="text-base font-medium text-[#E8E8E8] mb-2">No se encontraron emojis</p>
                <p className="text-sm mb-6">para "{searchTerm}"</p>
                <div className="mt-6 p-4 bg-[#2C2C34]/50 rounded-xl border border-[#3C4043]/30 max-w-md mx-auto">
                  <p className="text-sm text-[#A8E6A3] mb-3 flex items-center justify-center gap-2">
                    <span>💡</span>
                    Prueba con estas palabras:
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["feliz", "amor", "comida", "ok", "gracias", "fuego", "estrella"].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setSearchTerm(suggestion)}
                        className="px-3 py-2 text-sm bg-[#A8E6A3]/20 text-[#A8E6A3] rounded-lg hover:bg-[#A8E6A3]/30 transition-all duration-200 border border-[#A8E6A3]/30 hover:border-[#A8E6A3]/50"
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
      </div>

      {/* Footer con info mejorado */}
      <div className="px-5 py-3 border-t border-[#3C4043]/30 bg-[#252529]/30">
        <div className="flex items-center justify-between text-sm text-[#B8B8B8]">
          <span className="flex items-center gap-2">
            {searchTerm ? (
              <>
                <Search size={14} />
                <span className="text-[#A8E6A3]">{filteredEmojis.length}</span>
                resultado{filteredEmojis.length !== 1 ? 's' : ''}
              </>
            ) : (
              <>
                {activeCategory === 'recientes' ? (
                  <>
                    <Clock size={14} />
                    <span className="text-[#A8E6A3]">Recientes</span>
                    ({recentEmojis.length})
                  </>
                ) : (
                  <>
                    <span className="text-lg">{emojiCategories[activeCategory]?.icon}</span>
                    <span className="text-[#A8E6A3]">{emojiCategories[activeCategory]?.name}</span>
                    ({emojiCategories[activeCategory]?.emojis.length})
                  </>
                )}
              </>
            )}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-[#3C4043] rounded text-xs font-mono">Esc</kbd>
              <span>cerrar</span>
            </span>
            {!searchTerm && (
              <span className="flex items-center gap-1 opacity-75">
                <kbd className="px-2 py-1 bg-[#3C4043] rounded text-xs font-mono">/</kbd>
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
