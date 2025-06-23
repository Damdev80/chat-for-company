import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  User, 
  Calendar, 
  Target, 
  CheckCircle, 
  Clock,
  AlertCircle,
  X,
  Flag,
  Users,
  Eye,
  RotateCcw
} from 'lucide-react';
import { 
  fetchTasksByObjective, 
  createTask, 
  updateTask, 
  deleteTask, 
  markTaskCompleted,
  fetchUsers 
} from '../utils/api';
import { getToken } from '../utils/auth';

const TaskManager = ({ objectiveId, onTaskUpdate }) => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    priority: 'medium',
    due_date: ''
  });
  const loadTasks = useCallback(async () => {
    try {
      const token = getToken();
      const response = await fetchTasksByObjective(objectiveId, token);
      setTasks(response.tasks || []);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
    } finally {
      setLoading(false);
    }
  }, [objectiveId]);

  const loadUsers = useCallback(async () => {
    try {
      const token = getToken();
      const response = await fetchUsers(token);
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  }, []); // Added useCallback and empty dependency array as fetchUsers and setUsers are stable

  useEffect(() => {
    loadTasks();
    loadUsers();
  }, [loadTasks, loadUsers]); // Added loadUsers to dependency array

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      
      console.log('Datos a enviar:', {
        ...formData,
        objective_id: objectiveId
      });
      
      if (editingTask) {
        console.log('Actualizando tarea:', editingTask.id);
        await updateTask(editingTask.id, formData, token);
      } else {
        console.log('Creando nueva tarea...');
        const response = await createTask({
          ...formData,
          objective_id: objectiveId
        }, token);
        console.log('Respuesta del servidor:', response);
      }
        await loadTasks();
      resetForm();
      console.log('TaskManager: Task saved successfully, calling onTaskUpdate...');
      if (onTaskUpdate) {
        await onTaskUpdate();
        console.log('TaskManager: onTaskUpdate called after save');
      }
    } catch (error) {
      console.error('Error al guardar tarea:', error);
      console.error('Detalles del error:', error.message);
      alert(`Error al guardar la tarea: ${error.message}`);
    }
  };
  const handleDelete = async (taskId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return;
    
    try {
      console.log('TaskManager: Deleting task', taskId);
      const token = getToken();
      await deleteTask(taskId, token);
      console.log('TaskManager: Task deleted successfully, reloading tasks...');
      await loadTasks();
      console.log('TaskManager: Tasks reloaded, calling onTaskUpdate...');
      if (onTaskUpdate) {
        await onTaskUpdate();
        console.log('TaskManager: onTaskUpdate called after delete');
      }
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      alert('Error al eliminar la tarea');
    }
  };

  const handleComplete = async (taskId) => {
    try {
      console.log('TaskManager: Completing task', taskId);
      const token = getToken();
      await markTaskCompleted(taskId, token);      console.log('TaskManager: Task completed successfully, reloading tasks...');
      await loadTasks();
      console.log('TaskManager: Tasks reloaded, calling onTaskUpdate...');
      if (onTaskUpdate) {
        console.log('TaskManager: About to call onTaskUpdate function');
        await onTaskUpdate();
        console.log('TaskManager: onTaskUpdate called successfully');
      } else {
        console.warn('TaskManager: onTaskUpdate is not defined!');
      }
    } catch (error) {
      console.error('Error al completar tarea:', error);
      alert('Error al completar la tarea');
    }
  };  const resetForm = () => {
    setFormData({ 
      title: '', 
      description: '', 
      assigned_to: '', 
      priority: 'medium',
      due_date: ''
    });
    setShowCreateForm(false);
    setEditingTask(null);
  };  const startEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      assigned_to: task.assigned_to || '',
      priority: task.priority || 'medium',
      due_date: task.due_date ? task.due_date.split('T')[0] : '' // Formatear fecha para input date
    });
    setShowCreateForm(true);
  };const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-[#4ADE80]" />;
      case 'pending':
        return <Clock size={16} className="text-orange-400" />;
      case 'in_review':
        return <Eye size={16} className="text-blue-400" />;
      case 'returned':
        return <RotateCcw size={16} className="text-red-400" />;
      default:
        return <AlertCircle size={16} className="text-[#A0A0B0]" />;
    }
  };
  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'pending':
        return 'Pendiente';
      case 'in_review':
        return 'En Revisión';
      case 'returned':
        return 'Devuelta';
      default:
        return 'Desconocido';
    }
  };

  const getPriorityDisplay = (priority) => {
    switch (priority) {
      case 'low':
        return { icon: '🟢', text: 'Baja', color: 'text-green-400' };
      case 'medium':
        return { icon: '🟡', text: 'Media', color: 'text-yellow-400' };
      case 'high':
        return { icon: '🟠', text: 'Alta', color: 'text-orange-400' };
      case 'critical':
        return { icon: '🔴', text: 'Crítica', color: 'text-red-400' };
      default:
        return { icon: '🟡', text: 'Media', color: 'text-yellow-400' };
    }
  };
  if (loading) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-[#2D2D3A] rounded mb-3 sm:mb-4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#2D2D3A] h-20 sm:h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }  return (
    <div className="p-3 sm:p-4 lg:p-6 pb-4 sm:pb-6 lg:pb-8 space-y-4 sm:space-y-6">
      {/* Header con botón de ayuda */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2 min-w-0">
          <Target size={18} className="sm:w-5 sm:h-5 text-[#4ADE80] flex-shrink-0" />
          <span className="truncate">Tareas del Objetivo</span>
        </h3>
        <div className="flex items-center space-x-2 flex-shrink-0">
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 bg-[#4ADE80] hover:bg-[#4ADE80]/80 text-black px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all text-sm sm:text-base whitespace-nowrap"
            >
              <Plus size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Nueva Tarea</span>
              <span className="sm:hidden">Nueva</span>
            </button>
          )}
        </div>
      </div>      {/* Guía de uso (solo cuando no hay tareas) */}
      {tasks.length === 0 && !showCreateForm && (
        <div className="bg-gradient-to-r from-[#4ADE80]/10 to-[#60A5FA]/10 border border-[#4ADE80]/20 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="p-2 bg-[#4ADE80]/20 rounded-lg flex-shrink-0">
              <User size={18} className="sm:w-5 sm:h-5 text-[#4ADE80]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm sm:text-base font-semibold text-white mb-2 sm:mb-3">
                💡 Cómo crear y gestionar tareas efectivamente
              </h4>
              <ul className="text-xs sm:text-sm text-[#A0A0B0] space-y-1.5 sm:space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 bg-[#4ADE80] text-black rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                  <span>Haz clic en "Nueva Tarea" para crear una tarea</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 bg-[#60A5FA] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                  <span>Escribe un título descriptivo y selecciona la prioridad</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 bg-[#FBBF24] text-black rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                  <span>Asigna la tarea a un usuario específico o déjala libre</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 bg-[#F87171] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                  <span>Opcionalmente, agrega una descripción detallada</span>
                </li>
              </ul>
              <div className="mt-3 p-2 sm:p-3 bg-[#2D2D3A] rounded-lg">
                <p className="text-xs sm:text-sm text-[#4ADE80] font-medium">
                  ✅ Las tareas se organizan por prioridad y los usuarios asignados las verán en "Mis Tareas"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg p-3 sm:p-4 shadow-lg">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h4 className="font-medium text-white flex items-center space-x-2 text-sm sm:text-base">
              <Plus size={14} className="sm:w-4 sm:h-4 text-[#4ADE80]" />
              <span>{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</span>
            </h4>
            <button
              onClick={resetForm}
              className="text-[#A0A0B0] hover:text-white hover:bg-[#3C3C4E] rounded-lg p-1 sm:p-1.5 transition-colors"
              title="Cerrar formulario"
            >
              <X size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Title field - full width */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-white mb-1 sm:mb-2">
                Título *
              </label>
              <input
                type="text"
                autoComplete="off"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-[#1E1E2E] border border-[#3C3C4E] rounded-lg px-3 py-2 sm:py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:border-transparent transition-all text-sm sm:text-base"
                placeholder="Ingresa el título de la tarea"
                required
              />
            </div>

            {/* Grid layout for priority and user assignment - responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {/* Priority Selection */}
              <div>
                <label className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-white mb-1 sm:mb-2">
                  <Flag size={12} className="sm:w-[14px] sm:h-[14px] text-[#4ADE80]" />
                  <span>Prioridad / Importancia</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full bg-[#1E1E2E] border border-[#3C3C4E] rounded-lg px-3 py-2 sm:py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:border-transparent transition-all text-sm sm:text-base"
                >
                  <option value="low" className="text-white">🟢 Baja - No urgente</option>
                  <option value="medium" className="text-white">🟡 Media - Importante</option>
                  <option value="high" className="text-white">🟠 Alta - Urgente</option>
                  <option value="critical" className="text-white">🔴 Crítica - Muy urgente</option>
                </select>
                <p className="text-xs text-[#A0A0B0] mt-1">
                  {formData.priority === 'low' && "✅ Puede realizarse cuando haya tiempo"}
                  {formData.priority === 'medium' && "⚠️ Debe completarse en tiempo razonable"}
                  {formData.priority === 'high' && "🚨 Requiere atención pronta"}
                  {formData.priority === 'critical' && "🚩 Necesita atención inmediata"}
                </p>
              </div>

              {/* User Assignment */}
              <div>
                <label className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-white mb-1 sm:mb-2">
                  <User size={12} className="sm:w-[14px] sm:h-[14px] text-[#4ADE80]" />
                  <span>Asignar a Usuario</span>
                </label>
                <select
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                  className="w-full bg-[#1E1E2E] border border-[#3C3C4E] rounded-lg px-3 py-2 sm:py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:border-transparent transition-all text-sm sm:text-base"
                >
                  <option value="" className="text-[#A0A0B0]">🔄 Sin asignar (tarea libre)</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id} className="text-white">
                      👤 {user.username}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[#A0A0B0] mt-1">
                  {formData.assigned_to 
                    ? "✅ La tarea será asignada al usuario seleccionado" 
                    : "⚠️ Tarea libre - cualquiera puede completarla"
                  }
                </p>
              </div>
            </div>            {/* Description field - full width */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-white mb-1 sm:mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-[#1E1E2E] border border-[#3C3C4E] rounded-lg px-3 py-2 sm:py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:border-transparent transition-all resize-none text-sm sm:text-base"
                placeholder="Describe la tarea en detalle (opcional)"
                rows="3"
              />
            </div>

            {/* Due date field */}
            <div>
              <label className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-white mb-1 sm:mb-2">
                <Calendar size={12} className="sm:w-[14px] sm:h-[14px] text-[#4ADE80]" />
                <span>Fecha Límite</span>
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                className="w-full bg-[#1E1E2E] border border-[#3C3C4E] rounded-lg px-3 py-2 sm:py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:border-transparent transition-all text-sm sm:text-base"
                min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
              />
              <p className="text-xs text-[#A0A0B0] mt-1 break-words">
                {formData.due_date 
                  ? `📅 Fecha límite establecida para ${new Date(formData.due_date).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}` 
                  : "⚠️ Sin fecha límite - opcional pero recomendado"
                }
              </p>
            </div>

            {/* Buttons - responsive */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-2 sm:pt-3 border-t border-[#3C3C4E]">
              <button
                type="button"
                onClick={resetForm}
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-[#A0A0B0] border border-[#3C3C4E] rounded-lg hover:bg-[#3C3C4E] hover:text-white transition-colors text-sm sm:text-base"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[#4ADE80] hover:bg-[#3BC470] text-black rounded-lg transition-colors font-medium text-sm sm:text-base"
              >
                {editingTask ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}      {/* Tasks List */}
      <div className="space-y-2 sm:space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-6 sm:py-8 mb-4 sm:mb-6 text-[#A0A0B0] bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg">
            <Target size={40} className="sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-[#4ADE80]" />
            <p className="font-medium text-white mb-2 text-sm sm:text-base">No hay tareas para este objetivo</p>
            <p className="text-xs sm:text-sm mb-3 sm:mb-4 px-4">Las tareas te ayudan a dividir el objetivo en pasos manejables</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-[#4ADE80] hover:bg-[#3BC470] text-black px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg transition-colors font-medium text-sm sm:text-base"
            >
              Crear Primera Tarea
            </button>
          </div>
        ) : (
          tasks.map(task => (
            <div
              key={task.id}
              className={`border rounded-lg p-3 sm:p-4 transition-all ${
                task.status === 'completed' 
                  ? 'bg-[#4ADE80]/10 border-[#4ADE80]/30' 
                  : task.status === 'in_review'
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : task.status === 'returned'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-[#2D2D3A] border-[#3C3C4E] hover:border-[#4ADE80]/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      {getStatusIcon(task.status)}
                      <h4 className={`font-medium text-sm sm:text-base truncate ${
                        task.status === 'completed' ? 'line-through text-[#A0A0B0]' : 'text-white'
                      }`}>
                        {task.title}
                      </h4>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                        task.status === 'completed' 
                          ? 'bg-[#4ADE80]/20 text-[#4ADE80]' 
                          : task.status === 'in_review'
                          ? 'bg-blue-500/20 text-blue-400'
                          : task.status === 'returned'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-orange-400/20 text-orange-400'
                      }`}>
                        {getStatusText(task.status)}
                      </span>
                      {/* Priority indicator */}
                      {task.priority && (
                        <span className={`text-xs px-2 py-1 rounded-full bg-gray-700/50 ${getPriorityDisplay(task.priority).color} flex items-center space-x-1 whitespace-nowrap`}>
                          <span>{getPriorityDisplay(task.priority).icon}</span>
                          <span className="hidden sm:inline">{getPriorityDisplay(task.priority).text}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {task.description && (
                    <p className="text-xs sm:text-sm text-[#A0A0B0] line-clamp-2 break-words">{task.description}</p>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-[#A0A0B0]">
                    {task.assigned_to_name ? (
                      <div className="flex items-center space-x-1 bg-[#4ADE80]/10 px-2 py-1 rounded-lg w-fit">
                        <User size={12} className="sm:w-[14px] sm:h-[14px] text-[#4ADE80] flex-shrink-0" />
                        <span className="text-[#4ADE80] font-medium truncate">👤 {task.assigned_to_name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 bg-[#A0A0B0]/10 px-2 py-1 rounded-lg w-fit">
                        <Users size={12} className="sm:w-[14px] sm:h-[14px] text-[#A0A0B0] flex-shrink-0" />
                        <span className="text-[#A0A0B0]">🔄 Tarea libre</span>
                      </div>
                    )}

                    {/* Due date display */}
                    {task.due_date && (
                      <div className="flex items-center space-x-1 bg-blue-500/10 px-2 py-1 rounded-lg w-fit">
                        <Calendar size={12} className="sm:w-[14px] sm:h-[14px] text-blue-400 flex-shrink-0" />
                        <span className="text-blue-400 font-medium whitespace-nowrap">
                          📅 {new Date(task.due_date).toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'short',
                            year: new Date(task.due_date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 sm:ml-4">
                  {task.status === 'pending' && (
                    <button
                      onClick={() => handleComplete(task.id)}
                      className="p-1.5 sm:p-2 text-[#4ADE80] hover:bg-[#4ADE80]/20 rounded-lg transition-colors"
                      title="Marcar como completada"
                    >
                      <CheckCircle size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => startEdit(task)}
                    className="p-1.5 sm:p-2 text-blue-400 hover:bg-blue-400/20 rounded-lg transition-colors"
                    title="Editar tarea"
                  >
                    <Edit3 size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-1.5 sm:p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                    title="Eliminar tarea"
                  >
                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskManager;
