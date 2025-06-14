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
    <div className="bg-gradient-to-br from-[#2C2C34] via-[#252529] to-[#1A1A1F] border border-[#3C4043] rounded-2xl shadow-2xl backdrop-blur-xl w-[calc(100vw-1rem)] max-w-[28rem] sm:w-[32rem] animate-in slide-in-from-bottom-4 duration-300 max-h-[calc(100vh-8rem)] sm:max-h-[36rem] flex flex-col mx-2 sm:mx-0">
      {/* Header con búsqueda - Responsivo */}
      <div className="p-3 sm:p-5 border-b border-[#3C4043]/50 bg-gradient-to-r from-[#2C2C34] to-[#252529]">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-[#A8E6A3] flex items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl">😊</span>
            <span className="hidden sm:inline">Selector de Emojis</span>
            <span className="sm:hidden">Emojis</span>
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-[#B8B8B8] hover:text-[#A8E6A3] rounded-lg hover:bg-[#3C4043] transition-all"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
        
        {/* Barra de búsqueda responsiva */}
        <div className="relative">
          <Search size={14} className="sm:w-4 sm:h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B8B8B8]" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar: feliz, amor, comida..."
            className="w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-2.5 sm:py-3 bg-[#1A1A1F] border border-[#3C4043] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6A3]/30 focus:border-[#A8E6A3] text-[#E8E8E8] placeholder-[#B8B8B8] text-sm transition-all duration-200"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#B8B8B8] hover:text-[#A8E6A3] transition-colors"
            >
              <X size={14} className="sm:w-4 sm:h-4" />
            </button>
          )}
        </div>

        {/* Sugerencias de búsqueda - Responsivo */}
        {!searchTerm && (
          <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
            {["feliz", "amor", "comida", "fuego", "ok"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setSearchTerm(suggestion)}
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-[#3C4043]/40 text-[#B8B8B8] rounded-lg hover:bg-[#A8E6A3]/20 hover:text-[#A8E6A3] transition-all duration-200 border border-transparent hover:border-[#A8E6A3]/30"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>      {/* Pestañas de categorías responsivas */}
      {!searchTerm && (
        <div className="flex flex-col bg-[#252529]/50 border-b border-[#3C4043]/30">
          <div className="flex overflow-x-auto scrollbar-none">
            {/* Recientes primero */}
            {recentEmojis.length > 0 && (
              <button
                onClick={() => setActiveCategory('recientes')}
                className={`flex-shrink-0 flex flex-col items-center justify-center p-2 sm:p-3 min-w-[3.5rem] sm:min-w-[5rem] transition-all duration-200 border-b-2 emoji-category-tab ${
                  activeCategory === 'recientes'
                    ? 'border-[#A8E6A3] bg-[#A8E6A3]/10 text-[#A8E6A3]'
                    : 'border-transparent hover:bg-[#3C4043]/50 text-[#B8B8B8] hover:text-[#A8E6A3]'
                }`}
              >
                <Clock size={16} className="sm:w-5 sm:h-5 animate-soft-pulse mb-0.5 sm:mb-1" />
                <span className="text-xs font-medium">Recientes</span>
              </button>
            )}
            
            {/* Categorías con nombres responsivas */}
            {Object.entries(emojiCategories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`flex-shrink-0 flex flex-col items-center justify-center p-2 sm:p-3 min-w-[3.5rem] sm:min-w-[5rem] transition-all duration-200 border-b-2 emoji-category-tab ${
                  activeCategory === key
                    ? 'border-[#A8E6A3] bg-[#A8E6A3]/10 text-[#A8E6A3]'
                    : 'border-transparent hover:bg-[#3C4043]/50 text-[#B8B8B8] hover:text-[#A8E6A3]'
                }`}
              >
                <span className="emoji-bounce text-lg sm:text-xl mb-0.5 sm:mb-1">{category.icon}</span>
                <span className="text-xs font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}      {/* Grid de emojis responsivo */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-5 emoji-picker-scrollbar"
      >
        {/* Mostrar recientes si está seleccionado */}
        {activeCategory === 'recientes' && !searchTerm && (
          <>
            <div className="mb-3 sm:mb-4">
              <h4 className="text-sm font-medium text-[#A8E6A3] mb-2 flex items-center gap-2">
                <Clock size={14} className="sm:w-4 sm:h-4" />
                Emojis usados recientemente
              </h4>
            </div>            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 sm:gap-2">
              {recentEmojis.map((emoji, index) => (
                <div
                  key={`recent-${index}`}
                  className="emoji-button-container"
                >                  <button
                    onClick={() => handleEmojiSelect(emoji)}
                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl hover:bg-[#3C4043]/60 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 border border-transparent hover:border-[#A8E6A3]/30 emoji-bounce relative group emoji-button-mobile"
                  >
                    {emoji}
                    {/* Indicador de reciente */}
                    <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#A8E6A3] rounded-full opacity-60 group-hover:opacity-100 transition-opacity animate-soft-pulse"></div>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Grid principal de emojis */}
        {(activeCategory !== 'recientes' || searchTerm) && (
          <>
            {/* Header de categoría o resultados de búsqueda */}
            <div className="mb-3 sm:mb-4">
              {searchTerm ? (
                <h4 className="text-sm font-medium text-[#A8E6A3] mb-2 flex items-center gap-2">
                  <Search size={14} className="sm:w-4 sm:h-4" />
                  {filteredEmojis.length} resultado{filteredEmojis.length !== 1 ? 's' : ''} para "{searchTerm}"
                </h4>
              ) : (
                <h4 className="text-sm font-medium text-[#A8E6A3] mb-2 flex items-center gap-2">
                  <span className="text-base sm:text-lg">{emojiCategories[activeCategory]?.icon}</span>
                  {emojiCategories[activeCategory]?.name}
                </h4>
              )}
            </div>            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 sm:gap-2">
              {filteredEmojis.map((emoji, index) => (
                <div
                  key={`${activeCategory}-${index}`}
                  className="emoji-button-container"
                >
                  <button
                    onClick={() => handleEmojiSelect(emoji)}
                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl hover:bg-[#3C4043]/60 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 border border-transparent hover:border-[#A8E6A3]/30 relative group emoji-bounce emoji-button-mobile"
                  >
                    {emoji}
                  </button>
                </div>
              ))}
            </div>{filteredEmojis.length === 0 && searchTerm && (
              <div className="text-center py-8 sm:py-12 text-[#B8B8B8]">
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 animate-bounce">🔍</div>
                <p className="text-sm sm:text-base font-medium text-[#E8E8E8] mb-2">No se encontraron emojis</p>
                <p className="text-xs sm:text-sm mb-4 sm:mb-6">para "{searchTerm}"</p>
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-[#2C2C34]/50 rounded-xl border border-[#3C4043]/30 max-w-xs sm:max-w-md mx-auto">
                  <p className="text-xs sm:text-sm text-[#A8E6A3] mb-2 sm:mb-3 flex items-center justify-center gap-2">
                    <span>💡</span>
                    Prueba con estas palabras:
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                    {["feliz", "amor", "comida", "ok", "gracias", "fuego", "estrella"].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setSearchTerm(suggestion)}
                        className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm bg-[#A8E6A3]/20 text-[#A8E6A3] rounded-lg hover:bg-[#A8E6A3]/30 transition-all duration-200 border border-[#A8E6A3]/30 hover:border-[#A8E6A3]/50"
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

      {/* Footer responsivo */}
      <div className="px-3 sm:px-5 py-2 sm:py-3 border-t border-[#3C4043]/30 bg-[#252529]/30">
        <div className="flex items-center justify-between text-xs sm:text-sm text-[#B8B8B8]">
          <span className="flex items-center gap-1 sm:gap-2">
            {searchTerm ? (
              <>
                <Search size={12} className="sm:w-3.5 sm:h-3.5" />
                <span className="text-[#A8E6A3]">{filteredEmojis.length}</span>
                <span className="hidden sm:inline">resultado{filteredEmojis.length !== 1 ? 's' : ''}</span>
                <span className="sm:hidden">res.</span>
              </>
            ) : (
              <>
                {activeCategory === 'recientes' ? (
                  <>
                    <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                    <span className="text-[#A8E6A3]">Recientes</span>
                    <span className="hidden sm:inline">({recentEmojis.length})</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm sm:text-base">{emojiCategories[activeCategory]?.icon}</span>
                    <span className="text-[#A8E6A3]">{emojiCategories[activeCategory]?.name}</span>
                    <span className="hidden sm:inline">({emojiCategories[activeCategory]?.emojis.length})</span>
                  </>
                )}
              </>
            )}
          </span>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#3C4043] rounded text-xs font-mono">Esc</kbd>
              <span className="hidden sm:inline">cerrar</span>
            </span>
            {!searchTerm && (
              <span className="hidden sm:flex items-center gap-1 opacity-75">
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