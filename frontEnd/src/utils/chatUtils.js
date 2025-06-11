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

// Mapeo de emojis con nombres para búsqueda
export const emojiNames = {
  // Personas y emociones
  "😀": ["feliz", "sonrisa", "contento", "happy", "smile"],
  "😃": ["alegre", "sonrisa", "happy", "joy"],
  "😄": ["risa", "alegria", "happy", "laugh"],
  "😁": ["sonrisa", "dientes", "grin"],
  "😆": ["risa", "laugh", "haha"],
  "😅": ["sudor", "nervioso", "sweat", "laugh"],
  "🤣": ["risa", "carcajada", "rofl", "laugh"],
  "😂": ["llanto", "risa", "tears", "joy", "cry", "laugh"],
  "😊": ["feliz", "sonrisa", "blush", "happy"],
  "😇": ["angel", "inocente", "halo"],
  "🥰": ["amor", "corazones", "love"],
  "😍": ["amor", "corazones", "love", "eyes"],
  "🤩": ["estrellas", "wow", "star", "struck"],
  "😘": ["beso", "kiss", "amor"],
  "😗": ["beso", "kiss"],
  "😚": ["beso", "kiss"],
  "😙": ["beso", "kiss"],
  "😋": ["rico", "sabroso", "yum", "tongue"],
  "😛": ["lengua", "tongue"],
  "😜": ["guiño", "lengua", "wink", "tongue"],
  "🤪": ["loco", "crazy", "zany"],
  "😝": ["lengua", "cerrado", "tongue", "closed"],
  "🤑": ["dinero", "money", "dollar"],
  "🤗": ["abrazo", "hug"],
  "🤭": ["ups", "oops", "hand", "mouth"],
  "🤫": ["silencio", "shh", "quiet"],
  "🤔": ["pensar", "think", "hmm"],
  "😐": ["neutral", "meh"],
  "😑": ["sin", "expresion", "expressionless"],
  "😶": ["sin", "boca", "no", "mouth"],
  "😏": ["picaro", "smirk"],
  "😒": ["aburrido", "unamused"],
  "🙄": ["ojos", "rodando", "rolling", "eyes"],
  "😬": ["incomodo", "grimacing"],
  "😔": ["triste", "sad", "pensive"],
  "😪": ["cansado", "sleepy", "tired"],
  "🤤": ["babear", "drooling"],
  "😴": ["dormir", "sleeping", "zzz"],
  "😷": ["enfermo", "mask", "sick"],
  "🤒": ["fiebre", "thermometer", "sick"],
  "🤕": ["herido", "injured", "bandage"],
  "🤢": ["nausea", "sick", "green"],
  "🤮": ["vomito", "vomit", "sick"],
  "🤧": ["estornudo", "sneeze", "tissue"],
  "🥵": ["calor", "hot", "sweat"],
  "🥶": ["frio", "cold", "frozen"],
  "😵": ["mareado", "dizzy", "dead"],
  "🤯": ["mente", "explotada", "mind", "blown"],
  "🤠": ["vaquero", "cowboy", "hat"],
  "🥳": ["fiesta", "party", "celebration"],
  "😎": ["genial", "cool", "sunglasses"],
  "🤓": ["nerd", "geek", "glasses"],
  "🧐": ["monoculo", "monocle", "fancy"],

  // Gestos y manos
  "👍": ["bien", "like", "thumbs", "up", "bueno"],
  "👎": ["mal", "dislike", "thumbs", "down", "malo"],
  "👌": ["ok", "perfecto", "perfect"],
  "🤌": ["dedos", "italian", "fingers"],
  "✌️": ["paz", "peace", "victory"],
  "🤞": ["dedos", "cruzados", "crossed", "fingers", "suerte"],
  "🤟": ["te", "amo", "love", "you"],
  "🤘": ["rock", "cuernos", "horns"],
  "🤙": ["llamame", "call", "me", "hang", "loose"],
  "👋": ["hola", "adios", "wave", "hello", "bye"],
  "👏": ["aplaudir", "clap", "applause", "bravo"],
  "🙌": ["celebrar", "praise", "hands", "up"],
  "🤲": ["palmas", "open", "hands"],
  "🤝": ["acuerdo", "handshake", "deal"],
  "🙏": ["gracias", "por", "favor", "prayer", "please", "thank", "you", "rezar"],
  "💪": ["fuerte", "strong", "muscle", "fuerza"],

  // Corazones y amor
  "❤️": ["amor", "love", "corazon", "heart", "rojo"],
  "🧡": ["naranja", "orange", "heart"],
  "💛": ["amarillo", "yellow", "heart"],
  "💚": ["verde", "green", "heart"],
  "💙": ["azul", "blue", "heart"],
  "💜": ["morado", "purple", "heart"],
  "🖤": ["negro", "black", "heart"],
  "🤍": ["blanco", "white", "heart"],
  "🤎": ["marron", "brown", "heart"],
  "💔": ["roto", "broken", "heart"],
  "❣️": ["exclamacion", "exclamation", "heart"],
  "💕": ["dos", "corazones", "two", "hearts"],
  "💞": ["girando", "revolving", "hearts"],
  "💓": ["latiendo", "beating", "heart"],
  "💗": ["creciendo", "growing", "heart"],
  "💖": ["brillante", "sparkling", "heart"],
  "💘": ["flecha", "arrow", "heart", "cupido"],
  "💝": ["regalo", "gift", "heart"],

  // Fuego y naturaleza
  "🔥": ["fuego", "fire", "hot", "lit", "genial"],
  "✨": ["brillos", "sparkles", "magic", "new"],
  "⭐": ["estrella", "star", "favorite"],
  "🌟": ["estrella", "brillante", "glowing", "star"],
  "💫": ["estrella", "fugaz", "dizzy", "star"],
  "⚡": ["rayo", "lightning", "bolt", "power"],
  "☄️": ["cometa", "comet"],
  "🌈": ["arcoiris", "rainbow"],
  "🌸": ["flor", "sakura", "cherry", "blossom"],
  "🌺": ["flor", "hibiscus", "flower"],
  "🌻": ["girasol", "sunflower"],
  "🌷": ["tulipan", "tulip"],
  "🌹": ["rosa", "rose"],
  "🍀": ["trebol", "clover", "luck", "suerte"],
  "🌿": ["hierba", "herb", "leaf"],
  "🌱": ["planta", "seedling", "growth"],

  // Comida
  "🍕": ["pizza"],
  "🍔": ["hamburguesa", "burger"],
  "🍟": ["papas", "fritas", "fries"],
  "🌭": ["hot", "dog", "perro", "caliente"],
  "🥪": ["sandwich", "bocadillo"],
  "🌮": ["taco"],
  "🌯": ["burrito", "wrap"],
  "🍎": ["manzana", "apple"],
  "🍌": ["banana", "platano"],
  "🍊": ["naranja", "orange"],
  "🍇": ["uvas", "grapes"],
  "🍓": ["fresa", "strawberry"],
  "🥝": ["kiwi"],
  "🍑": ["cereza", "cherry"],
  "🍒": ["cerezas", "cherries"],
  "🥑": ["aguacate", "avocado"],
  "🍅": ["tomate", "tomato"],
  "🥕": ["zanahoria", "carrot"],
  "🌽": ["maiz", "corn"],
  "🍄": ["hongo", "mushroom"],
  "🥔": ["papa", "potato"],
  "🍞": ["pan", "bread"],
  "🥐": ["croissant"],
  "🥖": ["baguette"],
  "🧀": ["queso", "cheese"],
  "🥚": ["huevo", "egg"],
  "🍳": ["huevo", "frito", "fried", "egg"],
  "🥓": ["tocino", "bacon"],
  "🍖": ["carne", "meat"],
  "🍗": ["pollo", "chicken"],
  "🥩": ["filete", "steak"],
  "🍰": ["pastel", "cake"],
  "🎂": ["cumpleanos", "birthday", "cake"],
  "🧁": ["cupcake", "magdalena"],
  "🍪": ["galleta", "cookie"],
  "🍫": ["chocolate"],
  "🍬": ["dulce", "candy"],
  "🍭": ["paleta", "lollipop"],
  "🍯": ["miel", "honey"],
  "🥛": ["leche", "milk"],
  "☕": ["cafe", "coffee"],
  "🍵": ["te", "tea"],
  "🥤": ["refresco", "soda", "drink"],
  "🍺": ["cerveza", "beer"],
  "🍷": ["vino", "wine"],
  "🥂": ["brindis", "cheers", "champagne"],
  "🍾": ["champagne", "celebration"],

  // Actividades y deportes
  "⚽": ["futbol", "soccer", "football"],
  "🏀": ["basquet", "basketball"],
  "🏈": ["futbol", "americano", "american", "football"],
  "⚾": ["baseball", "beisbol"],
  "🎾": ["tenis", "tennis"],
  "🏐": ["voleibol", "volleyball"],
  "🏓": ["ping", "pong", "table", "tennis"],
  "🏸": ["badminton"],
  "🥊": ["boxeo", "boxing"],
  "🥋": ["artes", "marciales", "martial", "arts"],
  "🏆": ["trofeo", "trophy", "winner", "ganador"],
  "🥇": ["oro", "gold", "medal", "first"],
  "🥈": ["plata", "silver", "medal", "second"],
  "🥉": ["bronce", "bronze", "medal", "third"],
  "🏅": ["medalla", "medal"],

  // Objetos
  "📱": ["telefono", "phone", "mobile", "celular"],
  "💻": ["laptop", "computer", "ordenador"],
  "⌨️": ["teclado", "keyboard"],
  "🖥️": ["computadora", "desktop", "computer"],
  "🖨️": ["impresora", "printer"],
  "📷": ["camara", "camera"],
  "📹": ["video", "camera"],
  "🎥": ["pelicula", "movie", "camera"],
  "📺": ["television", "tv"],
  "🎮": ["videojuego", "gaming", "controller"],
  "🕹️": ["joystick"],
  "🎲": ["dado", "dice"],
  "🧩": ["puzzle", "rompecabezas"],
  "🎯": ["diana", "target"],
  "🎪": ["circo", "circus"],
  "🎨": ["arte", "art", "palette"],
  "🎭": ["teatro", "theater", "masks"],
  "🎪": ["carpa", "tent"],
  "🎡": ["rueda", "ferris", "wheel"],
  "🎢": ["montana", "rusa", "roller", "coaster"],
  "🎠": ["carrusel", "carousel"],

  // Viajes y lugares
  "✈️": ["avion", "airplane", "plane", "fly", "volar"],
  "🚗": ["auto", "car", "coche"],
  "🚕": ["taxi"],
  "🚌": ["autobus", "bus"],
  "🚎": ["trolleybus"],
  "🚐": ["van", "minibus"],
  "🚛": ["camion", "truck"],
  "🚜": ["tractor"],
  "🏍️": ["moto", "motorcycle"],
  "🚲": ["bicicleta", "bicycle", "bike"],
  "🛴": ["scooter", "patinete"],
  "🚁": ["helicoptero", "helicopter"],
  "🚀": ["cohete", "rocket", "space"],
  "🛸": ["ovni", "ufo", "alien"],
  "🚢": ["barco", "ship"],
  "⛵": ["velero", "sailboat"],
  "🚤": ["lancha", "speedboat"],
  "🚂": ["tren", "train"],
  "🚇": ["metro", "subway"],
  "🏠": ["casa", "house", "home"],
  "🏡": ["casa", "jardin", "house", "garden"],
  "🏢": ["oficina", "office", "building"],
  "🏣": ["edificio", "building"],
  "🏤": ["oficina", "postal", "post", "office"],
  "🏥": ["hospital"],
  "🏦": ["banco", "bank"],
  "🏧": ["cajero", "atm"],
  "🏨": ["hotel"],
  "🏩": ["motel"],
  "🏪": ["tienda", "store", "convenience"],
  "🏫": ["escuela", "school"],
  "🏬": ["departamento", "department", "store"],
  "🏭": ["fabrica", "factory"],
  "🏮": ["linterna", "lantern"],
  "🏯": ["castillo", "castle"],
  "🏰": ["castillo", "europeo", "castle"],
  "🗼": ["torre", "tower"],
  "🗽": ["libertad", "liberty", "statue"],
  "⛪": ["iglesia", "church"],
  "🕌": ["mezquita", "mosque"],
  "🛕": ["templo", "temple"],
  "🕍": ["sinagoga", "synagogue"],

  // Símbolos
  "💯": ["cien", "hundred", "perfect", "perfecto"],
  "💢": ["enojo", "anger", "comic"],
  "💥": ["boom", "explosion"],
  "💫": ["mareo", "dizzy"],
  "💦": ["agua", "water", "drops"],
  "💨": ["viento", "wind", "dash"],
  "🕳️": ["agujero", "hole"],
  "💣": ["bomba", "bomb"],
  "💤": ["dormir", "sleep", "zzz"],
  "🔔": ["campana", "bell"],
  "🔕": ["silencio", "mute", "bell"],
  "📢": ["megafono", "megaphone"],
  "📣": ["megafono", "megaphone"],
  "📯": ["cuerno", "horn"],
  "🔊": ["volumen", "alto", "speaker", "loud"],
  "🔉": ["volumen", "medio", "speaker", "medium"],
  "🔈": ["volumen", "bajo", "speaker", "low"],
  "🔇": ["mudo", "mute", "speaker"],
  "🔒": ["cerrado", "locked"],
  "🔓": ["abierto", "unlocked"],
  "🔏": ["cerrado", "llave", "locked", "key"],
  "🔐": ["cerrado", "llave", "locked", "key"],
  "🔑": ["llave", "key"],
  "🗝️": ["llave", "old", "key"],
  "🔨": ["martillo", "hammer"],
  "🪓": ["hacha", "axe"],
  "⛏️": ["pico", "pickaxe"],
  "🔧": ["llave", "wrench"],
  "🔩": ["tuerca", "nut", "bolt"],
  "⚙️": ["engranaje", "gear"],
  "🗜️": ["prensa", "clamp"],
  "⚖️": ["balanza", "scale", "justice"],
  "🦯": ["baston", "cane"],
  "🔗": ["enlace", "link"],
  "⛓️": ["cadena", "chain"],
  "🪝": ["gancho", "hook"],
  "🧰": ["caja", "herramientas", "toolbox"],
  "🧲": ["iman", "magnet"],
  "🪜": ["escalera", "ladder"],

  // Tiempo
  "⏰": ["despertador", "alarm", "clock"],
  "⏲️": ["cronometro", "timer"],
  "⏱️": ["cronometro", "stopwatch"],
  "🕐": ["una", "oclock", "1"],
  "🕑": ["dos", "oclock", "2"],
  "🕒": ["tres", "oclock", "3"],
  "🕓": ["cuatro", "oclock", "4"],
  "🕔": ["cinco", "oclock", "5"],
  "🕕": ["seis", "oclock", "6"],
  "🕖": ["siete", "oclock", "7"],
  "🕗": ["ocho", "oclock", "8"],
  "🕘": ["nueve", "oclock", "9"],
  "🕙": ["diez", "oclock", "10"],
  "🕚": ["once", "oclock", "11"],
  "🕛": ["doce", "oclock", "12"],

  // Clima
  "☀️": ["sol", "sun", "sunny"],
  "🌤️": ["nublado", "partly", "cloudy"],
  "⛅": ["nublado", "partly", "cloudy"],
  "☁️": ["nube", "cloud", "cloudy"],
  "🌦️": ["lluvia", "rain", "sun"],
  "🌧️": ["lluvia", "rain"],
  "⛈️": ["tormenta", "thunder", "storm"],
  "🌩️": ["tormenta", "thunder"],
  "🌨️": ["nieve", "snow"],
  "❄️": ["copo", "nieve", "snowflake"],
  "☃️": ["muneco", "nieve", "snowman"],
  "⛄": ["muneco", "nieve", "snowman"],
  "🌪️": ["tornado"],
  "🌫️": ["niebla", "fog"],
  "🌊": ["ola", "wave", "ocean"]
};

