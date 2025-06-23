import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para manejar el estado del sidebar
 * Funciona igual en móvil y desktop - simple show/hide
 */
const useSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024); // Abierto por defecto en desktop
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const [autoHide, setAutoHide] = useState(true);
  
  // Detectar tamaño de pantalla
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Listener para cambios de tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const wasMobile = isMobile;
      const nowMobile = width < 1024;
      
      setIsMobile(nowMobile);
      
      // Si cambia de móvil a desktop, abrir sidebar
      // Si cambia de desktop a móvil, cerrar sidebar
      if (wasMobile && !nowMobile) {
        setSidebarOpen(true);
      } else if (!wasMobile && nowMobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // Función simple para toggle del sidebar (igual en móvil y desktop)
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Función para abrir el sidebar
  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  // Función para cerrar el sidebar
  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);
  // Auto-ocultar sidebar cuando se abre contenido multimedia
  const handleMediaOpen = useCallback(() => {
    if (autoHide) {
      setSidebarOpen(false);
    }
  }, [autoHide]);

  // Funciones para el redimensionamiento (solo desktop)
  const handleMouseMove = useCallback((e) => {
    if (isResizing && !isMobile) {
      const newWidth = e.clientX;
      if (newWidth >= 280 && newWidth <= 500) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing, isMobile]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleMouseDown = useCallback((e) => {
    if (!isMobile) {
      e.preventDefault();
      setIsResizing(true);
    }
  }, [isMobile]);

  // Cerrar sidebar con Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen]);

  return {
    // Estados
    sidebarOpen,
    sidebarWidth,
    isResizing,
    autoHide,
    isMobile,
    
    // Setters
    setSidebarOpen,
    setSidebarWidth,
    setIsResizing,
    setAutoHide,
    
    // Funciones
    toggleSidebar,
    openSidebar,
    closeSidebar,
    handleMediaOpen,
    handleMouseDown,
    
    // Utilidades
    shouldShowOverlay: sidebarOpen && isMobile,
    sidebarClasses: `
      fixed lg:relative top-0 left-0 h-screen bg-gradient-to-b from-[#2C2C34] via-[#252529] to-[#1A1A1F] border-r border-[#3C4043] 
      transform transition-all duration-300 ease-in-out z-50 flex flex-col
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    `,
    sidebarStyle: {
      width: isMobile 
        ? (sidebarOpen ? '100vw' : '0') 
        : (sidebarOpen ? `${sidebarWidth}px` : '0'),
      maxWidth: isMobile ? '380px' : 'none',
      minWidth: sidebarOpen ? (isMobile ? '320px' : '320px') : '0'
    }
  };
};

export default useSidebar;
