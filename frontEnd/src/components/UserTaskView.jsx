import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  User, 
  Target, 
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { fetchMyTasks, markTaskCompleted, fetchUserTaskStats } from '../utils/api';
import { getToken } from '../utils/auth';

const UserTaskView = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed

  useEffect(() => {
    loadTasks();
    loadStats();
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

  const loadStats = async () => {
    try {
      const token = getToken();
      const response = await fetchUserTaskStats(token);
      setStats(response.stats || null);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handleComplete = async (taskId) => {
    try {
      const token = getToken();
      await markTaskCompleted(taskId, token);
      await loadTasks();
      await loadStats();
    } catch (error) {
      console.error('Error al completar tarea:', error);
      alert('Error al completar la tarea');
    }
  };

  const getFilteredTasks = () => {
    switch (filter) {
      case 'pending':
        return tasks.filter(task => task.status === 'pending');
      case 'completed':
        return tasks.filter(task => task.status === 'completed');
      default:
        return tasks;
    }
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-[#4ADE80]" />;
      case 'pending':
        return <Clock size={16} className="text-orange-400" />;
      default:
        return <AlertCircle size={16} className="text-[#A0A0B0]" />;
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

  const filteredTasks = getFilteredTasks();
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
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#2D2D3A] rounded-lg border border-[#3C3C4E] p-6">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2 mb-2">
          <User size={24} className="text-[#4ADE80]" />
          <span>Mis Tareas</span>
        </h2>
        <p className="text-[#A0A0B0]">Gestiona y completa tus tareas asignadas</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#A0A0B0]">Total Asignadas</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="p-3 bg-[#4ADE80]/20 rounded-full">
                <Target size={24} className="text-[#4ADE80]" />
              </div>
            </div>
          </div>
          
          <div className="bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#A0A0B0]">Completadas</p>
                <p className="text-2xl font-bold text-[#4ADE80]">{stats.completed}</p>
              </div>
              <div className="p-3 bg-[#4ADE80]/20 rounded-full">
                <CheckCircle size={24} className="text-[#4ADE80]" />
              </div>
            </div>
          </div>
            <div className="bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#A0A0B0]">Tasa de Finalización</p>
                <p className="text-2xl font-bold text-[#4ADE80]">{stats.completion_rate}%</p>
              </div>
              <div className="p-3 bg-[#4ADE80]/20 rounded-full">
                <TrendingUp size={24} className="text-[#4ADE80]" />
              </div>
            </div>
          </div>
        </div>
      )}      {/* Filters */}
      <div className="bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg p-4">
        <div className="flex space-x-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-[#4ADE80] text-white' 
                : 'text-[#A0A0B0] hover:bg-[#3C3C4E]'
            }`}
          >
            Todas ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending' 
                ? 'bg-orange-500 text-white' 
                : 'text-[#A0A0B0] hover:bg-[#3C3C4E]'
            }`}
          >
            Pendientes ({tasks.filter(t => t.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'completed' 
                ? 'bg-[#4ADE80] text-white' 
                : 'text-[#A0A0B0] hover:bg-[#3C3C4E]'
            }`}
          >
            Completadas ({tasks.filter(t => t.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">        {filteredTasks.length === 0 ? (
          <div className="bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg p-12 text-center">
            <Target size={64} className="mx-auto mb-4 text-[#A0A0B0]" />
            <h3 className="text-lg font-medium text-white mb-2">
              {filter === 'all' 
                ? 'No tienes tareas asignadas' 
                : filter === 'pending'
                ? 'No tienes tareas pendientes'
                : 'No has completado ninguna tarea aún'
              }
            </h3>
            <p className="text-[#A0A0B0]">
              {filter === 'all' 
                ? 'Las tareas que te asignen aparecerán aquí'
                : filter === 'pending'
                ? '¡Excelente trabajo! No tienes tareas pendientes'
                : 'Completa tus primeras tareas para verlas aquí'
              }
            </p>
          </div>
        ) : (          filteredTasks.map(task => (
            <div
              key={task.id}
              className={`bg-[#2D2D3A] border rounded-lg p-4 transition-all ${
                task.status === 'completed' 
                  ? 'border-[#4ADE80] bg-[#4ADE80]/10' 
                  : 'border-[#3C3C4E] hover:border-[#4ADE80]/50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
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
          ))
        )}
      </div>
    </div>
  );
};

export default UserTaskView;
