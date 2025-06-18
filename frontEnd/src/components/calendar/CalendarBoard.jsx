import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, MapPin, Clock, AlertCircle, Users, Target } from 'lucide-react';

const CalendarBoard = ({ groupId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    is_milestone: false
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin' || userRole === 'supervisor';
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/events/group/${groupId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        console.error('Error al cargar eventos:', response.statusText);
      }
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar eventos al montar el componente
  useEffect(() => {
    fetchEvents();
  }, [groupId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const eventData = {
        ...formData,
        group_id: groupId,
        event_date: formData.event_date,
        event_time: formData.event_time || '00:00'
      };

      const url = editingEvent 
        ? `http://localhost:3000/api/events/${editingEvent.id}`
        : `http://localhost:3000/api/events`;
      
      const method = editingEvent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        await fetchEvents();
        closeModal();
      } else {
        console.error('Error al guardar evento:', response.statusText);
      }
    } catch (error) {
      console.error('Error al guardar evento:', error);
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchEvents();
      } else {
        console.error('Error al eliminar evento:', response.statusText);
      }
    } catch (error) {
      console.error('Error al eliminar evento:', error);
    }
  };

  const openModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description || '',
        event_date: event.event_date,
        event_time: event.event_time || '',
        location: event.location || '',
        is_milestone: event.is_milestone || false
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        location: '',
        is_milestone: false
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      event_date: '',
      event_time: '',
      location: '',
      is_milestone: false
    });
  };

  // Funciones del calendario
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }
    
    // Días del mes siguiente para completar la grilla
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false });
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.event_date === dateStr);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isFutureEvent = (eventDate) => {
    const today = new Date();
    const event = new Date(eventDate);
    return event >= today;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A8E6A3]"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#2C2C34] via-[#1A1A1F] to-[#0F0F12]">
      {/* Header */}
      <div className="border-b border-[#3C4043] bg-[#252529] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-[#A8E6A3]" />
            <div>
              <h2 className="text-xl font-bold text-[#A8E6A3]">
                Calendario de Eventos
              </h2>
              <p className="text-sm text-[#B8B8B8]">
                Fechas especiales y objetivos importantes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Toggle vista */}
            <div className="flex bg-[#1A1A1F] rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-[#A8E6A3] text-[#1A1A1F] font-medium'
                    : 'text-[#B8B8B8] hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  viewMode === 'list'
                    ? 'bg-[#A8E6A3] text-[#1A1A1F] font-medium'
                    : 'text-[#B8B8B8] hover:text-white'
                }`}
              >
                Lista
              </button>
            </div>
            {isAdmin && (
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 px-4 py-2 bg-[#A8E6A3] text-[#1A1A1F] rounded-lg hover:bg-[#90D68C] transition-all font-medium"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nuevo Evento</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'calendar' ? (
          <div className="space-y-4">
            {/* Navegación del mes */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] transition-colors"
              >
                ←
              </button>
              <h3 className="text-lg font-semibold text-white">
                {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] transition-colors"
              >
                →
              </button>
            </div>

            {/* Grilla del calendario */}
            <div className="bg-[#252529] rounded-xl border border-[#3C4043] overflow-hidden">
              {/* Días de la semana */}
              <div className="grid grid-cols-7 border-b border-[#3C4043]">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-[#B8B8B8] bg-[#1A1A1F]">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Días del mes */}
              <div className="grid grid-cols-7">
                {getDaysInMonth(currentMonth).map((day, index) => {
                  const dayEvents = getEventsForDate(day.date);
                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] p-2 border-r border-b border-[#3C4043] ${
                        day.isCurrentMonth ? 'bg-[#252529]' : 'bg-[#1A1A1F]'
                      } ${isToday(day.date) ? 'ring-2 ring-[#A8E6A3]' : ''}`}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        day.isCurrentMonth ? 'text-white' : 'text-[#666]'
                      } ${isToday(day.date) ? 'text-[#A8E6A3]' : ''}`}>
                        {day.date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map(event => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded cursor-pointer truncate ${
                              event.is_milestone
                                ? 'bg-[#A8E6A3] text-[#1A1A1F]'
                                : 'bg-[#3C4043] text-[#B8B8B8]'
                            }`}
                            onClick={() => openModal(event)}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-[#B8B8B8] pl-1">
                            +{dayEvents.length - 3} más
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          // Vista de lista
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-[#3C4043] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#B8B8B8] mb-2">
                  No hay eventos programados
                </h3>
                <p className="text-[#666] mb-4">
                  {isAdmin ? 'Crea el primer evento para este grupo' : 'Aún no hay eventos en este grupo'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {events
                  .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
                  .map(event => (
                    <div
                      key={event.id}
                      className={`bg-[#252529] rounded-xl border border-[#3C4043] p-4 hover:border-[#A8E6A3]/30 transition-all ${
                        event.is_milestone ? 'ring-1 ring-[#A8E6A3]/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {event.is_milestone && (
                              <Target className="w-4 h-4 text-[#A8E6A3]" />
                            )}
                            <h3 className="font-semibold text-white">{event.title}</h3>
                            {!isFutureEvent(event.event_date) && (
                              <span className="text-xs px-2 py-1 bg-[#3C4043] text-[#B8B8B8] rounded">
                                Pasado
                              </span>
                            )}
                          </div>
                          
                          {event.description && (
                            <p className="text-[#B8B8B8] text-sm mb-3">{event.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-[#B8B8B8]">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(event.event_date)}
                            </div>
                            {event.event_time && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {event.event_time}
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {isAdmin && (
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => openModal(event)}
                              className="p-2 text-[#B8B8B8] hover:text-[#A8E6A3] transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(event.id)}
                              className="p-2 text-[#B8B8B8] hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para crear/editar evento */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#2C2C34] to-[#1A1A1F] rounded-xl border border-[#3C4043] w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-[#A8E6A3] mb-6">
                {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#B8B8B8] mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 bg-[#1A1A1F] border border-[#3C4043] rounded-lg text-white focus:border-[#A8E6A3] focus:outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#B8B8B8] mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 bg-[#1A1A1F] border border-[#3C4043] rounded-lg text-white focus:border-[#A8E6A3] focus:outline-none resize-none"
                    rows="3"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#B8B8B8] mb-2">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                      className="w-full px-4 py-2 bg-[#1A1A1F] border border-[#3C4043] rounded-lg text-white focus:border-[#A8E6A3] focus:outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#B8B8B8] mb-2">
                      Hora
                    </label>
                    <input
                      type="time"
                      value={formData.event_time}
                      onChange={(e) => setFormData({...formData, event_time: e.target.value})}
                      className="w-full px-4 py-2 bg-[#1A1A1F] border border-[#3C4043] rounded-lg text-white focus:border-[#A8E6A3] focus:outline-none"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#B8B8B8] mb-2">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-2 bg-[#1A1A1F] border border-[#3C4043] rounded-lg text-white focus:border-[#A8E6A3] focus:outline-none"
                    placeholder="Ubicación del evento"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_milestone"
                    checked={formData.is_milestone}
                    onChange={(e) => setFormData({...formData, is_milestone: e.target.checked})}
                    className="w-4 h-4 text-[#A8E6A3] bg-[#1A1A1F] border-[#3C4043] rounded focus:ring-[#A8E6A3]"
                  />
                  <label htmlFor="is_milestone" className="text-sm text-[#B8B8B8] flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Marcar como hito importante
                  </label>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-[#B8B8B8] hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#A8E6A3] text-[#1A1A1F] rounded-lg hover:bg-[#90D68C] transition-all font-medium"
                  >
                    {editingEvent ? 'Actualizar' : 'Crear'} Evento
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarBoard;
