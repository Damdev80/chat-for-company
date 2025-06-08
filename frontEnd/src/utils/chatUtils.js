// Utilidades para el chat

// Utilidad para iniciales
export function getInitials(name) {
  if (!name) return "US";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1][0] || "")).toUpperCase();
}

// Utilidad para color de avatar
export function getAvatarColor(name) {
  if (!name) return "#4ADE80"; // fallback seguro
  // Paleta de colores pastel
  const colors = [
    "#4ADE80",
    "#60A5FA",
    "#F472B6",
    "#FBBF24",
    "#34D399",
    "#818CF8",
    "#F87171",
    "#FACC15",
    "#38BDF8",
    "#A78BFA",
    "#F472B6",
    "#F59E42",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Emojis comunes para el selector
export const commonEmojis = [
  "😊",
  "👍",
  "❤️",
  "😂",
  "🎉",
  "🔥",
  "👏",
  "🙏",
  "😍",
  "🤔",
  "😢",
  "😎",
  "🚀",
  "✅",
  "⭐",
  "💯",
];

// Generar ID temporal único
export function generateTempId() {
  return `temp-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;
}

// Formatear tiempo para mensajes
export function formatMessageTime(timestamp) {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
