import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, 
  Clock, 
  User, 
  Target, 
  Calendar,
  TrendingUp,
  AlertCircle,
  Flag,
  Eye,
  RotateCcw,
  Send
} from 'lucide-react';
import { fetchMyTasks, submitTaskForReview } from '../utils/api';
import { getToken } from '../utils/auth';

const UserTaskView = ({ groupId, onTaskUpdate }) => {
  const [tasks, setTasks] = useState([]);
  // const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [filter, setFilter] = useState('all'); // all, pending, completed
  
  const loadTasks = useCallback(async () => {
    try {
      const token = getToken();
      const response = await fetchMyTasks(token);
      let filteredTasks = response.tasks || [];
      
      // Filtrar por grupo si se especifica
      if (groupId && groupId !== 'global') {
        filteredTasks = filteredTasks.filter(task => task.group_id === groupId);
      }
      
      // Si showOnlyMyTasks es true, ya fetchMyTasks devuelve solo las tareas del usuario
      // No necesitamos filtrado adicional aquí
      
      setTasks(filteredTasks);
    } catch (error) {
      console.error('Error al cargar mis tareas:', error);
    } finally {
      setLoading(false);
    }
  }, [groupId]); // Incluimos groupId como dependencia

  useEffect(() => {
    loadTasks();
    // loadStats();
  }, [loadTasks]); // Ahora loadTasks es estable

  // const loadStats = async () => {
  //   try {
  //     const token = getToken();
  //     const response = await fetchUserTaskStats(token);
  //     setStats(response.stats || null);
  //   } catch (error) {
  //     console.error('Error al cargar estadísticas:', error);
  //   }
  // };
  // const handleComplete = async (taskId) => {
  //   try {
  //     console.log('UserTaskView: Starting task completion for taskId:', taskId);
  //     const token = getToken();
  //     await markTaskCompleted(taskId, token);
  //     console.log('UserTaskView: Task marked as completed');
  //     await loadTasks();
  //     console.log('UserTaskView: Tasks reloaded');
  //     
  //     // Notify parent component about task update to refresh ObjectiveProgress
  //     if (onTaskUpdate) {
  //       console.log('UserTaskView: Calling onTaskUpdate callback');
  //       await onTaskUpdate();
  //       console.log('UserTaskView: onTaskUpdate callback completed');
  //     } else {
  //       console.warn('UserTaskView: onTaskUpdate callback is not provided');
  //     }
  //     
  //     // await loadStats();
  //   } catch (error) {
  //     console.error('Error al completar tarea:', error);
  //     alert('Error al completar la tarea');
  //   }
  // };

  const handleSubmitForReview = async (taskId) => {
    try {
      console.log('UserTaskView: Submitting task for review:', taskId);
      const token = getToken();
      await submitTaskForReview(taskId, token);
      console.log('UserTaskView: Task submitted for review');
      await loadTasks();
      console.log('UserTaskView: Tasks reloaded');
      
      // Notify parent component about task update
      if (onTaskUpdate) {
        console.log('UserTaskView: Calling onTaskUpdate callback');
        await onTaskUpdate();
        console.log('UserTaskView: onTaskUpdate callback completed');
      } else {
        console.warn('UserTaskView: onTaskUpdate callback is not provided');
      }
    } catch (error) {
      console.error('Error al enviar tarea a revisión:', error);
      alert('Error al enviar la tarea a revisión');
    }
  };

  // Filtering is disabled since filter state is unused
  const getFilteredTasks = () => tasks;  const getStatusIcon = (status) => {
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-[#2D2D3A] rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#2D2D3A] h-20 rounded-lg"></div>
            ))}
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#2D2D3A] h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }  return (
    <div className="p-6">
      <div className="space-y-4">
        {/* Encabezado */}
        <div>
          <h1 className="text-xl font-bold text-white mb-1">Mis Tareas</h1>
          <p className="text-gray-400 text-sm">Gestiona tus tareas asignadas</p>
        </div>{loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-[#2D2D3A] rounded-lg"></div>
            ))}
          </div>
        ) : getFilteredTasks().length > 0 ? (
          <div className="space-y-3">
            {getFilteredTasks().map(task => (
              <div
                key={task.id}
                className={`bg-[#2D2D3A] border rounded-lg p-4 transition-all ${
                  task.status === 'completed' 
                    ? 'border-[#4ADE80] bg-[#4ADE80]/10' 
                    : 'border-[#3C3C4E] hover:border-[#4ADE80]/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-2">                    <div className="flex items-center space-x-2">
                      {getStatusIcon(task.status)}
                      <h4 className={`font-medium ${
                        task.status === 'completed' ? 'line-through text-[#A0A0B0]' : 'text-white'
                      }`}>
                        {task.title}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.status === 'completed' 
                          ? 'bg-[#4ADE80]/20 text-[#4ADE80]' 
                          : task.status === 'in_review'
                          ? 'bg-blue-500/20 text-blue-400'
                          : task.status === 'returned'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {getStatusText(task.status)}
                      </span>
                      {/* Priority indicator */}
                      {task.priority && (
                        <span className={`text-xs px-2 py-1 rounded-full bg-gray-700/50 ${getPriorityDisplay(task.priority).color} flex items-center space-x-1`}>
                          <span>{getPriorityDisplay(task.priority).icon}</span>
                          <span>{getPriorityDisplay(task.priority).text}</span>
                        </span>
                      )}
                    </div>
                      {task.description && (
                      <p className="text-sm text-[#A0A0B0]">{task.description}</p>
                    )}

                    {/* Mostrar comentarios de revisión si la tarea fue devuelta */}
                    {task.status === 'returned' && task.review_comments && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                        <h5 className="text-red-400 font-medium text-sm mb-1">Comentarios de revisión:</h5>
                        <p className="text-red-300 text-sm">{task.review_comments}</p>
                        {task.reviewed_by_name && (
                          <p className="text-red-400/70 text-xs mt-1">Revisado por: {task.reviewed_by_name}</p>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-[#A0A0B0]">
                      <div className="flex items-center space-x-1">
                        <Target size={14} />
                        <span>Objetivo: {task.objective_title}</span>
                      </div>
                      {task.created_by_name && (
                        <div className="flex items-center space-x-1">
                          <User size={14} />
                          <span>Asignado por: {task.created_by_name}</span>
                        </div>
                      )}
                      
                      {/* Due date display */}
                      {task.due_date && (
                        <div className="flex items-center space-x-1 text-blue-400">
                          <Calendar size={14} />
                          <span>Fecha límite: {formatDate(task.due_date)}</span>
                        </div>
                      )}
                      
                      {task.completed_at && (
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>Completado: {formatDate(task.completed_at)}</span>
                        </div>
                      )}
                    </div>                  </div>
                  
                  {/* Botones de acción según el estado */}
                  <div className="ml-4 flex flex-col space-y-2">
                    {task.status === 'pending' && (
                      <button
                        onClick={() => handleSubmitForReview(task.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <Send size={16} />
                        <span>Enviar a Revisión</span>
                      </button>
                    )}
                    
                    {task.status === 'returned' && (
                      <button
                        onClick={() => handleSubmitForReview(task.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <Send size={16} />
                        <span>Reenviar a Revisión</span>
                      </button>
                    )}
                    
                    {task.status === 'in_review' && (
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2">
                        <div className="flex items-center space-x-2 text-blue-400">
                          <Eye size={16} />
                          <span className="text-sm font-medium">En Revisión</span>
                        </div>
                        <p className="text-blue-300/70 text-xs mt-1">Esperando aprobación del administrador</p>
                      </div>
                    )}
                    
                    {task.status === 'completed' && (
                      <div className="bg-[#4ADE80]/10 border border-[#4ADE80]/30 rounded-lg px-3 py-2">
                        <div className="flex items-center space-x-2 text-[#4ADE80]">
                          <CheckCircle size={16} />
                          <span className="text-sm font-medium">Completada</span>
                        </div>
                        {task.reviewed_by_name && (
                          <p className="text-[#4ADE80]/70 text-xs mt-1">Aprobada por: {task.reviewed_by_name}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>        ) : (
          <div className="text-center py-6 bg-[#2D2D3A] rounded-lg border border-[#3C3C4E]">
            <p className="text-gray-400">No tienes tareas asignadas actualmente.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTaskView;
