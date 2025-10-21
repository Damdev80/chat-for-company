// src/services/nlpActionService.js - Servicio para procesar acciones en lenguaje natural
import { ModelsObjective } from '../models/objective.js'
import { ModelsTask } from '../models/task.js'
import { Event } from '../models/event.js'
import { Idea } from '../models/idea.js'
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
    
    // Patrones MEJORADOS - Mucho más flexibles
    const patterns = {
      // Detectar TAREAS - Ampliado
      createTask: /(?:crea|crear|agrega|agregar|añade|añadir|nueva?|nuevo|haz|hacer|pon|poner|guarda|guardar|registra|registrar)\s+(?:una\s+|la\s+)?tarea|tarea\s+(?:nueva|urgente|importante|pendiente)|(?:tengo|hay)\s+(?:una\s+)?tarea|(?:anota|apunta)\s+(?:esta\s+)?tarea/i,
      
      // Detectar IDEAS - NUEVO
      createIdea: /(?:crea|crear|agrega|agregar|añade|añadir|nueva?|nuevo|pon|poner|publica|publicar|comparte|compartir|sube|subir)\s+(?:una\s+|esta\s+)?idea|idea\s+(?:nueva|para|sobre)|(?:tengo|se me ocurre|se me ocurrió)\s+(?:una\s+)?idea|(?:al\s+)?muro\s+de\s+ideas/i,
      
      // Detectar OBJETIVOS - Ampliado y más flexible
      createObjective: /(?:crea|crear|agrega|agregar|añade|añadir|nuevo|establece|establecer|define|definir|fija|fijar)(?:\s+un\s+|\s+una\s+|\s+)(?:objetivo|meta|logro)(?:\s+que\s+sea|\s+de|\s+para|\s+sobre)?|objetivo\s+(?:nuevo|de|para)|(?:meta|logro)\s+(?:nueva?|de|para)/i,
      
      // Detectar EVENTOS - Ampliado
      createEvent: /(?:crea|crear|agrega|agregar|añade|añadir|agenda|agendar|programa|programar|haz|hacer|necesito|quiero|pon|poner)\s+(?:un\s+|una\s+)?(?:evento|reunión|reunion|meeting|cita|junta)|(?:reunión|reunion|meeting|cita|junta)\s+(?:para|el|mañana|hoy|pasado|urgente|importante)|(?:al\s+)?calendario/i,
      
      // Detectar RECORDATORIOS
      scheduleReminder: /(?:recuerda|recor dar|recuérdame|avisa|avisar|avísame|notifica|notificar)\s+(?:que|de|sobre|cuando)/i,
      
      // Detectar PLAZOS
      setDeadline: /(?:fecha\s+límite|deadline|plazo|vence|vencimiento|fecha\s+de\s+entrega)\s+(?:para|el|en|de)/i,
      
      // 🆕 CONSULTAS DE INFORMACIÓN
      queryTasks: /(?:cómo|como)\s+(?:van|está|están|anda|andan)\s+(?:las?\s+)?tareas?|(?:cuáles|cuales|qué|que)\s+tareas?|(?:estado|progreso)\s+(?:de\s+)?(?:las?\s+)?tareas?|(?:tareas?\s+de\s+)(?:\w+)/i,
      
      queryGroupInfo: /(?:cuántos|cuantos|qué|que)\s+(?:miembros|usuarios|personas)|(?:quiénes|quienes)\s+(?:están|son)|(?:integrantes|participantes)\s+(?:del\s+)?grupo|(?:información|info)\s+(?:del\s+)?grupo/i,
      
      // 🆕 GESTIÓN DE TAREAS
      takeTask: /(?:tomo|tomar|tomaré|asumo|asumir|me\s+asigno|asignarme)\s+(?:la\s+)?tarea|(?:yo\s+(?:lo\s+)?hago|me\s+encargo)/i,
      
      listFreeTasks: /(?:tareas?\s+)?(?:libres|disponibles|sin\s+asignar)|(?:qué|cuáles)\s+tareas?\s+(?:puedo\s+tomar|están\s+libres)/i
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
    
    console.log('📝 NLP: Extrayendo información de tarea...')
    console.log('   Mensaje:', message)
    
    // Extraer título - MEJORADO con múltiples patrones
    let title = 'Nueva tarea'
    
    const titlePatterns = [
      // "tarea: [título]" o "tarea de [título]"
      /tarea[\s:]+(?:de\s+|para\s+|sobre\s+)?["']?([^"'\n]+?)(?:["']|\s+(?:urgente|importante|prioridad|descripción)|$)/i,
      // "crear/agregar tarea [título]"
      /(?:crea|crear|agrega|agregar|añade|nueva|pon)\s+(?:una\s+)?tarea\s+["']?([^"'\n]+?)(?:["']|$)/i,
      // "tarea [título]" (simplificado)
      /tarea\s+([^.\n]+?)(?:\.|$)/i,
      // Cualquier texto después de mencionar tarea
      /tarea.*?:\s*(.+?)(?:\.|$)/i
    ]
    
    for (const pattern of titlePatterns) {
      const match = message.match(pattern)
      if (match && match[1] && match[1].trim().length > 0) {
        title = match[1].trim()
        // Limpiar palabras innecesarias del título
        title = title.replace(/(?:urgente|importante|prioridad|alta|media|baja|crítica)/gi, '').trim()
        if (title.length > 3) break
      }
    }
    
    // Si no encontramos título específico, usar el mensaje completo (limpio)
    if (title === 'Nueva tarea') {
      title = message
        .replace(/(?:crea|crear|agrega|agregar|añade|añadir|nueva|nuevo|haz|hacer|pon|poner)\s+(?:una\s+)?tarea\s*/gi, '')
        .replace(/(?:urgente|importante|prioridad alta)/gi, '')
        .trim()
      if (title.length > 100) title = title.substring(0, 100) + '...'
      if (title.length < 3) title = 'Nueva tarea'
    }
    
    console.log('   Título extraído:', title)
    
    // Detectar prioridad - MEJORADO
    let priority = 'medium'
    if (/urgente|crítica?|crítico|alta|high|prioridad\s+alta|muy\s+importante/i.test(lowerMessage)) {
      priority = 'critical'
    } else if (/importante|media|medium|prioridad\s+media|normal/i.test(lowerMessage)) {
      priority = 'high'
    } else if (/baja|low|prioridad\s+baja|no\s+urgente/i.test(lowerMessage)) {
      priority = 'low'
    }
    
    console.log('   Prioridad:', priority)
    
    // Extraer descripción (texto después de descripción/detalles)
    const descMatch = message.match(/(?:descripción|detalles?|sobre|acerca de):\s*([^\.]+)/i)
    const description = descMatch ? descMatch[1].trim() : ''
    
    // 🆕 Detectar asignación de usuario
    let assigned_to = null
    const assignPatterns = [
      /(?:asigna|asignar|para|asignado?\s+a)\s+(?:@)?(\w+)/i,
      /(?:que\s+lo\s+haga|encargado)\s+(?:@)?(\w+)/i,
      /(?:responsable)\s+(?:@)?(\w+)/i
    ]
    
    for (const pattern of assignPatterns) {
      const match = message.match(pattern)
      if (match && match[1]) {
        assigned_to = match[1].toLowerCase()
        console.log('   👤 Asignado a:', assigned_to)
        break
      }
    }
    
    // Detectar si es para "todos"
    if (/(?:para\s+)?todos|todo\s+el\s+(?:equipo|grupo)|equipo\s+completo/i.test(message)) {
      assigned_to = 'all'
      console.log('   👥 Asignado a: TODOS')
    }
    
    // Detectar fecha usando chrono-node
    const parsedDates = chrono.es.parse(message)
    const deadline = parsedDates.length > 0 ? parsedDates[0].start.date() : null
    
    console.log('   Deadline:', deadline ? deadline.toISOString().split('T')[0] : 'ninguna')
    
    return {
      title,
      description,
      priority,
      deadline: deadline ? deadline.toISOString().split('T')[0] : null,
      group_id: groupId,
      created_by: userId,
      assigned_to: assigned_to, // Ahora detecta usuario o 'all'
      status: 'pending'
    }
  }

  /**
   * Extrae información de una solicitud de objetivo
   */
  extractObjectiveInfo(message, userId, groupId) {
    console.log('\n📋 EXTRACT OBJECTIVE INFO:')
    console.log('   📝 Mensaje:', message)
    console.log('   👤 User ID:', userId)
    console.log('   🏢 Group ID RECIBIDO:', groupId)
    console.log('   🔍 Tipo de groupId:', typeof groupId)
    console.log('   ❓ Es null?:', groupId === null)
    console.log('   ❓ Es undefined?:', groupId === undefined)
    
    const lowerMessage = message.toLowerCase()
    
    // Extraer título - MEJORADO con múltiples patrones
    let title = 'Nuevo objetivo'
    
    const titlePatterns = [
      // "crea un objetivo que sea [título] con descripción..."
      /objetivo\s+(?:que\s+sea\s+)?(?:de\s+|para\s+|sobre\s+)?["']?([^"'\n]+?)(?:["']|\s+(?:con\s+)?(?:descripción|descripcion|detalles|para|el|fecha|deadline)|$)/i,
      // "objetivo [título] descripción..."
      /objetivo\s+(.+?)(?:\s+(?:con\s+)?(?:descripción|descripcion|para|el|mañana|hoy|deadline)|$)/i,
      // Fallback
      /(?:meta|logro)\s+(?:de\s+|para\s+)?(.+?)(?:\s+(?:descripción|descripcion|para|el|deadline)|$)/i
    ]
    
    for (const pattern of titlePatterns) {
      const match = message.match(pattern)
      if (match && match[1] && match[1].trim().length > 0) {
        title = match[1].trim()
        // Limpiar frases innecesarias
        title = title
          .replace(/^(?:que\s+sea\s+|de\s+|para\s+|sobre\s+)/i, '')
          .replace(/(?:\s+con\s+)?(?:descripción|descripcion|detalles|fecha|deadline).*$/i, '')
          .trim()
        if (title.length > 3) break
      }
    }
    
    console.log('   📌 Título extraído:', title)
    
    // Extraer descripción - MEJORADO con más patrones
    let description = ''
    const descPatterns = [
      /(?:con\s+)?(?:descripción|descripcion):\s*([^,\.\n]+)/i,
      /(?:con\s+)?(?:descripción|descripcion)\s+(?:que\s+)?(.+?)(?:\s+(?:fecha|para|mañana|hoy)|$)/i,
      /(?:detalles?|consiste\s+en|que\s+consiste\s+en):\s*([^,\.\n]+)/i,
      /(?:detalles?)\s+(.+?)(?:\s+(?:fecha|para|mañana|hoy)|$)/i
    ]
    
    for (const pattern of descPatterns) {
      const match = message.match(pattern)
      if (match && match[1] && match[1].trim().length > 0) {
        description = match[1].trim()
        // Limpiar la descripción de fechas y palabras clave de fecha
        description = description
          .replace(/(?:fecha|para el|mañana|hoy|deadline).*$/i, '')
          .trim()
        break
      }
    }
    
    console.log('   📝 Descripción extraída:', description || '(ninguna)')
    
    // Detectar fecha límite usando chrono-node - MEJORADO
    let deadline = null
    
    // Primero buscar con patrones específicos
    const datePatterns = [
      /(?:fecha\s+límite|fecha\s+limite|deadline|plazo|vence|para\s+el|hasta\s+el)[:\s]+(.+?)(?:\s*\.|$)/i,
    ]
    
    for (const pattern of datePatterns) {
      const match = message.match(pattern)
      if (match && match[1]) {
        console.log('   🔍 Fecha encontrada con patrón:', match[1])
        const parsedDates = chrono.es.parse(match[1])
        if (parsedDates.length > 0) {
          deadline = parsedDates[0].start.date()
          break
        }
      }
    }
    
    // Si no se encontró con los patrones específicos, buscar en todo el mensaje
    if (!deadline) {
      const allParsedDates = chrono.es.parse(message)
      if (allParsedDates.length > 0) {
        deadline = allParsedDates[0].start.date()
      }
    }
    
    console.log('   📅 Fecha límite extraída:', deadline ? deadline.toISOString().split('T')[0] : '(ninguna)')
    
    const objectiveInfo = {
      title,
      description,
      group_id: groupId,
      created_by: userId,
      deadline: deadline ? deadline.toISOString().split('T')[0] : null
    }
    
    console.log('   ✅ Objective Info construido:')
    console.log('      title:', objectiveInfo.title)
    console.log('      description:', objectiveInfo.description || '(vacía)')
    console.log('      group_id:', objectiveInfo.group_id)
    console.log('      created_by:', objectiveInfo.created_by)
    console.log('      deadline:', objectiveInfo.deadline || '(ninguna)')
    
    return objectiveInfo
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
   * Extrae información de una solicitud de idea
   */
  extractIdeaInfo(message, userId, groupId) {
    const lowerMessage = message.toLowerCase()
    
    console.log('💡 NLP: Extrayendo información de idea...')
    console.log('   Mensaje:', message)
    
    // Extraer título - MEJORADO
    let title = 'Nueva idea'
    
    const titlePatterns = [
      // "idea: [título]" o "idea sobre [título]"
      /idea[\s:]+(?:sobre\s+|para\s+|de\s+)?["']?([^"'\n]+?)(?:["']|\s+(?:descripción|categoría)|$)/i,
      // "crear/agregar idea [título]"
      /(?:crea|crear|agrega|agregar|publica|nueva)\s+(?:una\s+)?idea\s+["']?([^"'\n]+?)(?:["']|$)/i,
      // "tengo una idea [título]"
      /(?:tengo|se me ocurre|se me ocurrió)\s+(?:una\s+)?idea\s+["']?([^"'\n]+?)(?:["']|$)/i,
      // Simplificado: "idea [título]"
      /idea\s+([^.\n]+?)(?:\.|$)/i
    ]
    
    for (const pattern of titlePatterns) {
      const match = message.match(pattern)
      if (match && match[1] && match[1].trim().length > 0) {
        title = match[1].trim()
        if (title.length > 5) break
      }
    }
    
    // Si no encontramos título, usar el mensaje completo limpio
    if (title === 'Nueva idea') {
      title = message
        .replace(/(?:crea|crear|agrega|agregar|publica|nueva?|pon|poner)\s+(?:una\s+)?idea\s*/gi, '')
        .replace(/(?:muro\s+de\s+ideas|al\s+muro)/gi, '')
        .trim()
      if (title.length > 100) title = title.substring(0, 100) + '...'
      if (title.length < 3) title = 'Nueva idea'
    }
    
    console.log('   Título extraído:', title)
    
    // Extraer descripción
    const descMatch = message.match(/(?:descripción|detalles?|sobre|acerca de|consiste en):\s*([^\.]+)/i)
    const description = descMatch ? descMatch[1].trim() : ''
    
    console.log('   Descripción:', description || '(ninguna)')
    
    // Detectar categoría
    let category = 'general'
    if (/(?:nueva\s+)?(?:función|feature|funcionalidad)/i.test(lowerMessage)) category = 'feature'
    else if (/mejora|improvement|optimización/i.test(lowerMessage)) category = 'improvement'
    else if (/bug|error|problema|fallo/i.test(lowerMessage)) category = 'bug'
    
    console.log('   Categoría:', category)
    
    // Detectar prioridad
    let priority = 'medium'
    if (/urgente|crítica?|alta|high|muy\s+importante/i.test(lowerMessage)) priority = 'high'
    else if (/baja|low|no\s+urgente/i.test(lowerMessage)) priority = 'low'
    
    console.log('   Prioridad:', priority)
    
    return {
      group_id: groupId,
      user_id: userId,
      title,
      description,
      category,
      priority
    }
  }

  /**
   * Ejecuta la acción detectada
   */
  async executeAction(actionType, message, userId, groupId, objectiveId = null) {
    try {
      console.log('\n🎯 NLP Action Service - Executing:', actionType)
      console.log('   👤 User ID:', userId)
      console.log('   🏢 Group ID RECIBIDO:', groupId)
      console.log('   📝 Mensaje:', message)
      console.log('   🎯 Objective ID:', objectiveId || 'ninguno')
      
      switch (actionType) {
        case 'createTask': {
          const taskInfo = this.extractTaskInfo(message, userId, groupId)
          
          // Si NO hay un objective_id especificado, buscar o crear "Tareas Generales"
          if (!objectiveId && !taskInfo.objective_id) {
            console.log('   No hay objetivo especificado, buscando/creando "Tareas Generales"...')
            
            // Buscar si existe el objetivo "Tareas Generales" en el grupo
            console.log('   🔍 Buscando objetivos en grupo:', groupId)
            const objectives = await ModelsObjective.getByGroupId(groupId)
            console.log('   📋 Objetivos encontrados:', objectives.length)
            objectives.forEach(obj => console.log(`      - ${obj.title} (ID: ${obj.id})`))
            
            let generalObjective = objectives.find(obj => 
              obj.title.toLowerCase().includes('tareas generales') || 
              obj.title.toLowerCase().includes('general')
            )
            
            // Si no existe, crearlo
            if (!generalObjective) {
              console.log('   ⚠️ No existe "Tareas Generales", creando...')
              console.log('   📦 Datos para crear objetivo:', {
                title: 'Tareas Generales',
                group_id: groupId,
                created_by: userId
              })
              generalObjective = await ModelsObjective.create({
                title: 'Tareas Generales',
                description: 'Objetivo creado automáticamente para tareas sin objetivo específico',
                group_id: groupId,
                created_by: userId
              })
              console.log('   ✅ Objetivo general creado con ID:', generalObjective.id)
              console.log('   🏢 En el grupo:', generalObjective.group_id)
            } else {
              console.log('   ✅ Usando objetivo existente:', generalObjective.id)
            }
            
            taskInfo.objective_id = generalObjective.id
          } else if (objectiveId) {
            // Si hay un objetivo activo en el contexto, usarlo
            taskInfo.objective_id = objectiveId
          }
          
          console.log('   Creando tarea con objective_id:', taskInfo.objective_id)
          const task = await ModelsTask.create(taskInfo)
          
          // Construir mensaje de confirmación
          let assignmentInfo = ''
          if (task.assigned_to === 'all') {
            assignmentInfo = '\n👥 **Asignada a:** Todo el equipo'
          } else if (task.assigned_to) {
            assignmentInfo = `\n👤 **Asignada a:** @${task.assigned_to}`
          } else {
            assignmentInfo = '\n🆓 **Tarea libre** - Cualquier miembro puede tomarla'
          }
          
          return {
            success: true,
            action: 'task_created',
            data: task,
            message: `✅ **Tarea creada exitosamente:**\n\n📋 **${task.title}**\n${task.description ? `📝 ${task.description}\n` : ''}🎯 Prioridad: **${this.translatePriority(task.priority)}**${task.deadline ? `\n📅 Fecha límite: **${this.formatDate(task.deadline)}**` : ''}${assignmentInfo}\n📂 Objetivo: **${taskInfo.objective_id === task.objective_id ? 'Tareas Generales' : 'Asignado'}**`
          }
        }
        
        case 'createObjective': {
          console.log('   📝 Extrayendo info de objetivo...')
          const objectiveInfo = this.extractObjectiveInfo(message, userId, groupId)
          console.log('   📦 Info del objetivo a crear:', JSON.stringify(objectiveInfo, null, 2))
          
          const objective = await ModelsObjective.create(objectiveInfo)
          console.log('   ✅ Objetivo creado:', objective.id)
          console.log('   🏢 En grupo:', objective.group_id)
          
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
        
        case 'createIdea': {
          const ideaInfo = this.extractIdeaInfo(message, userId, groupId)
          const idea = await Idea.create(ideaInfo)
          
          return {
            success: true,
            action: 'idea_created',
            data: idea,
            message: `💡 **Idea publicada en el muro exitosamente:**\n\n**${idea.title}**\n${idea.description ? `📝 ${idea.description}\n` : ''}📂 Categoría: **${this.translateCategory(idea.category)}**\n⭐ Prioridad: **${this.translatePriority(idea.priority)}**\n👥 Estado: **Propuesta** (pendiente de revisión)\n\n¡Gracias por contribuir con tus ideas! 🚀`
          }
        }
        
        case 'queryTasks': {
          return await this.queryTasksStatus(message, userId, groupId)
        }
        
        case 'queryGroupInfo': {
          return await this.queryGroupInformation(message, userId, groupId)
        }
        
        case 'listFreeTasks': {
          return await this.listAvailableTasks(message, userId, groupId)
        }
        
        case 'takeTask': {
          return await this.assignTaskToUser(message, userId, groupId)
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
   * Traduce categoría de idea a español
   */
  translateCategory(category) {
    const translations = {
      general: 'General',
      feature: 'Nueva Función',
      improvement: 'Mejora',
      bug: 'Reporte de Bug',
      other: 'Otro'
    }
    return translations[category] || category
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

  /**
   * 🆕 Consultar estado de tareas
   */
  async queryTasksStatus(message, userId, groupId) {
    try {
      console.log('\n📊 Consultando estado de tareas...')
      
      // Detectar si pregunta por tareas de alguien específico
      const userMatch = message.match(/tareas?\s+de\s+(?:@)?(\w+)/i)
      const targetUser = userMatch ? userMatch[1].toLowerCase() : null
      
      // Obtener objetivos del grupo
      const objectives = await ModelsObjective.getByGroupId(groupId)
      
      if (!objectives || objectives.length === 0) {
        return {
          success: true,
          action: 'tasks_query',
          message: '📋 No hay objetivos en este grupo todavía.'
        }
      }
      
      // Recopilar todas las tareas
      let allTasks = []
      for (const objective of objectives) {
        const tasks = await ModelsTask.getByObjectiveId(objective.id)
        allTasks = allTasks.concat(tasks.map(t => ({ ...t, objective_title: objective.title })))
      }
      
      if (allTasks.length === 0) {
        return {
          success: true,
          action: 'tasks_query',
          message: '📋 No hay tareas creadas todavía en este grupo.'
        }
      }
      
      // Filtrar por usuario si se especificó
      if (targetUser) {
        allTasks = allTasks.filter(t => 
          t.assigned_to && t.assigned_to.toLowerCase() === targetUser
        )
        
        if (allTasks.length === 0) {
          return {
            success: true,
            action: 'tasks_query',
            message: `📋 No hay tareas asignadas a **${targetUser}**.`
          }
        }
      }
      
      // Agrupar por estado
      const pending = allTasks.filter(t => t.status === 'pending')
      const inProgress = allTasks.filter(t => t.status === 'in_progress')
      const completed = allTasks.filter(t => t.status === 'completed')
      
      // Construir mensaje
      let responseMessage = `📊 **Estado de Tareas**${targetUser ? ` de **${targetUser}**` : ''}:\n\n`
      responseMessage += `📈 **Resumen:**\n`
      responseMessage += `- ✅ Completadas: **${completed.length}**\n`
      responseMessage += `- 🔄 En progreso: **${inProgress.length}**\n`
      responseMessage += `- ⏳ Pendientes: **${pending.length}**\n`
      responseMessage += `- 📊 Total: **${allTasks.length}**\n\n`
      
      // Mostrar tareas urgentes pendientes
      const urgentPending = pending.filter(t => t.priority === 'critical' || t.priority === 'high')
      if (urgentPending.length > 0) {
        responseMessage += `🚨 **Tareas Urgentes Pendientes:**\n`
        urgentPending.slice(0, 5).forEach(task => {
          responseMessage += `- **${task.title}** (${this.translatePriority(task.priority)})\n`
          if (task.deadline) responseMessage += `  📅 Vence: ${this.formatDate(task.deadline)}\n`
        })
      }
      
      return {
        success: true,
        action: 'tasks_query',
        data: { pending, inProgress, completed, total: allTasks.length },
        message: responseMessage
      }
      
    } catch (error) {
      console.error('❌ Error consultando tareas:', error)
      return {
        success: false,
        action: 'tasks_query_error',
        message: `❌ Error al consultar las tareas: ${error.message}`
      }
    }
  }

  /**
   * 🆕 Consultar información del grupo
   */
  async queryGroupInformation(message, userId, groupId) {
    try {
      console.log('\n👥 Consultando información del grupo...')
      
      const { ModelsGroup } = await import('../models/group.js')
      const { ModelsUser } = await import('../models/user.js')
      
      // Obtener información del grupo
      const group = await ModelsGroup.getById(groupId)
      
      if (!group) {
        return {
          success: false,
          action: 'group_query',
          message: '❌ No se pudo obtener información del grupo.'
        }
      }
      
      // Obtener miembros (esto depende de tu estructura de BD)
      // Aquí asumo que hay una función para obtener miembros
      let members = []
      try {
        members = await ModelsUser.getByGroupId(groupId)
      } catch (error) {
        console.log('⚠️ No se pudieron obtener los miembros:', error.message)
      }
      
      // Obtener estadísticas
      const objectives = await ModelsObjective.getByGroupId(groupId)
      let totalTasks = 0
      let completedTasks = 0
      
      for (const objective of objectives) {
        const tasks = await ModelsTask.getByObjectiveId(objective.id)
        totalTasks += tasks.length
        completedTasks += tasks.filter(t => t.status === 'completed').length
      }
      
      // Construir respuesta
      let responseMessage = `👥 **Información del Grupo: ${group.name}**\n\n`
      
      if (members.length > 0) {
        responseMessage += `📊 **Miembros:** ${members.length}\n`
        responseMessage += members.slice(0, 10).map(m => `- ${m.username || m.name || m.email}`).join('\n')
        if (members.length > 10) responseMessage += `\n...y ${members.length - 10} más`
        responseMessage += '\n\n'
      }
      
      responseMessage += `📈 **Estadísticas:**\n`
      responseMessage += `- 🎯 Objetivos: **${objectives.length}**\n`
      responseMessage += `- 📋 Tareas totales: **${totalTasks}**\n`
      responseMessage += `- ✅ Tareas completadas: **${completedTasks}**\n`
      
      if (totalTasks > 0) {
        const completionRate = ((completedTasks / totalTasks) * 100).toFixed(1)
        responseMessage += `- 📊 Tasa de completación: **${completionRate}%**\n`
      }
      
      return {
        success: true,
        action: 'group_query',
        data: { group, members, objectives, totalTasks, completedTasks },
        message: responseMessage
      }
      
    } catch (error) {
      console.error('❌ Error consultando grupo:', error)
      return {
        success: false,
        action: 'group_query_error',
        message: `❌ Error al consultar información del grupo: ${error.message}`
      }
    }
  }

  /**
   * 🆕 Listar tareas libres (sin asignar)
   */
  async listAvailableTasks(message, userId, groupId) {
    try {
      console.log('\n📋 Listando tareas libres...')
      
      // Obtener objetivos del grupo
      const objectives = await ModelsObjective.getByGroupId(groupId)
      
      if (!objectives || objectives.length === 0) {
        return {
          success: true,
          action: 'free_tasks_list',
          message: '📋 No hay objetivos en este grupo todavía.'
        }
      }
      
      // Recopilar tareas libres
      let freeTasks = []
      for (const objective of objectives) {
        const tasks = await ModelsTask.getByObjectiveId(objective.id)
        const free = tasks.filter(t => !t.assigned_to && t.status === 'pending')
        freeTasks = freeTasks.concat(free.map(t => ({ ...t, objective_title: objective.title })))
      }
      
      if (freeTasks.length === 0) {
        return {
          success: true,
          action: 'free_tasks_list',
          message: '🎉 No hay tareas libres en este momento. ¡Todas las tareas están asignadas o completadas!'
        }
      }
      
      // Ordenar por prioridad
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      freeTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      
      // Construir mensaje
      let responseMessage = `🆓 **Tareas Disponibles** (${freeTasks.length}):\n\n`
      
      freeTasks.slice(0, 10).forEach((task, index) => {
        responseMessage += `${index + 1}. **${task.title}**\n`
        responseMessage += `   🎯 Prioridad: ${this.translatePriority(task.priority)}\n`
        if (task.deadline) responseMessage += `   📅 Vence: ${this.formatDate(task.deadline)}\n`
        responseMessage += `   📂 Objetivo: ${task.objective_title}\n`
        responseMessage += `   💬 _Escribe "tomo la tarea" para asignártela_\n\n`
      })
      
      if (freeTasks.length > 10) {
        responseMessage += `...y ${freeTasks.length - 10} tareas más.\n\n`
      }
      
      responseMessage += `💡 **Tip:** Di "tomo la tarea [nombre]" para asignarte una tarea específica.`
      
      return {
        success: true,
        action: 'free_tasks_list',
        data: freeTasks,
        message: responseMessage
      }
      
    } catch (error) {
      console.error('❌ Error listando tareas libres:', error)
      return {
        success: false,
        action: 'free_tasks_error',
        message: `❌ Error al listar tareas: ${error.message}`
      }
    }
  }

  /**
   * 🆕 Asignar tarea al usuario (tomar tarea)
   */
  async assignTaskToUser(message, userId, groupId) {
    try {
      console.log('\n👤 Usuario tomando tarea...')
      
      // Detectar qué tarea quiere tomar
      const taskNameMatch = message.match(/tarea\s+(.+?)(?:\s*$|\.)/i)
      const taskName = taskNameMatch ? taskNameMatch[1].trim() : null
      
      // Obtener objetivos del grupo
      const objectives = await ModelsObjective.getByGroupId(groupId)
      
      // Buscar tarea libre que coincida
      let targetTask = null
      for (const objective of objectives) {
        const tasks = await ModelsTask.getByObjectiveId(objective.id)
        const freeTasks = tasks.filter(t => !t.assigned_to && t.status === 'pending')
        
        if (taskName) {
          // Buscar tarea específica por nombre
          targetTask = freeTasks.find(t => 
            t.title.toLowerCase().includes(taskName.toLowerCase())
          )
        } else {
          // Tomar la primera tarea libre con mayor prioridad
          const sorted = freeTasks.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
            return priorityOrder[a.priority] - priorityOrder[b.priority]
          })
          targetTask = sorted[0]
        }
        
        if (targetTask) break
      }
      
      if (!targetTask) {
        return {
          success: false,
          action: 'take_task',
          message: taskName 
            ? `❌ No encontré ninguna tarea libre llamada "${taskName}".`
            : '❌ No hay tareas libres disponibles en este momento.'
        }
      }
      
      // Asignar tarea al usuario
      const { ModelsUser } = await import('../models/user.js')
      const user = await ModelsUser.getById(userId)
      
      // Actualizar la tarea (necesitarías un método update en el modelo)
      // Por ahora, lo hacemos directamente
      const { getConnection } = await import('../config/db.js')
      const connection = await getConnection()
      
      await connection.execute(
        'UPDATE tasks SET assigned_to = ? WHERE id = ?',
        [userId, targetTask.id]
      )
      
      connection.end()
      
      return {
        success: true,
        action: 'task_assigned',
        data: { task: targetTask, user },
        message: `✅ **¡Tarea asignada exitosamente!**\n\n📋 **${targetTask.title}**\n👤 Asignada a: **${user.username || user.email}**\n🎯 Prioridad: **${this.translatePriority(targetTask.priority)}**${targetTask.deadline ? `\n📅 Fecha límite: **${this.formatDate(targetTask.deadline)}**` : ''}\n\n💪 ¡Mucho éxito con esta tarea!`
      }
      
    } catch (error) {
      console.error('❌ Error asignando tarea:', error)
      return {
        success: false,
        action: 'take_task_error',
        message: `❌ Error al tomar la tarea: ${error.message}`
      }
    }
  }
}

// Exportar instancia singleton
const nlpActionService = new NLPActionService()
export default nlpActionService
