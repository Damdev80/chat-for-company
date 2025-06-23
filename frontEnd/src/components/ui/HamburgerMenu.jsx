import React from 'react';
import { Menu, X } from 'lucide-react';

/**
 * Botón de menú hamburguesa simple para el sidebar
 * Funciona igual en móvil y desktop
 */
const HamburgerMenu = ({ 
  isOpen, 
  onClick, 
  className = '',
  size = 20 
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        p-2 text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#3C4043] 
        rounded-xl transition-all duration-200 
        flex items-center justify-center
        ${className}
      `}
      aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
      title={isOpen ? 'Cerrar menú' : 'Abrir menú'}
    >
      {isOpen ? <X size={size} /> : <Menu size={size} />}
    </button>
  );
};

/**
 * Botón flotante de menú hamburguesa para móvil
 * Aparece cuando el sidebar está cerrado
 */
export const FloatingHamburgerMenu = ({ 
  onClick, 
  visible = true,
  className = '' 
}) => {
  if (!visible) return null;

  return (
    <button
      onClick={onClick}
      className={`
        fixed top-4 left-4 z-40 p-3 
        bg-gradient-to-r from-[#A8E6A3] to-[#7DD3C0] 
        text-[#1A1A1F] rounded-xl shadow-lg 
        hover:from-[#98E093] hover:to-[#6BC9B5] 
        transition-all duration-200 
        lg:hidden
        ${className}
      `}
      aria-label="Abrir menú"
      title="Abrir menú"
    >
      <Menu size={20} />
    </button>
  );
};

export default HamburgerMenu;
