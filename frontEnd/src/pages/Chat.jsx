"use client"

import { useState, useEffect, useRef } from "react"
import {
  Search,
  Menu,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  Users,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Check,
  Plus,
  X,
  Info,
  MessageSquare,
  UserPlus,
  ArrowLeft,
  ImageIcon,
  Mic,
  Trash2,
  Edit2,
  User,
} from "lucide-react"
import "../../styles/index.css"
import { fetchMessages, fetchGroups, createGroup, updateGroup, deleteGroup, fetchUsers, deleteGroupMessages } from "../utils/api"
import { connectSocket, disconnectSocket } from "../utils/socket"

// Utilidad para iniciales
function getInitials(name) {
  if (!name) return "US"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + (parts[1][0] || "")).toUpperCase()
}

// Utilidad para color de avatar
function getAvatarColor(name) {
  if (!name) return '#4ADE80'; // fallback seguro
  // Paleta de colores pastel
  const colors = [
    '#4ADE80', '#60A5FA', '#F472B6', '#FBBF24', '#34D399', '#818CF8', '#F87171', '#FACC15', '#38BDF8', '#A78BFA', '#F472B6', '#F59E42'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function Chat() {
  // Estado para mensajes
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  // Estado para pestaña activa (chats/contactos)
  const [activeTab, setActiveTab] = useState("chats")
  // Estado para búsqueda
  const [search, setSearch] = useState("")
  // Estado para mostrar/ocultar menú de usuario
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  // Estado para mostrar/ocultar menú lateral en móvil
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // Estado para mostrar modal de crear grupo
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [groupName, setGroupName] = useState("")
  // Estado para grupos persistentes
  const [groups, setGroups] = useState([])
  const [activeGroup, setActiveGroup] = useState("global")
  // Estado para mostrar información del grupo
  const [showGroupInfo, setShowGroupInfo] = useState(false)
  // Estado para mostrar opciones de mensaje
  const [messageOptions, setMessageOptions] = useState(null)
  // Estado para mostrar emojis
  const [showEmojis, setShowEmojis] = useState(false)
  // Estado para mostrar opciones de adjuntos
  const [showAttachOptions, setShowAttachOptions] = useState(false)
  // Estado para indicar escritura
  const [isTyping, setIsTyping] = useState(false)
  // Estado para mostrar notificaciones
  const [notification, setNotification] = useState(null)
  // Estado para usuarios
  const [users, setUsers] = useState([])

  // Obtener datos reales del usuario
  const token = localStorage.getItem("token")
  const user = localStorage.getItem("username") || ""
  const userRole = localStorage.getItem("userRole") || "user" // Leer rol del usuario
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Cargar mensajes reales desde el backend
  useEffect(() => {
    fetchMessages(token)
      .then((msgs) => {
        // Ordenar mensajes por fecha ascendente (más viejos primero)
        const ordered = [...msgs].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        setMessages(
          ordered.map((msg) => ({
            id: msg.id,
            content: msg.content,
            isMine: msg.sender_name === user, // Compara con el usuario real
            sender_name: msg.sender_name,
            group_id: msg.group_id || "global",
            time: msg.created_at
              ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "",
          })),
        )
      })
      .catch(() => {})
  }, [token, user])

  // Cargar grupos desde la API
  useEffect(() => {
    if (!token) return
    fetchGroups(token)
      .then((data) => {
        const globalGroup = { id: "global", name: "Global" }
        setGroups([globalGroup, ...data.filter((g) => g.id !== "global")])
      })
      .catch(() => setGroups([{ id: "global", name: "Global" }]))
  }, [token])

  // Forzar a 'global' si el grupo activo ya no existe
  useEffect(() => {
    if (activeGroup !== "global" && !groups.find((g) => g.id === activeGroup)) {
      setActiveGroup("global")
    }
  }, [groups, activeGroup])

  // Cargar usuarios desde la API
  useEffect(() => {
    if (!token) return
    fetchUsers(token)
      .then(setUsers)
      .catch(() => setUsers([]))
  }, [token]);  // Conexión a Socket.io y eventos
  useEffect(() => {
    if (!token) return;
    // Inicializar socket
    const socket = connectSocket(token);
    socketRef.current = socket;
    if (!socket) {
      showNotification("Error de conexión", "No se pudo conectar al servidor de chat");
      return;
    }
    // Unirse al grupo activo
    socket.emit("join_group", activeGroup);
    // Recibir mensajes
    socket.on("receive_message", (msg) => {
      setMessages((prev) => {
        // Verificar si es un mensaje propio que ya hemos agregado a la UI de forma optimista
        // Lo identificamos por su temp_id (si existe) o por el contenido y el nombre del remitente
        const isMyOptimisticMessage = 
          // Verificar por temp_id (mejor método)
          (msg.temp_id && prev.some(m => m.id === msg.temp_id)) || 
          // Verificar por coincidencia de contenido y remitente (método de respaldo)
          (msg.sender_name === user && 
           prev.some(m => m.content === msg.content && 
                        m.sender_name === msg.sender_name && 
                        m.isOptimistic));

        if (isMyOptimisticMessage) {
          // Reemplazar el mensaje optimista con el mensaje oficial del servidor
          return prev.map(m => {
            // Si encontramos un mensaje optimista que coincide por temp_id
            if (msg.temp_id && m.id === msg.temp_id) {
              return {
                ...m,
                id: msg.id, // Reemplazar con el ID real de la base de datos
                isOptimistic: false // Ya no es optimista
              };
            }
            // Si encontramos por contenido y remitente (método de respaldo)
            else if (m.isOptimistic && m.content === msg.content && m.sender_name === msg.sender_name) {
              return {
                ...m,
                id: msg.id, // Reemplazar con el ID real de la base de datos
                isOptimistic: false // Ya no es optimista
              };
            }
            return m;
          });
        }

        // Si no es un mensaje optimista propio, agrégalo normalmente
        // Evitar duplicados por id
        if (prev.some((m) => m.id === msg.id)) return prev;
        
        return [
          ...prev,
          {
            id: msg.id || Date.now(),
            content: msg.content,
            isMine: msg.sender_name === user,
            sender_name: msg.sender_name,
            group_id: msg.group_id || "global",
            time: msg.created_at
              ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "",
          },
        ];
      });
      
      // Notificación si es de otro grupo
      if (msg.sender_name !== user && msg.group_id !== activeGroup) {
        showNotification(`Nuevo mensaje de ${msg.sender_name}`, msg.content);
      }
    })

    // Manejar errores de mensajes
    socket.on("message_error", (errorData) => {
      // Marcar el mensaje como fallido por su temp_id
      setMessages((prev) => 
        prev.map(m => 
          (errorData.temp_id && m.id === errorData.temp_id) 
            ? { ...m, error: true, isOptimistic: false } 
            : m
        )
      );
      
      // Mostrar notificación de error
      showNotification("Error", "No se pudo enviar el mensaje. Intenta nuevamente.");
    });

    // Evento de usuario escribiendo
    socket.on("user_typing", (data) => {
      if (data.sender_name !== user && data.group_id === activeGroup) {
        setIsTyping(true)
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false)
        }, 3000)
      }
    });

    // Cleanup socket connection on unmount or deps change
    return () => {
      disconnectSocket(socket);
      socketRef.current = null;
    };
  }, [token, user, activeGroup])

  // Unirse a room al cambiar de grupo
  useEffect(() => {
    if (socketRef.current && activeGroup) {
      socketRef.current.emit("join_group", activeGroup)
    }
    // Ya no borramos mensajes ni recargamos todos los mensajes aquí
  }, [activeGroup])

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Manejar envío de mensaje
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    try {
    // Crear un ID temporal único para el mensaje optimista
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      
      // Enviar por socket incluyendo el ID temporal
      socketRef.current.emit("send_message", { 
        content: newMessage, 
        sender_name: user, 
        group_id: activeGroup,
        temp_id: tempId // Enviar ID temporal al servidor
      })
      
      // Reflejar el mensaje instantáneamente en UI (optimista)
      setMessages((prev) => [
        ...prev,
        {
          id: tempId, // Usar ID temporal
          content: newMessage,
          isMine: true,
          sender_name: user,
          group_id: activeGroup,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isOptimistic: true // Marcar como mensaje optimista
        }
      ])
      setNewMessage("")
    } catch {
      // Puedes mostrar un error si lo deseas
    }  }
    // Función para reintentar mensajes fallidos
  const handleRetryMessage = (failedMessage) => {
    // Crear un nuevo ID temporal
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Enviar nuevamente el mensaje
    socketRef.current.emit("send_message", { 
      content: failedMessage.content, 
      sender_name: user, 
      group_id: failedMessage.group_id || activeGroup,
      temp_id: tempId 
    });
    
    // Actualizar el mensaje existente a estado "enviando"
    setMessages(prev => prev.map(m => 
      m.id === failedMessage.id 
        ? {
            ...m,
            id: tempId,
            isOptimistic: true,
            error: false
          }
        : m
    ));
    
    // Mostrar notificación
    showNotification("Reintentando", "Enviando mensaje nuevamente...");
  }

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    window.location.href = "/login"
  }

  // Función para cambiar pestaña
  const handleTabChange = (tab) => setActiveTab(tab)

  // Función para búsqueda
  const handleSearchChange = (e) => setSearch(e.target.value)

  // Función para menú de usuario
  const toggleUserMenu = () => setUserMenuOpen((prev) => !prev)

  // Función para menú lateral móvil
  const toggleSidebar = () => setSidebarOpen((prev) => !prev)

  // Función para llamada de voz (placeholder)
  const handleCall = () => alert("Funcionalidad de llamada próximamente")

  // Función para videollamada (placeholder)
  const handleVideoCall = () => alert("Funcionalidad de videollamada próximamente")

  // Función para adjuntar archivo (placeholder)
  const handleAttach = () => setShowAttachOptions((prev) => !prev)

  // Función para emojis (placeholder)
  const handleEmoji = () => setShowEmojis((prev) => !prev)

  // Función para notificaciones
  const showNotification = (title, message) => {
    setNotification({ title, message })
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  // Función para manejar escritura
  const handleTyping = () => {
    socketRef.current?.emit("user_typing", { sender_name: user, group_id: activeGroup })
  }

  // Filtrado de mensajes por búsqueda y grupo
  const filteredMessages = search.trim()
    ? messages.filter(
        (msg) =>
          msg.group_id === activeGroup &&
          (msg.content.toLowerCase().includes(search.toLowerCase()) ||
            (msg.sender_name && msg.sender_name.toLowerCase().includes(search.toLowerCase()))),
      )
    : messages.filter((msg) => msg.group_id === activeGroup)

  // Crear grupo persistente (solo para admin)
  const handleCreateGroup = async (e) => {
    e.preventDefault()
    if (userRole !== "admin" || !groupName.trim()) return // Verificar rol
    try {
      const newGroup = await createGroup(groupName, token)
      setGroups((prev) => [...prev, newGroup])
      setGroupName("")
      setShowGroupModal(false)
      showNotification("Grupo creado", `El grupo "${groupName}" ha sido creado exitosamente`)
    } catch {
      // feedback de error opcional
    }
  }

  // Editar grupo (solo para admin)
  const handleEditGroup = async (id, newName) => {
    if (userRole !== "admin") return; // Verificar rol
    try {
      const updated = await updateGroup(id, newName, token)
      setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, name: updated.name } : g)))
      showNotification("Grupo actualizado", `El grupo ha sido renombrado a "${newName}"`)
    } catch {
      // feedback opcional
    }
  }

  // Eliminar grupo (solo para admin)
  const handleDeleteGroup = async (id) => {
    if (userRole !== "admin") return; // Verificar rol
    try {
      await deleteGroup(id, token)
      setGroups((prev) => prev.filter((g) => g.id !== id))
      if (activeGroup === id) setActiveGroup("global")
      showNotification("Grupo eliminado", "El grupo ha sido eliminado exitosamente")
    } catch {
      // feedback opcional
    }
  }

  // Vaciar mensajes del grupo (solo admin)
  const handleDeleteGroupMessages = async () => {
    if (userRole !== 'admin') return;
    const groupNameToDelete = groups.find((g) => g.id === activeGroup)?.name;
    if (!window.confirm(`¿Eliminar todos los mensajes de "${groupNameToDelete}"?`)) return;
    try {
      await deleteGroupMessages(activeGroup, token);
      setMessages((prev) => prev.filter((m) => m.group_id !== activeGroup));
      showNotification('Mensajes borrados', `Se eliminaron todos los mensajes de "${groupNameToDelete}"`);
    } catch {
      showNotification('Error', 'No se pudieron borrar los mensajes');
    }
  }

  // Obtener emojis comunes
  const commonEmojis = ["😊", "👍", "❤️", "😂", "🎉", "🔥", "👏", "🙏", "😍", "🤔", "😢", "😎", "🚀", "✅", "⭐", "💯"]

  // Cambiar grupo (handler robusto)
  const handleGroupClick = (groupId) => {
    if (groupId !== activeGroup) {
      setActiveGroup(groupId)
      setShowGroupInfo(false) // Cierra el panel de info si está abierto
      setMessageOptions(null) // Limpia opciones de mensaje
      setSearch("") // Limpia búsqueda
      setShowEmojis(false)
      setShowAttachOptions(false)
    }
  }


  return (
    <div className="min-h-screen bg-[#1E1E2E] text-white flex flex-col">
      {/* Fondo con gradiente */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#1E1E2E]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#3C3C4E] to-[#1E1E2E] opacity-10"></div>
      </div>

      {/* Notificación */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg shadow-lg p-4 max-w-xs animate-slideInRight">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-[#4ADE80] rounded-full p-2">
              <MessageSquare size={16} className="text-black" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-[#4ADE80]">{notification.title}</p>
              <p className="mt-1 text-sm text-[#A0A0B0] line-clamp-2">{notification.message}</p>
            </div>
            <button className="ml-4 text-[#A0A0B0] hover:text-white" onClick={() => setNotification(null)}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Barra superior */}
        <header className="bg-[#2D2D3A] border-b border-[#3C3C4E] p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="md:hidden mr-4 text-[#A0A0B0] hover:text-white transition-colors"
              onClick={toggleSidebar}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-bold text-[#4ADE80]">ChatEmpresa</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="text-[#A0A0B0] hover:text-white transition-colors relative"
              onClick={() => alert("Notificaciones próximamente")}
            >
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-[#4ADE80] text-black text-xs rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </button>
            <button
              className="text-[#A0A0B0] hover:text-white transition-colors"
              onClick={() => alert("Configuración próximamente")}
            >
              <Settings size={20} />
            </button>
            <div className="relative">
              <div className="flex items-center cursor-pointer" onClick={toggleUserMenu}>
                <div
                  className="w-8 h-8 rounded-full bg-[#42DE80] flex items-center justify-center text-black font-medium"
                  style={{ backgroundColor: getAvatarColor(user) }}
                >
                  {getInitials(user)}
                </div>
                {userRole === 'admin' && (
                  <span className="ml-1 bg-red-500 text-white text-xs px-1 rounded">Admin</span>
                )}
                <ChevronDown size={16} className="ml-1 text-[#A0A0B0]" />
              </div>
              {/* Menú de usuario */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg shadow-lg z-50 animate-fadeIn">
                  <div className="p-3 border-b border-[#3C3C4E]">
                    <div className="flex items-center">
                      <div
                        className="w-10 h-10 rounded-full bg-[#4ADE80] flex items-center justify-center text-black font-medium"
                        style={{ backgroundColor: getAvatarColor(user) }}
                      >
                        {getInitials(user)}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">{user}</p>
                        <p className="text-xs text-[#A0A0B0]">En línea</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 hover:bg-[#3C3C4E] text-[#A0A0B0] flex items-center">
                      <User size={16} className="mr-2" />
                      <span>Mi perfil</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-[#3C3C4E] text-[#A0A0B0] flex items-center">
                      <Settings size={16} className="mr-2" />
                      <span>Configuración</span>
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-[#3C3C4E] text-[#A0A0B0] flex items-center"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} className="mr-2" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Área principal */}
        <div className="flex-1 flex overflow-hidden">
          {/* Barra lateral (versión móvil) */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={toggleSidebar}>
              <aside
                className="w-64 h-full bg-[#2D2D3A] border-r border-[#3C3C4E] flex flex-col animate-slideInLeft"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Contenido de la barra lateral móvil */}
                <div className="p-4 flex justify-between items-center border-b border-[#3C3C4E]">
                  <h2 className="font-bold text-[#4ADE80]">ChatEmpresa</h2>
                  <button className="text-[#A0A0B0] hover:text-white" onClick={toggleSidebar}>
                    <X size={20} />
                  </button>
                </div>

                {/* Búsqueda */}
                <div className="p-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar..."
                      className="w-full bg-[#1E1E2E] border border-[#3C3C4E] rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#4ADE80] transition-all"
                      value={search}
                      onChange={handleSearchChange}
                    />
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A0B0]" />
                  </div>
                </div>

                {/* Pestañas */}
                <div className="flex border-b border-[#3C3C4E]">
                  <button
                    className={`flex-1 py-3 ${
                      activeTab === "chats"
                        ? "text-[#4ADE80] border-b-2 border-[#4ADE80]"
                        : "text-[#A0A0B0] hover:text-white"
                    } font-medium text-sm`}
                    onClick={() => handleTabChange("chats")}
                  >
                    Chats
                  </button>
                  <button
                    className={`flex-1 py-3 ${
                      activeTab === "contacts"
                        ? "text-[#4ADE80] border-b-2 border-[#4ADE80]"
                        : "text-[#A0A0B0] hover:text-white"
                    } font-medium text-sm`}
                    onClick={() => handleTabChange("contacts")}
                  >
                    Contactos
                  </button>
                </div>

                {/* Lista de grupos */}
                <div className="p-4 border-b border-[#3C3C4E] overflow-y-auto flex-grow">
                  <h2 className="text-xs font-semibold text-[#A0A0B0] uppercase tracking-wider mb-3 flex justify-between items-center">
                    Grupos
                    {userRole === "admin" && ( // Mostrar solo si es admin
                      <button
                        onClick={() => setShowGroupModal(true)}
                        className="ml-2 text-[#4ADE80] hover:text-white text-xs flex items-center"
                      >
                        <Plus size={14} className="mr-1" /> Crear
                      </button>
                    )}
                  </h2>
                  <ul className="space-y-2">
                    {groups.map((group) => (
                      <li key={group.id} className="group flex items-center">
                        <button
                          className={`w-full flex items-center py-2 px-3 rounded-lg text-left transition-all ${
                            group.id === activeGroup
                              ? "bg-[#4ADE80] bg-opacity-10 text-[#4ADE80]"
                              : "hover:bg-[#3C3C4E] text-[#A0A0B0] hover:text-white"
                          }`}
                          onClick={() => handleGroupClick(group.id)}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${
                              group.id === activeGroup ? "bg-[#4ADE80] text-black" : "bg-[#3C3E4E] text-white"
                            }`}
                          >
                            <Users size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{group.name}</p>
                            <p className="text-xs text-[#A0A0B0] truncate">
                              {group.id === "global" ? "Chat general" : "Grupo de trabajo"}
                            </p>
                          </div>
                        </button>
                        {userRole === "admin" && group.id !== "global" && (
                          <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              className="text-xs text-[#A0A0B0] hover:text-[#4ADE80] p-1 rounded-full hover:bg-[#3C3C4E]"
                              title="Editar grupo"
                              onClick={() => {
                                const newName = prompt("Nuevo nombre del grupo", group.name)
                                if (newName && newName.trim() && newName !== group.name)
                                  handleEditGroup(group.id, newName.trim())
                              }}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="text-xs text-[#A0A0B0] hover:text-red-400 p-1 rounded-full hover:bg-[#3C3C4E]"
                              title="Eliminar grupo"
                              onClick={() => {
                                if (window.confirm(`¿Eliminar grupo "${group.name}"?`)) handleDeleteGroup(group.id)
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>

                  {/* Usuarios (cuando la pestaña está activa) */}
                  {activeTab === "contacts" && (
                    <div className="mt-6">
                      <h2 className="text-xs font-semibold text-[#A0A0B0] uppercase tracking-wider mb-3 flex justify-between items-center">
                        Usuarios
                      </h2>
                      <ul className="space-y-2">
                        {users.length === 0 ? (
                          <li className="text-[#A0A0B0] text-sm">No hay usuarios</li>
                        ) : (
                          users.map((u) => (
                            <li key={u.id} className="group">
                              <div className="w-full flex items-center py-2 px-3 rounded-lg text-left hover:bg-[#3C3C4E] text-[#A0A0B0] hover:text-white transition-all">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0 text-black"
                                  style={{ backgroundColor: getAvatarColor(u.username) }}
                                >
                                  {getInitials(u.username)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-white truncate">{u.username}</p>
                                  <p className="text-xs text-[#A0A0B0] truncate">{u.username === user ? "En línea" : "Desconocido"}</p>
                                </div>
                              </div>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Pie de la barra lateral */}
                <div className="p-4 mt-auto border-t border-[#3C3C4E] flex flex-col gap-2">
                  {userRole === "admin" && (
                    <button
                      className="w-full flex items-center py-2 px-3 rounded-lg text-[#4ADE80] hover:text-white hover:bg-[#3C3C4E] transition-all font-semibold"
                      onClick={() => {
                        setShowGroupModal(true)
                        toggleSidebar()
                      }}
                    >
                      <Users size={16} className="mr-2" />
                      <span>Crear grupo</span>
                    </button>
                  )}
                  <button
                    className="w-full flex items-center py-2 px-3 rounded-lg text-[#A0A0B0] hover:text-white hover:bg-[#3C3C4E] transition-all"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} className="mr-2" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </aside>
            </div>
          )}

          {/* Barra lateral (escritorio) */}
          <aside className="w-64 bg-[#2D2D3A] border-r border-[#3C3C4E] flex-col hidden md:flex animate-fadeInLeft">
            {/* Búsqueda */}
            <div className="p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full bg-[#1E1E2E] border border-[#3C3C4E] rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#4ADE80] transition-all"
                  value={search}
                  onChange={handleSearchChange}
                />
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A0B0]" />
                {search && (
                  <button
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A0A0B0] hover:text-white"
                    onClick={() => setSearch("")}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Pestañas */}
            <div className="flex border-b border-[#3C3C4E]">
              <button
                className={`flex-1 py-3 ${
                  activeTab === "chats"
                    ? "text-[#4ADE80] border-b-2 border-[#4ADE80]"
                    : "text-[#A0A0B0] hover:text-white"
                } font-medium text-sm transition-all`}
                onClick={() => handleTabChange("chats")}
              >
                <div className="flex items-center justify-center">
                  <MessageSquare size={16} className="mr-2" />
                  <span>Chats</span>
                </div>
              </button>
              <button
                className={`flex-1 py-3 ${
                  activeTab === "contacts"
                    ? "text-[#4ADE80] border-b-2 border-[#4ADE80]"
                    : "text-[#A0A0B0] hover:text-white"
                } font-medium text-sm transition-all`}
                onClick={() => handleTabChange("contacts")}
              >
                <div className="flex items-center justify-center">
                  <Users size={16} className="mr-2" />
                  <span>Contactos</span>
                </div>
              </button>
            </div>

            {/* Lista de grupos */}
            <div className="p-4 border-b border-[#3C3C4E] overflow-y-auto flex-grow">
              <h2 className="text-xs font-semibold text-[#A0A0B0] uppercase tracking-wider mb-3 flex justify-between items-center">
                Grupos
                {userRole === "admin" && ( // Mostrar solo si es admin
                  <button
                    onClick={() => setShowGroupModal(true)}
                    className="ml-2 text-[#4ADE80] hover:text-white text-xs flex items-center"
                  >
                    <Plus size={14} className="mr-1" /> Crear
                  </button>
                )}
              </h2>
              <ul className="space-y-2">
                {groups.map((group) => (
                  <li key={group.id} className="group">
                    <div className="flex items-center">
                      <button
                        className={`flex-1 flex items-center py-2 px-3 rounded-lg text-left transition-all ${
                          group.id === activeGroup
                            ? "bg-[#4ADE80] bg-opacity-10 text-[#4ADE80]"
                            : "hover:bg-[#3C3C4E] text-[#A0A0B0] hover:text-white"
                        }`}
                        onClick={() => handleGroupClick(group.id)}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${
                            group.id === activeGroup ? "bg-[#4ADE80] text-black" : "bg-[#3C3E4E] text-white"
                          }`}
                        >
                          <Users size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{group.name}</p>
                          <p className="text-xs text-[#A0A0B0] truncate">
                            {group.id === "global" ? "Chat general" : "Grupo de trabajo"}
                          </p>
                        </div>
                      </button>
                      {userRole === "admin" && group.id !== "global" && (
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Evitar que se seleccione el grupo
                              const newName = prompt("Nuevo nombre para el grupo:", group.name);
                              if (newName && newName.trim() !== group.name) {
                                handleEditGroup(group.id, newName.trim());
                              }
                            }}
                            className={`p-1 rounded hover:bg-opacity-20 ${activeGroup === group.id ? 'hover:bg-black/20 text-black/80' : 'hover:bg-white/10 text-gray-400'}`}
                            title="Editar nombre del grupo"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Evitar que se seleccione el grupo
                              if (window.confirm(`¿Seguro que quieres eliminar el grupo "${group.name}"?`)) {
                                handleDeleteGroup(group.id);
                              }
                            }}
                            className={`p-1 rounded hover:bg-opacity-20 ${activeGroup === group.id ? 'hover:bg-black/20 text-black/80' : 'hover:bg-red-500/20 text-red-400'}`}
                            title="Eliminar grupo"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Usuarios (cuando la pestaña está activa) */}
              {activeTab === "contacts" && (
                <div className="mt-6">
                  <h2 className="text-xs font-semibold text-[#A0A0B0] uppercase tracking-wider mb-3 flex justify-between items-center">
                    Usuarios
                  </h2>
                  <ul className="space-y-2">
                    {users.length === 0 ? (
                      <li className="text-[#A0A0B0] text-sm">No hay usuarios</li>
                    ) : (
                      users.map((u) => (
                        <li key={u.id} className="group">
                          <div className="w-full flex items-center py-2 px-3 rounded-lg text-left hover:bg-[#3C3C4E] text-[#A0A0B0] hover:text-white transition-all">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0 text-black"
                              style={{ backgroundColor: getAvatarColor(u.username) }}
                            >
                              {getInitials(u.username)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white truncate">{u.username}</p>
                              <p className="text-xs text-[#A0A0B0] truncate">{u.username === user ? "En línea" : "Desconocido"}</p>
                            </div>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Pie de la barra lateral */}
            <div className="p-4 border-t border-[#3C3C4E] flex flex-col gap-2">
              {userRole === "admin" && (
                <button
                  className="w-full flex items-center py-2 px-3 rounded-lg text-[#4ADE80] hover:text-white hover:bg-[#3C3C4E] transition-all font-semibold"
                  onClick={() => {
                    setShowGroupModal(true)
                    toggleSidebar()
                  }}
                >
                  <Users size={16} className="mr-2" />
                  <span>Crear grupo</span>
                </button>
              )}
              <button
                className="w-full flex items-center py-2 px-3 rounded-lg text-[#A0A0B0] hover:text-white hover:bg-[#3C3C4E] transition-all"
                onClick={handleLogout}
              >
                <LogOut size={16} className="mr-2" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </aside>

          {/* Área de chat */}
          <main className="flex-1 flex flex-col bg-[#1E1E2E] animate-fadeIn relative">
            {/* Panel de información del grupo (condicional) */}
            {showGroupInfo && (
              <div className="absolute inset-0 bg-[#1E1E2E] z-20 flex flex-col animate-fadeIn">
                <div className="bg-[#2D2D3A] border-b border-[#3C3C4E] p-4 flex items-center">
                  <button
                    className="mr-2 text-[#A0A0B0] hover:text-white transition-colors"
                    onClick={() => setShowGroupInfo(false)}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h2 className="text-lg font-bold text-[#4ADE80]">Información del grupo</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-[#4ADE80] flex items-center justify-center text-black text-2xl mb-3">
                      <Users size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {groups.find((g) => g.id === activeGroup)?.name || "Global"}
                    </h3>
                    <p className="text-[#A0A0B0] text-sm">Creado el 10 de mayo de 2023</p>
                  </div>

                  <div className="bg-[#2D2D3A] rounded-lg p-4 mb-4">
                    <h4 className="text-[#4ADE80] font-medium mb-2 flex items-center">
                      <Info size={16} className="mr-2" /> Descripción
                    </h4>
                    <p className="text-[#A0A0B0] text-sm">
                      {activeGroup === "global"
                        ? "Chat general para todos los miembros de la empresa."
                        : "Grupo de trabajo para colaboración en proyectos."}
                    </p>
                  </div>

                  <div className="bg-[#2D2D3A] rounded-lg p-4">
                    <h4 className="text-[#4ADE80] font-medium mb-2 flex items-center">
                      <Users size={16} className="mr-2" /> Miembros (3)
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center mr-2 text-black"
                            style={{ backgroundColor: getAvatarColor(user) }}
                          >
                            {getInitials(user)}
                          </div>
                          <div>
                            <p className="text-white">{user}</p>
                            <p className="text-xs text-[#A0A0B0]">Tú • Administrador</p>
                          </div>
                        </div>
                      </li>
                      <li className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center mr-2 text-black"
                            style={{ backgroundColor: getAvatarColor("Ana Martínez") }}
                          >
                            {getInitials("Ana Martínez")}
                          </div>
                          <div>
                            <p className="text-white">Ana Martínez</p>
                            <p className="text-xs text-[#A0A0B0]">En línea</p>
                          </div>
                        </div>
                      </li>
                      <li className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center mr-2 text-black"
                            style={{ backgroundColor: getAvatarColor("Carlos López") }}
                          >
                            {getInitials("Carlos López")}
                          </div>
                          <div>
                            <p className="text-white">Carlos López</p>
                            <p className="text-xs text-[#A0A0B0]">Hace 5 minutos</p>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
                {activeGroup !== "global" && (
                  <div className="p-4 border-t border-[#3C3C4E]">
                    <button
                      className="w-full py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                      onClick={() => {
                        if (window.confirm(`¿Eliminar grupo "${groups.find((g) => g.id === activeGroup)?.name}"?`)) {
                          handleDeleteGroup(activeGroup)
                          setShowGroupInfo(false)
                        }                      }}
                    >
                      Eliminar grupo
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cabecera del chat */}
            <div className="bg-[#2D2D3A] border-b border-[#3C3C4E] p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className="w-10 h-10 rounded-full bg-[#4ADE80] flex items-center justify-center text-black font-medium mr-3"
                  style={{ backgroundColor: getAvatarColor(groups.find((g) => g.id === activeGroup)?.name) }}
                >
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-white">{groups.find((g) => g.id === activeGroup)?.name || "Global"}</h2>
                  <p className="text-xs text-[#A0A0B0]">
                    {activeGroup === "global" ? "Chat general" : "3 miembros • 2 en línea"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  className="text-[#A0A0B0] hover:text-white transition-colors p-2 rounded-full hover:bg-[#3C3C4E]"
                  onClick={handleCall}
                  title="Llamada de voz"
                >
                  <Phone size={18} />
                </button>
                <button
                  className="text-[#A0A0B0] hover:text-white transition-colors p-2 rounded-full hover:bg-[#3C3C4E]"
                  onClick={handleVideoCall}
                  title="Videollamada"
                >
                  <Video size={18} />
                </button>
                <button
                  className="text-[#A0A0B0] hover:text-white transition-colors p-2 rounded-full hover:bg-[#3C3C4E]"
                  onClick={() => setShowGroupInfo(true)}
                  title="Información del grupo"
                >
                  <Info size={18} />
                </button>
                {userRole === 'admin' && (
                <button
                  className="text-red-400 hover:text-red-500 transition-colors p-2 rounded-full"
                  onClick={handleDeleteGroupMessages}
                  title="Borrar mensajes del chat"
                >
                  <Trash2 size={18} />
                </button>
               )}
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-[#3C3C4E] flex items-center justify-center mb-4">
                    <MessageSquare size={24} className="text-[#4ADE80]" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No hay mensajes</h3>
                  <p className="text-[#A0A0B0] max-w-md">
                    {search
                      ? "No se encontraron mensajes con tu búsqueda. Intenta con otros términos."
                      : "Sé el primero en enviar un mensaje en este grupo."}
                  </p>
                </div>
              ) : (
                <>
                  {/* Fecha de los mensajes */}
                  <div className="flex justify-center">
                    <div className="bg-[#2D2D3A] text-[#A0A0B0] text-xs px-3 py-1 rounded-full">Hoy</div>
                  </div>

                  {filteredMessages.map((message, index) => {
                    // Determinar si mostrar el nombre del remitente
                    const showSender =
                      index === 0 ||
                      filteredMessages[index - 1].sender_name !== message.sender_name ||
                      filteredMessages[index - 1].isMine !== message.isMine

                    // Determinar si agrupar mensajes
                    const isGrouped =
                      index > 0 &&
                      filteredMessages[index - 1].sender_name === message.sender_name &&
                      filteredMessages[index - 1].isMine === message.isMine

                    return (
                      <div
                        key={message.id}
                        className={`flex ${message.isMine ? "justify-end" : "justify-start"} ${
                          isGrouped ? "mt-1" : "mt-4"
                        } group`}
                      >
                        {/* Avatar para mensajes de otros usuarios */}
                        {!message.isMine && showSender && (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-black font-medium mr-2 flex-shrink-0 self-end"
                            style={{ backgroundColor: getAvatarColor(message.sender_name) }}
                          >
                            {getInitials(message.sender_name)}
                          </div>
                        )}
                        {/* Avatar para mensajes propios (lado derecho) */}
                        {message.isMine && showSender && (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-black font-medium ml-2 flex-shrink-0 self-end order-2"
                            style={{ backgroundColor: getAvatarColor(user) }}
                          >
                            {getInitials(user)}
                          </div>
                        )}
                        {!message.isMine && !showSender && <div className="w-8 mr-2"></div>}
                        <div className="relative">
                          {showSender && !message.isMine && (
                            <div className="text-xs text-[#A0A0B0] mb-1">{message.sender_name}</div>
                          )}                          <div
                            className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                              message.isMine
                                ? message.error 
                                  ? "bg-red-100 text-red-700 border border-red-300 rounded-br-none ml-auto" 
                                  : "bg-[#4ADE80] text-black rounded-br-none ml-auto"
                                : "bg-[#3C3C4E] text-white rounded-bl-none mr-auto"
                            } relative group`}
                            onContextMenu={(e) => {
                              e.preventDefault()
                              setMessageOptions(message.id)
                            }}
                          >
                            <p className="break-words">{message.content}</p>
                            <div
                              className={`text-xs mt-1 flex items-center justify-end ${
                                message.isMine ? "text-black text-opacity-70" : "text-white text-opacity-70"
                              }`}
                            >                              {message.time}
                              {message.isMine && (
                                message.error 
                                  ? <span className="ml-1 text-xs text-red-600">Error</span>
                                  : message.isOptimistic 
                                    ? <span className="ml-1 text-xs opacity-70">Enviando...</span>
                                    : <Check size={14} className="ml-1 text-black text-opacity-70" />
                              )}
                            </div>

                            {/* Opciones de mensaje (al hacer clic derecho) */}
                            {messageOptions === message.id && (
                              <div className="absolute z-10 bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg shadow-lg p-1 w-32 right-0 top-full mt-1 animate-fadeIn">
                                <button
                                  className="w-full text-left px-3 py-2 text-sm text-[#A0A0B0] hover:bg-[#3C3C4E] hover:text-white rounded flex items-center"
                                  onClick={() => {
                                    navigator.clipboard.writeText(message.content)
                                    setMessageOptions(null)
                                    showNotification("Copiado", "Mensaje copiado al portapapeles")
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                    />
                                  </svg>
                                  Copiar
                                </button>
                                <button
                                  className="w-full text-left px-3 py-2 text-sm text-[#A0A0B0] hover:bg-[#3C3C4E] hover:text-white rounded flex items-center"
                                  onClick={() => {
                                    setNewMessage(`${message.content}`)
                                    setMessageOptions(null)
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                    />
                                  </svg>
                                  Responder
                                </button>                                {message.error && (
                                  <button
                                    className="w-full text-left px-3 py-2 text-sm text-[#4ADE80] hover:bg-[#3C3C4E] hover:text-[#4ADE80] rounded flex items-center"
                                    onClick={() => {
                                      handleRetryMessage(message);
                                      setMessageOptions(null);
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 mr-2"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                      />
                                    </svg>
                                    Reintentar
                                  </button>
                                )                                }
                                
                                {message.isMine && (
                                  <>
                                    {/* No se necesita un botón de reintentar aquí, ya existe arriba */}
                                    <button
                                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-[#3C3C4E] hover:text-red-400 rounded flex items-center"
                                      onClick={() => {
                                        // Aquí iría la lógica para eliminar el mensaje
                                        setMessageOptions(null)
                                        showNotification("Eliminado", "Mensaje eliminado correctamente")
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Eliminar
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Indicador de escritura */}
                  {isTyping && (
                    <div className="flex justify-start mt-2">
                      <div className="w-8 h-8 rounded-full bg-[#3C3C4E] flex items-center justify-center text-white font-medium mr-2 flex-shrink-0 self-end opacity-50">
                        <User size={16} />
                      </div>
                      <div className="bg-[#3C3C4E] text-white rounded-lg px-4 py-2 rounded-bl-none max-w-xs">
                        <div className="flex space-x-1">
                          <div
                            className="w-2 h-2 rounded-full bg-[#A0A0B0] animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 rounded-full bg-[#A0A0B0] animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 rounded-full bg-[#A0A0B0] animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Referencia para scroll automático */}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Entrada de mensaje */}
            <div className="p-4 border-t border-[#3C3C4E] relative">
              {/* Panel de emojis */}
              {showEmojis && (
                <div className="absolute bottom-20 right-4 bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg shadow-lg p-3 z-10 animate-fadeIn">
                  <div className="flex flex-wrap gap-2 max-w-xs">
                    {commonEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        className="text-xl hover:bg-[#3C3C4E] p-2 rounded transition-colors"
                        onClick={() => {
                          setNewMessage((prev) => prev + emoji)
                          setShowEmojis(false)
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Panel de opciones de adjuntos */}
              {showAttachOptions && (
                <div className="absolute bottom-20 left-4 bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg shadow-lg p-2 z-10 animate-fadeIn">
                  <div className="flex gap-2">
                    <button
                      className="flex flex-col items-center p-3 hover:bg-[#3C3C4E] rounded-lg transition-colors"
                      onClick={() => {
                        alert("Funcionalidad de imágenes próximamente")
                        setShowAttachOptions(false)
                      }}
                    >
                      <ImageIcon size={20} className="text-[#4ADE80] mb-1" />
                      <span className="text-xs text-[#A0A0B0]">Imagen</span>
                    </button>
                    <button
                      className="flex flex-col items-center p-3 hover:bg-[#3C3C4E] rounded-lg transition-colors"
                      onClick={() => {
                        alert("Funcionalidad de documentos próximamente")
                        setShowAttachOptions(false)
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-[#4ADE80] mb-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-xs text-[#A0A0B0]">Documento</span>
                    </button>
                    <button
                      className="flex flex-col items-center p-3 hover:bg-[#3C3C4E] rounded-lg transition-colors"
                      onClick={() => {
                        alert("Funcionalidad de audio próximamente")
                        setShowAttachOptions(false)
                      }}
                    >
                      <Mic size={20} className="text-[#4ADE80] mb-1" />
                      <span className="text-xs text-[#A0A0B0]">Audio</span>
                    </button>
                  </div>
                </div>
              )}

              <form
                className="flex items-center bg-[#2D2D3A] rounded-lg border border-[#3C3C4E] overflow-hidden"
                onSubmit={handleSendMessage}
              >
                <button
                  type="button"
                  className={`p-3 ${
                    showAttachOptions ? "text-[#4ADE80]" : "text-[#A0A0B0] hover:text-[#4ADE80]"
                  } transition-colors relative`}
                  onClick={handleAttach}
                >
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 py-3 px-2 text-white"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage(e)
                  }}
                  onKeyUp={handleTyping}
                  onFocus={() => {
                    setShowEmojis(false)
                    setShowAttachOptions(false)
                  }}
                  onClick={() => {
                    // Cerrar menús al hacer clic en el input
                    setMessageOptions(null)
                    setShowEmojis(false)
                    setShowAttachOptions(false)
                  }}
                />
                <button
                  type="button"
                  className={`p-3 ${
                    showEmojis ? "text-[#4ADE80]" : "text-[#A0A0B0] hover:text-[#4ADE80]"
                  } transition-colors`}
                  onClick={handleEmoji}
                >
                  <Smile size={20} />
                </button>
                <button
                  type="submit"
                  className="bg-[#4ADE80] text-black p-3 hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newMessage.trim()}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </main>
        </div>
      </div>

      {/* Modal para crear grupo */}
      {showGroupModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={() => setShowGroupModal(false)}
        >
          <form
            className="bg-[#232336] p-6 rounded-lg shadow-lg w-80 flex flex-col gap-4 animate-fadeIn"
            onSubmit={handleCreateGroup}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-[#4ADE80] mb-2 flex items-center gap-2">
              <Users size={20} /> Crear nuevo grupo
            </h2>
            <div>
              <label htmlFor="group-name" className="block text-sm font-medium text-[#A0A0B0] mb-1">
                Nombre del grupo
              </label>
              <input
                id="group-name"
                type="text"
                className="w-full px-3 py-2 rounded bg-[#1E1E2E] border border-[#3C3C4E] text-white focus:ring-2 focus:ring-[#4ADE80] focus:border-[#4ADE80] transition-all"
                placeholder="Ej: Equipo de Marketing"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                autoFocus
                maxLength={32}
                required
              />
              <p className="text-xs text-[#A0A0B0] mt-1">Máximo 32 caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A0A0B0] mb-1">Miembros</label>
              <div className="bg-[#1E1E2E] border border-[#3C3C4E] rounded p-2 max-h-32 overflow-y-auto">
                <div className="flex items-center p-2 hover:bg-[#3C3C4E] rounded">
                  <input
                    type="checkbox"
                    id="member-1"
                    className="mr-2 rounded border-[#3C3C4E] text-[#4ADE80] focus:ring-[#4ADE80]"
                    defaultChecked
                  />
                  <label htmlFor="member-1" className="flex items-center cursor-pointer">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-black text-xs mr-2"
                      style={{ backgroundColor: getAvatarColor("Ana Martínez") }}
                    >
                      {getInitials("Ana Martínez")}
                    </div>
                    <span className="text-white text-sm">Ana Martínez</span>
                  </label>
                </div>
                <div className="flex items-center p-2 hover:bg-[#3C3C4E] rounded">
                  <input
                    type="checkbox"
                    id="member-2"
                    className="mr-2 rounded border-[#3C3C4E] text-[#4ADE80] focus:ring-[#4ADE80]"
                    defaultChecked
                  />
                  <label htmlFor="member-2" className="flex items-center cursor-pointer">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-black text-xs mr-2"
                      style={{ backgroundColor: getAvatarColor("Carlos López") }}
                    >
                      {getInitials("Carlos López")}
                    </div>
                    <span className="text-white text-sm">Carlos López</span>
                  </label>
                </div>
                <div className="flex items-center p-2 hover:bg-[#3C3C4E] rounded">
                  <input
                    type="checkbox"
                    id="member-3"
                    className="mr-2 rounded border-[#3C3C4E] text-[#4ADE80] focus:ring-[#4ADE80]"
                  />
                  <label htmlFor="member-3" className="flex items-center cursor-pointer">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-black text-xs mr-2"
                      style={{ backgroundColor: getAvatarColor("Elena Rodríguez") }}
                    >
                      {getInitials("Elena Rodríguez")}
                    </div>
                    <span className="text-white text-sm">Elena Rodríguez</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-2">
              <button
                type="button"
                className="px-4 py-2 rounded bg-[#3C3C4E] text-[#A0A0B0] hover:bg-[#232336] hover:text-white transition-all"
                onClick={() => setShowGroupModal(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-[#4ADE80] text-black font-semibold hover:bg-[#22c55e] transition-all disabled:opacity-60"
                disabled={!groupName.trim()}
              >
                Crear
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Estilos adicionales para animaciones */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
        /* Ocultar el menú de opciones de mensaje al hacer clic fuera */
        .group:not(:hover) .group-hover-opacity-100:not(:focus-within) {
          opacity: 0;
        }
      `}</style>
    </div>
  )
}

export default Chat
