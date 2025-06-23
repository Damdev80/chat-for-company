import { useEffect } from 'react';

/**
 * Hook que detecta cuando se abren elementos multimedia (imágenes, videos)
 * y ejecuta una callback para auto-ocultar el sidebar
 */
export const useMediaAutoHide = (onMediaOpen, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    // Selectores para elementos multimedia comunes
    const mediaSelectors = [
      'img[data-expanded="true"]', // Imágenes expandidas
      'video[data-playing="true"]', // Videos reproduciéndose
      '.image-modal', // Modales de imagen
      '.video-modal', // Modales de video
      '.media-viewer', // Visor de medios
      '.fullscreen-media', // Media en pantalla completa
      '[data-media-open="true"]' // Cualquier elemento marcado como media abierto
    ];

    // Observer para detectar cambios en el DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Verificar si se añadieron elementos multimedia
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node;
              
              // Verificar si el elemento o sus hijos contienen media
              const hasMedia = mediaSelectors.some(selector => {
                return element.matches?.(selector) || element.querySelector?.(selector);
              });

              if (hasMedia) {
                onMediaOpen();
              }
            }
          });
        } else if (mutation.type === 'attributes') {
          // Verificar cambios de atributos que indican media abierto
          const target = mutation.target;
          const attributeName = mutation.attributeName;
          
          if (
            (attributeName === 'data-expanded' && target.getAttribute('data-expanded') === 'true') ||
            (attributeName === 'data-playing' && target.getAttribute('data-playing') === 'true') ||
            (attributeName === 'data-media-open' && target.getAttribute('data-media-open') === 'true') ||
            (attributeName === 'class' && target.classList.contains('fullscreen-media'))
          ) {
            onMediaOpen();
          }
        }
      });
    });

    // Configurar el observer
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-expanded', 'data-playing', 'data-media-open', 'class']
    });

    // Event listeners para eventos comunes de multimedia
    const handleImageClick = (e) => {
      const img = e.target.closest('img');
      if (img && (img.classList.contains('expandable') || img.dataset.expandable)) {
        onMediaOpen();
      }
    };

    const handleVideoPlay = (e) => {
      const video = e.target;
      if (video.tagName === 'VIDEO') {
        onMediaOpen();
      }
    };

    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        const element = document.fullscreenElement;
        if (element.tagName === 'IMG' || element.tagName === 'VIDEO' || 
            element.classList.contains('media-content')) {
          onMediaOpen();
        }
      }
    };

    // Agregar event listeners
    document.addEventListener('click', handleImageClick);
    document.addEventListener('play', handleVideoPlay, true);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Cleanup
    return () => {
      observer.disconnect();
      document.removeEventListener('click', handleImageClick);
      document.removeEventListener('play', handleVideoPlay, true);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onMediaOpen, enabled]);
};

/**
 * Utilidades para marcar elementos multimedia
 */
export const markMediaAsOpen = (element) => {
  if (element) {
    element.setAttribute('data-media-open', 'true');
  }
};

export const markMediaAsClosed = (element) => {
  if (element) {
    element.removeAttribute('data-media-open');
  }
};

export const markImageAsExpanded = (img, expanded = true) => {
  if (img) {
    img.setAttribute('data-expanded', expanded.toString());
  }
};

export const markVideoAsPlaying = (video, playing = true) => {
  if (video) {
    video.setAttribute('data-playing', playing.toString());
  }
};
