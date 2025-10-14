// src/services/nlpActionService.js - Servicio para procesar acciones en lenguaje natural
import { ModelsObjective } from '../models/objective.js'
import { ModelsTask } from '../models/task.js'
import { Event } from '../models/event.js'
import * as chrono from 'chrono-node'

/**
 * Servicio para interpretar lenguaje natural y ejecutar acciones en la BD
 * Permite a ALEXANDRA crear tareas, objetivos y eventos basados en comandos del usuario
 */
class NLPActionService {
  
  /**
   * Detecta si el mensaje contiene una solicitud de acción
   */
  detectAction(message) {
    const lowerMessage = message.toLowerCase()
    
    console.log('🔍 NLP: Analizando mensaje para detectar acción...')
    console.log('   Mensaje:', message)
    
    // Patrones para detectar intenciones
    const patterns = {
      createTask: /(?:crea|crear|agrega|agregar|añade|añadir|nueva|nuevo|haz|hacer)\s+(?:una\s+)?tarea/i,
      createObjective: /(?:crea|crear|agrega|agregar|añade|añadir|nuevo|haz|hacer)\s+(?:un\s+)?objetivo/i,
      createEvent: /(?:crea|crear|agrega|agregar|añade|añadir|agenda|agendar|programa|programar|haz|hacer|necesito|quiero)\s+(?:un\s+|una\s+)?(?:evento|reunión|reunion|meeting|cita|junta)|(?:reunión|reunion|meeting|cita|junta)\s+(?:para|el|mañana|hoy|pasado)/i,
      scheduleReminder: /(?:recuerda|recordar|recuérdame)\s+(?:que|de)/i,
      setDeadline: /(?:fecha\s+límite|deadline|plazo|vence|vencimiento)\s+(?:para|el|en)/i
    }
    
    for (const [action, pattern] of Object.entries(patterns)) {
      if (pattern.test(lowerMessage)) {
        console.log('✅ NLP: Acción detectada:', action)
        console.log('   Patrón:', pattern)
        return action
      }
    }
    
    console.log('❌ NLP: No se detectó ninguna acción')
    return null
  }

  /**
   * Extrae información de una solicitud de tarea
   */
  extractTaskInfo(message, userId, groupId) {
    const lowerMessage = message.toLowerCase()
    
    // Extraer título (texto después de "tarea")
    const titleMatch = message.match(/tarea\s+(?:de\s+|para\s+)?["']?([^"']+)["']?/i)
    const title = titleMatch ? titleMatch[1].trim() : 'Nueva tarea'
    
    // Detectar prioridad
    let priority = 'medium'
    if (/urgente|crítica|crítico|alta|high/i.test(lowerMessage)) priority = 'critical'
    else if (/importante|media|medium/i.test(lowerMessage)) priority = 'high'
    else if (/baja|low/i.test(lowerMessage)) priority = 'low'
    
    // Extraer descripción (texto después de descripción/detalles)
    const descMatch = message.match(/(?:descripción|detalles?|sobre|acerca de):\s*([^\.]+)/i)
    const description = descMatch ? descMatch[1].trim() : ''
    
    // Detectar fecha usando chrono-node
    const parsedDates = chrono.es.parse(message)
    const deadline = parsedDates.length > 0 ? parsedDates[0].start.date() : null
    
    return {
      title,
      description,
      priority,
      deadline,
      created_by: userId,
      assigned_to: null, // Se puede extraer si se menciona un usuario
      status: 'pending'
    }
  }

  /**
   * Extrae información de una solicitud de objetivo
   */
  extractObjectiveInfo(message, userId, groupId) {
    const lowerMessage = message.toLowerCase()
    
    // Extraer título
    const titleMatch = message.match(/objetivo\s+(?:de\s+|para\s+)?["']?([^"']+)["']?/i)
    const title = titleMatch ? titleMatch[1].trim() : 'Nuevo objetivo'
    
    // Extraer descripción
    const descMatch = message.match(/(?:descripción|detalles?|consiste en):\s*([^\.]+)/i)
    const description = descMatch ? descMatch[1].trim() : ''
    
    // Detectar fecha usando chrono-node
    const parsedDates = chrono.es.parse(message)
    const deadline = parsedDates.length > 0 ? parsedDates[0].start.date() : null
    
    return {
      title,
      description,
      group_id: groupId,
      created_by: userId,
      deadline: deadline ? deadline.toISOString().split('T')[0] : null
    }
  }

