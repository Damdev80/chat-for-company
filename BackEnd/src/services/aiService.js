// src/services/aiService.js - Servicio de IA con Anthropic Claude
import Anthropic from '@anthropic-ai/sdk'
import { executeQuery } from '../config/turso.js'

export class AIService {
  constructor() {
    this.anthropic = null
    this.isInitialized = false
    
    // Solo inicializar si tenemos la API key
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        this.anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY
        })
        this.isInitialized = true
        console.log('✅ AIService initialized with Anthropic Claude')
      } catch (error) {
        console.warn('⚠️ Error initializing Anthropic:', error.message)
        this.isInitialized = false
      }
    } else {
      console.warn('⚠️ ANTHROPIC_API_KEY not found. Running in demo mode.')
    }
  }

  // Prompt del sistema con restricciones de seguridad
  getSystemPrompt() {
    return `Eres un asistente de apoyo útil y amigable para una aplicación de chat colaborativo. 
Tu función es ayudar a los usuarios con preguntas sobre la aplicación, sus funcionalidades, y brindar apoyo general.

RESTRICCIONES DE SEGURIDAD (CRÍTICAS):
- NUNCA acceder, mostrar o mencionar contraseñas, tokens, API keys o información sensible
- NUNCA ejecutar comandos SQL que modifiquen la base de datos (INSERT, UPDATE, DELETE, DROP, CREATE, ALTER)
- SOLO puedes hacer consultas de lectura (SELECT) en tablas permitidas
- NO acceder a tablas de usuarios, sesiones o información personal sensible
- NO proporcionar información específica de otros usuarios
- Si no puedes ayudar con algo por seguridad, explica el motivo amablemente

FUNCIONALIDADES QUE PUEDES EXPLICAR:
- Cómo usar el chat grupal
- Cómo crear y gestionar objetivos y tareas
- Cómo usar el muro de ideas colaborativo
- Cómo usar el calendario de fechas especiales
- Características generales de la aplicación
- Consejos de productividad y colaboración

TABLAS PERMITIDAS PARA CONSULTA (SOLO SELECT):
- objectives (objetivos del grupo)
- tasks (tareas de objetivos)
- ideas (ideas del muro colaborativo)
- events (eventos del calendario)

Responde de manera amigable, concisa y útil. Si no puedes hacer algo por restricciones de seguridad, explica por qué no es posible y ofrece alternativas.`
  }

  // Herramientas seguras disponibles para el asistente
  getTools() {
    return [
      {
        name: "get_group_objectives",
        description: "Obtener objetivos de un grupo específico",
        input_schema: {
          type: "object",
          properties: {
            group_id: {
              type: "string",
              description: "ID del grupo"
            },
            limit: {
              type: "number",
              description: "Número máximo de objetivos a obtener (máximo 20)",
              maximum: 20,
              default: 10
            }
          },
          required: ["group_id"]
        }
      },
      {
        name: "get_group_ideas",
        description: "Obtener ideas del muro colaborativo de un grupo",
        input_schema: {
          type: "object",
          properties: {
            group_id: {
              type: "string", 
              description: "ID del grupo"
            },
            limit: {
              type: "number",
              description: "Número máximo de ideas a obtener (máximo 20)",
              maximum: 20,
              default: 10
            }
          },
          required: ["group_id"]
        }
      },
      {
        name: "get_group_events",
        description: "Obtener eventos del calendario de un grupo",
        input_schema: {
          type: "object",
          properties: {
            group_id: {
              type: "string",
              description: "ID del grupo"
            },
            limit: {
              type: "number", 
              description: "Número máximo de eventos a obtener (máximo 20)",
              maximum: 20,
              default: 10
            }
          },
          required: ["group_id"]
        }
      }
    ]
  }

  // Ejecutar herramienta de forma segura
  async executeTool(toolName, input) {
    try {
      switch (toolName) {
        case 'get_group_objectives':
          return await this.getGroupObjectives(input.group_id, input.limit || 10)
        
        case 'get_group_ideas':
          return await this.getGroupIdeas(input.group_id, input.limit || 10)
        
        case 'get_group_events':
          return await this.getGroupEvents(input.group_id, input.limit || 10)
        
        default:
          throw new Error(`Herramienta no reconocida: ${toolName}`)
      }
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error)
      return { error: `Error al ejecutar ${toolName}: ${error.message}` }
    }
  }

  // Obtener objetivos del grupo (SOLO LECTURA)
  async getGroupObjectives(groupId, limit = 10) {
    const query = `
      SELECT id, title, description, deadline, created_at
      FROM objectives 
      WHERE group_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `
    const result = await executeQuery(query, [groupId, Math.min(limit, 20)])
    return { objectives: result }
  }

  // Obtener ideas del grupo (SOLO LECTURA)
  async getGroupIdeas(groupId, limit = 10) {
    const query = `
      SELECT i.id, i.title, i.description, i.category, i.priority, i.status, i.votes, i.created_at
      FROM ideas i
      WHERE i.group_id = ?
      ORDER BY i.votes DESC, i.created_at DESC
      LIMIT ?
    `
    const result = await executeQuery(query, [groupId, Math.min(limit, 20)])
    return { ideas: result }
  }

  // Obtener eventos del grupo (SOLO LECTURA)  
  async getGroupEvents(groupId, limit = 10) {
    const query = `
      SELECT id, title, description, event_date, event_time, event_type, priority, status, created_at
      FROM events
      WHERE group_id = ?
      ORDER BY event_date ASC
      LIMIT ?
    `
    const result = await executeQuery(query, [groupId, Math.min(limit, 20)])
    return { events: result }
  }

  // Procesar mensaje del usuario
  async processMessage(userMessage, conversationHistory = [], groupId = null) {
    try {
      // Modo demo si no hay API key
      if (!this.isInitialized) {
        return this.getDemoResponse(userMessage)
      }

      // Construir mensajes de la conversación
      const messages = [
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: userMessage
        }
      ]

      // Llamada a la API de Anthropic
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        system: this.getSystemPrompt(),
        messages: messages,
        tools: this.getTools()
      })

      // Procesar la respuesta
      let finalResponse = ''
      let toolResults = []

      for (const content of response.content) {
        if (content.type === 'text') {
          finalResponse += content.text
        } else if (content.type === 'tool_use') {
          // Ejecutar herramienta si está disponible y es segura
          const toolResult = await this.executeTool(content.name, content.input)
          toolResults.push({
            tool: content.name,
            input: content.input,
            result: toolResult
          })
          
          // Agregar contexto de la herramienta a la respuesta
          if (!toolResult.error) {
            finalResponse += `\n\n[Información consultada de la base de datos]`
          }
        }
      }

      return {
        content: finalResponse || 'Lo siento, no pude procesar tu mensaje en este momento.',
        usage: response.usage,
        toolResults: toolResults
      }

    } catch (error) {
      console.error('Error in AIService.processMessage:', error)
      
      // Respuesta de error amigable
      return {
        content: 'Lo siento, tuve un problema técnico al procesar tu mensaje. Por favor intenta de nuevo en unos momentos. 🔧',
        error: error.message
      }
    }
  }

  // Respuestas demo cuando no hay API key
  getDemoResponse(message) {
    const demoResponses = [
      {
        keywords: ['hola', 'hello', 'hi', 'saludos'],
        response: '¡Hola! 👋 Soy tu asistente de apoyo. Estoy aquí para ayudarte con cualquier pregunta sobre la aplicación. ¿En qué puedo ayudarte hoy?'
      },
      {
        keywords: ['ayuda', 'help', 'como', 'cómo'],
        response: 'Puedo ayudarte con:\n\n• 💬 Uso del chat grupal\n• 🎯 Crear y gestionar objetivos\n• 💡 Muro de ideas colaborativo\n• 📅 Calendario de fechas especiales\n• ⚙️ Funciones de la aplicación\n\n¿Sobre qué te gustaría saber más?'
      },
      {
        keywords: ['objetivos', 'objetivo', 'metas', 'goals'],
        response: '🎯 **Objetivos y Tareas:**\n\nPuedes crear objetivos para tu grupo y asignar tareas específicas. Los objetivos te ayudan a mantener al equipo enfocado y organizado.\n\n¿Te gustaría saber cómo crear un nuevo objetivo?'
      },
      {
        keywords: ['ideas', 'idea', 'muro', 'sugerencias'],
        response: '💡 **Muro de Ideas:**\n\nEl muro de ideas es un espacio colaborativo donde todos pueden proponer y votar por ideas. ¡Es perfecto para lluvia de ideas y recoger feedback del equipo!\n\n¿Quieres saber cómo agregar una nueva idea?'
      },
      {
        keywords: ['calendario', 'fechas', 'eventos', 'calendar'],
        response: '📅 **Calendario de Fechas Especiales:**\n\nPuedes crear eventos importantes, fechas límite, reuniones y celebraciones. El calendario mantiene a todos informados sobre próximos eventos.\n\n¿Te ayudo a crear un nuevo evento?'
      }
    ]

    const lowerMessage = message.toLowerCase()
    
    for (const demo of demoResponses) {
      if (demo.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return {
          content: demo.response,
          demo: true
        }
      }
    }

    return {
      content: '🤖 **Modo Demo Activado**\n\nHola! Soy tu asistente de apoyo. Actualmente estoy en modo demo, pero puedo ayudarte con información sobre:\n\n• Cómo usar las funciones de la aplicación\n• Crear objetivos y tareas\n• Usar el muro de ideas\n• Gestionar el calendario\n\n¿En qué puedo ayudarte?',
      demo: true
    }
  }
}

// Instancia singleton
export const aiService = new AIService()
