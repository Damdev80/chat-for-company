import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  User, 
  Target, 
  Calendar,
  TrendingUp,
  AlertCircle,
  Flag
} from 'lucide-react';
import { fetchMyTasks, markTaskCompleted } from '../utils/api';
import { getToken } from '../utils/auth';

const UserTaskView = ({ onTaskUpdate }) => {
  const [tasks, setTasks] = useState([]);
  // const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [filter, setFilter] = useState('all'); // all, pending, completed

  useEffect(() => {
    loadTasks();
    // loadStats();
  }, []);

  const loadTasks = async () => {
    try {
      const token = getToken();
      const response = await fetchMyTasks(token);
      setTasks(response.tasks || []);
    } catch (error) {
      console.error('Error al cargar mis tareas:', error);
    } finally {
      setLoading(false);
    }
  };

  // const loadStats = async () => {
  //   try {
  //     const token = getToken();
  //     const response = await fetchUserTaskStats(token);
  //     setStats(response.stats || null);
  //   } catch (error) {
  //     console.error('Error al cargar estadísticas:', error);
  //   }
  // };
  const handleComplete = async (taskId) => {
    try {
      console.log('UserTaskView: Starting task completion for taskId:', taskId);
      const token = getToken();
      await markTaskCompleted(taskId, token);
      console.log('UserTaskView: Task marked as completed');
      await loadTasks();
      console.log('UserTaskView: Tasks reloaded');
      
      // Notify parent component about task update to refresh ObjectiveProgress
      if (onTaskUpdate) {
        console.log('UserTaskView: Calling onTaskUpdate callback');
        await onTaskUpdate();
        console.log('UserTaskView: onTaskUpdate callback completed');
      } else {
        console.warn('UserTaskView: onTaskUpdate callback is not provided');
      }
      
      // await loadStats();
    } catch (error) {
      console.error('Error al completar tarea:', error);
      alert('Error al completar la tarea');
    }
  };

  // Filtering is disabled since filter state is unused
  const getFilteredTasks = () => tasks;  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-[#4ADE80]" />;
      case 'pending':
        return <Clock size={16} className="text-orange-400" />;
      default:
        return <AlertCircle size={16} className="text-[#A0A0B0]" />;
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
                          : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {task.status === 'completed' ? 'Completada' : 'Pendiente'}
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
                      {task.completed_at && (
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>Completado: {formatDate(task.completed_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {task.status === 'pending' && (
                    <div className="ml-4">
                      <button
                        onClick={() => handleComplete(task.id)}
                        className="bg-[#4ADE80] hover:bg-[#4ADE80]/80 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <CheckCircle size={16} />
                        <span>Completar</span>
                      </button>
                    </div>
                  )}
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