  /**
   * Extrae información de una solicitud de evento
   */
  extractEventInfo(message, userId, groupId) {
    const lowerMessage = message.toLowerCase()
    
    console.log('📅 NLP: Extrayendo información de evento...')
    console.log('   Mensaje:', message)
    
    // Extraer título del evento - MEJORADO para ser más flexible
    let title = 'Nuevo evento'
    
    // Intentar diferentes patrones
    const titlePatterns = [
      // "hacer/crear una reunión [título]"
      /(?:evento|reunión|reunion|meeting|cita|junta)\s+(?:de|sobre|para|con|llamada)\s+["']?([^"'\n]+?)(?:["']|\s+(?:mañana|hoy|pasado|el|a las|para|descripción)|$)/i,
      // "reunión [título] mañana"
      /(?:evento|reunión|reunion|meeting|cita|junta)\s+["']?([^"'\n]+?)(?:["']|\s+(?:mañana|hoy|pasado|el|a las))/i,
      // Fallback: cualquier texto después de "reunión"
      /(?:evento|reunión|reunion|meeting|cita|junta)\s+(.+?)(?:\s+(?:mañana|hoy|pasado|el)|$)/i
    ]
    
    for (const pattern of titlePatterns) {
      const match = message.match(pattern)
      if (match && match[1]) {
        title = match[1].trim()
        break
      }
    }
    
    // Si aún no encontramos título, usar descripción general
    if (title === 'Nuevo evento') {
      // Buscar verbos de acción y extraer lo que sigue
      const actionMatch = message.match(/(?:hacer|haz|crear|crea|agenda|agendar)\s+(?:una\s+)?(?:reunión|reunion|meeting)\s+(.+?)(?:\s+(?:mañana|hoy|pasado|el)|$)/i)
      if (actionMatch && actionMatch[1]) {
        title = actionMatch[1].trim()
      }
    }
    
    console.log('   Título extraído:', title)
    
    // Detectar tipo de evento
    let event_type = 'reminder'
    if (/reunión|meeting|junta/i.test(lowerMessage)) event_type = 'meeting'
    else if (/deadline|fecha\s+límite|plazo/i.test(lowerMessage)) event_type = 'deadline'
    else if (/hito|milestone/i.test(lowerMessage)) event_type = 'milestone'
    else if (/celebración|celebrar/i.test(lowerMessage)) event_type = 'celebration'
    
    console.log('   Tipo de evento:', event_type)
    
    // Detectar prioridad
    let priority = 'medium'
    if (/urgente|crítica|alta/i.test(lowerMessage)) priority = 'high'
    else if (/importante/i.test(lowerMessage)) priority = 'medium'
    else if (/baja/i.test(lowerMessage)) priority = 'low'
    
    // Extraer descripción
    const descMatch = message.match(/(?:descripción|detalles?|sobre|acerca de):\s*([^\.]+)/i)
    const description = descMatch ? descMatch[1].trim() : ''
    
    console.log('   Descripción:', description || '(ninguna)')
    
    // Parsear fecha y hora usando chrono-node
    console.log('   Parseando fecha con chrono...')
    const parsedDates = chrono.es.parse(message, new Date(), { forwardDate: true })
    
    console.log('   Fechas detectadas:', parsedDates.length)
    
    let event_date = null
    let event_time = null
    
    if (parsedDates.length > 0) {
      const parsedDate = parsedDates[0].start.date()
      event_date = parsedDate.toISOString().split('T')[0]
      
      console.log('   Fecha parseada:', event_date)
      
      // Si tiene hora específica
      if (parsedDates[0].start.get('hour') !== null) {
        const hours = String(parsedDate.getHours()).padStart(2, '0')
        const minutes = String(parsedDate.getMinutes()).padStart(2, '0')
        event_time = `${hours}:${minutes}`
        console.log('   Hora parseada:', event_time)
      } else {
        console.log('   Sin hora específica detectada')
      }
    } else {
      console.log('   ⚠️ No se pudo parsear ninguna fecha')
    }
    
    const eventInfo = {
      title,
      description,
      event_date,
      event_time,
      event_type,
      priority,
      group_id: groupId,
      user_id: userId,
      reminder_enabled: true,
      reminder_minutes: 30
    }
    
    console.log('   Info final del evento:', JSON.stringify(eventInfo, null, 2))
    
    return eventInfo
  }

  /**
   * Ejecuta la acción detectada
   */
  async executeAction(actionType, message, userId, groupId, objectiveId = null) {
    try {
      console.log('🎯 NLP Action Service - Executing:', actionType)
      console.log('   User:', userId, 'Group:', groupId)
      
      switch (actionType) {
        case 'createTask': {
          const taskInfo = this.extractTaskInfo(message, userId, groupId)
          
          // Si hay un objetivo activo, asociar la tarea
          if (objectiveId) {
            taskInfo.objective_id = objectiveId
          }
          
          const task = await ModelsTask.create(taskInfo)
          
          return {
            success: true,
            action: 'task_created',
            data: task,
            message: `✅ **Tarea creada exitosamente:**\n\n📋 **${task.title}**\n${task.description ? `📝 ${task.description}\n` : ''}🎯 Prioridad: **${this.translatePriority(task.priority)}**${task.deadline ? `\n📅 Fecha límite: **${this.formatDate(task.deadline)}**` : ''}`
          }
        }
        
        case 'createObjective': {
          const objectiveInfo = this.extractObjectiveInfo(message, userId, groupId)
          const objective = await ModelsObjective.create(objectiveInfo)
          
          return {
            success: true,
            action: 'objective_created',
            data: objective,
            message: `🎯 **Objetivo creado exitosamente:**\n\n**${objective.title}**\n${objective.description ? `\n📝 ${objective.description}\n` : ''}${objective.deadline ? `📅 Fecha límite: **${this.formatDate(objective.deadline)}**\n` : ''}\n✨ ¡Ahora puedes empezar a crear tareas para este objetivo!`
          }
        }
        
        case 'createEvent':
        case 'scheduleReminder': {
          const eventInfo = this.extractEventInfo(message, userId, groupId)
          
          if (!eventInfo.event_date) {
            return {
              success: false,
              action: 'event_creation_failed',
              message: '⚠️ No pude detectar una fecha válida. Por favor especifica cuándo quieres el evento (ej: "mañana a las 3pm", "el próximo viernes", "el 15 de diciembre")'
            }
          }
          
          const event = await Event.create(eventInfo)
          
          return {
            success: true,
            action: 'event_created',
            data: event,
            message: `📅 **Evento agendado exitosamente:**\n\n**${event.title}**\n${event.description ? `📝 ${event.description}\n` : ''}📆 Fecha: **${this.formatDate(event.event_date)}**${event.event_time ? `\n🕐 Hora: **${event.event_time}**` : ''}\n🔔 Tipo: **${this.translateEventType(event.event_type)}**\n${event.reminder_enabled ? `⏰ Recordatorio activado (${event.reminder_minutes} min antes)` : ''}`
          }
        }
        
        default:
          return {
            success: false,
            action: 'unknown_action',
            message: 'No pude interpretar la acción solicitada.'
          }
      }
      
    } catch (error) {
      console.error('❌ Error en NLP Action Service:', error)
      return {
        success: false,
        action: 'error',
        message: `❌ Hubo un error al procesar tu solicitud: ${error.message}`,
        error: error.message
      }
    }
  }

  /**
   * Traduce prioridad a español
   */
  translatePriority(priority) {
    const translations = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      critical: 'Crítica'
    }
    return translations[priority] || priority
  }

  /**
   * Traduce tipo de evento a español
   */
  translateEventType(eventType) {
    const translations = {
      meeting: 'Reunión',
      deadline: 'Fecha límite',
      milestone: 'Hito',
      reminder: 'Recordatorio',
      celebration: 'Celebración'
    }
    return translations[eventType] || eventType
  }

  /**
   * Formatea fecha de manera amigable
   */
  formatDate(dateString) {
    if (!dateString) return 'No especificada'
    
    const date = new Date(dateString)
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    
    return date.toLocaleDateString('es-ES', options)
  }
}

// Exportar instancia singleton
const nlpActionService = new NLPActionService()
export default nlpActionService