// Emojis organizados por categorías
export const emojiCategories = {
  frecuentes: {
    name: "Frecuentes",
    icon: "⭐",
    emojis: ["😊", "👍", "❤️", "😂", "🎉", "🔥", "👏", "🙏"]
  },
  personas: {
    name: "Personas",
    icon: "😊", 
    emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "☺️", "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "🥸", "😎", "🤓", "🧐"]
  },
  gestos: {
    name: "Gestos",
    icon: "👍",
    emojis: ["👍", "👎", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👋", "🤚", "🖐", "✋", "🖖", "👏", "🙌", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "🧠", "🫀", "🫁", "🦷", "🦴", "👀", "👁", "👅", "👄"]
  },
  actividades: {
    name: "Actividades", 
    icon: "⚽",
    emojis: ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛷", "⛸️", "🥌", "🎿", "⛷️", "🏂", "🪂", "🏋️‍♀️", "🏋️", "🤼‍♀️", "🤼", "🤸‍♀️", "🤸", "⛹️‍♀️", "⛹️", "🤺", "🤾‍♀️", "🤾", "🏌️‍♀️", "🏌️", "🧘‍♀️", "🧘", "🏄‍♀️", "🏄", "🏊‍♀️", "🏊", "🤽‍♀️", "🤽"]
  },
  objetos: {
    name: "Objetos",
    icon: "📱",
    emojis: ["📱", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "💽", "💾", "💿", "📀", "🧮", "🎥", "🎞️", "📹", "📷", "📸", "📻", "🎙️", "🎚️", "🎛️", "🧭", "⏱️", "⏲️", "⏰", "🕰️", "⌛", "⏳", "📡", "🔋", "🔌", "💡", "🔦", "🕯️", "🪔", "🧯", "🛢️", "💸", "💵", "💴", "💶", "💷", "🪙", "💰", "💳", "💎", "⚖️", "🪜", "🧰", "🔧", "🔨", "⚒️", "🛠️", "⛏️", "🪓", "🪚", "🔩", "⚙️", "🪤", "🧲"]
  },
  naturaleza: {
    name: "Naturaleza",
    icon: "🌱",
    emojis: ["🌱", "🌿", "☘️", "🍀", "🎋", "🍃", "🌾", "🌵", "🌲", "🌳", "🌴", "🪵", "🌸", "🌺", "🌻", "🌷", "🌹", "🥀", "🌼", "🌈", "🌍", "🌎", "🌏", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌙", "🌛", "🌜", "☀️", "🌝", "🌞", "⭐", "🌟", "💫", "✨", "☄️", "☁️", "⛅", "⛈️", "🌤️", "🌦️", "🌧️", "🌩️", "🌨️", "❄️", "☃️", "⛄", "🌪️", "🌊", "💧", "💦", "🫧"]
  },
  comida: {
    name: "Comida",
    icon: "🍕",
    emojis: ["🍇", "🍈", "🍉", "🍊", "🍋", "🍌", "🍍", "🥭", "🍎", "🍏", "🍐", "🍑", "🍒", "🍓", "🫐", "🥝", "🍅", "🫒", "🥥", "🥑", "🍆", "🥔", "🥕", "🌽", "🌶️", "🫑", "🥒", "🥬", "🥦", "🧄", "🧅", "🍄", "🥜", "🌰", "🍞", "🥐", "🥖", "🫓", "🥨", "🥯", "🥞", "🧇", "🧀", "🍖", "🍗", "🥩", "🥓", "🍔", "🍟", "🍕", "🌭", "🥪", "🌮", "🌯", "🫔", "🥙", "🧆", "🥚", "🍳", "🥘", "🍲", "🫕", "🥗", "🍿", "🧈", "🧂", "🥫"]
  },
  viajes: {
    name: "Viajes",
    icon: "✈️",
    emojis: ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🏍️", "🛵", "🚲", "🛴", "🛹", "🛼", "🚁", "🛸", "✈️", "🛩️", "🛫", "🛬", "🪂", "💺", "🚀", "🛰️", "🚢", "⛵", "🚤", "🛥️", "🛳️", "⛴️", "🚂", "🚃", "🚄", "🚅", "🚆", "🚇", "🚈", "🚉", "🚊", "🚝", "🚞", "🚋", "🚌", "🚍", "🎡", "🎢", "🎠", "⛲", "⛱️", "🏖️", "🏝️", "🏜️", "🌋", "⛰️", "🏔️", "🗻", "🏕️", "⛺", "🛖", "🏠", "🏡"]
  },
  simbolos: {
    name: "Símbolos",
    icon: "❤️",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️", "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐", "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓", "🆔", "⚛️", "🉑", "☢️", "☣️", "📴", "📳", "🈶", "🈚", "🈸", "🈺", "🈷️", "✴️", "🆚", "💮", "🉐", "㊙️", "㊗️", "🈴", "🈵", "🈹", "🈲", "🅰️", "🅱️", "🆎", "🆑", "🅾️", "🆘"]
  }
};

// Emojis comunes para retrocompatibilidad
export const commonEmojis = emojiCategories.frecuentes.emojis.concat(
  emojiCategories.personas.emojis.slice(0, 8)
);

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
