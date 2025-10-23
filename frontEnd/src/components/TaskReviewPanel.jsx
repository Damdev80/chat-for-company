import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  RotateCcw, 
  User, 
  Target, 
  Calendar,
  MessageSquare,
  Send,
  Eye
} from 'lucide-react';
import { fetchTasksInReview, approveTask, returnTask } from '../utils/api';
import { getToken, canReviewTasks } from '../utils/auth';

const TaskReviewPanel = ({ onTaskUpdate }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingTask, setReviewingTask] = useState(null);
  const [comments, setComments] = useState('');
  const [actionType, setActionType] = useState(''); // 'approve' or 'return'
  useEffect(() => {
    if (canReviewTasks()) {
      loadTasksInReview();
    } else {
      setLoading(false);
    }
  }, []);  const loadTasksInReview = async () => {
    try {
      const token = getToken();
      
      const response = await fetchTasksInReview(token);
      
      setTasks(response || []);
    } catch (error) {
      console.error('❌ [REVIEW PANEL] Error loading tasks:', error);
      console.error('❌ [REVIEW PANEL] Error details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (taskId, reviewComments) => {
    try {
      const token = getToken();
      await approveTask(taskId, reviewComments, token);
      await loadTasksInReview();
      
      if (onTaskUpdate) {
        await onTaskUpdate();
      }
      
      setReviewingTask(null);
      setComments('');
    } catch (error) {
      console.error('Error al aprobar tarea:', error);
      alert('Error al aprobar la tarea');
    }
  };

  const handleReturn = async (taskId, reviewComments) => {
    try {
      const token = getToken();
      await returnTask(taskId, reviewComments, token);
      await loadTasksInReview();
      
      if (onTaskUpdate) {
        await onTaskUpdate();
      }
      
      setReviewingTask(null);
      setComments('');
    } catch (error) {
      console.error('Error al devolver tarea:', error);
      alert('Error al devolver la tarea');
    }
  };

  const startReview = (task, action) => {
    setReviewingTask(task);
    setActionType(action);
    setComments('');
  };

  const submitReview = () => {
    if (actionType === 'approve') {
      handleApprove(reviewingTask.id, comments);
    } else if (actionType === 'return') {
      if (!comments.trim()) {
        alert('Los comentarios son obligatorios al devolver una tarea');
        return;
      }
      handleReturn(reviewingTask.id, comments);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!canReviewTasks()) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <h3 className="text-red-400 font-medium mb-2">Acceso Restringido</h3>
          <p className="text-red-300">No tienes permisos para revisar tareas.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#2D2D3A] rounded mb-4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-[#2D2D3A] rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-4">
        {/* Encabezado */}
        <div>
          <h1 className="text-xl font-bold text-white mb-1">Panel de Revisión</h1>
          <p className="text-gray-400 text-sm">Revisa y aprueba las tareas enviadas por el equipo</p>
        </div>

        {tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.map(task => (
              <div
                key={task.id}
                className="bg-[#2D2D3A] border border-blue-500/30 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Eye size={16} className="text-blue-400" />
                      <h4 className="font-medium text-white">{task.title}</h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                        En Revisión
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
                      <div className="flex items-center space-x-1">
                        <User size={14} />
                        <span>Asignado a: {task.assigned_to_name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>Enviado: {formatDate(task.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex space-x-2">
                    <button
                      onClick={() => startReview(task, 'approve')}
                      className="bg-[#4ADE80] hover:bg-[#4ADE80]/80 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <CheckCircle size={16} />
                      <span>Aprobar</span>
                    </button>
                    
                    <button
                      onClick={() => startReview(task, 'return')}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <RotateCcw size={16} />
                      <span>Devolver</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-[#2D2D3A] rounded-lg border border-[#3C3C4E]">
            <Eye size={48} className="mx-auto mb-4 text-[#4ADE80]" />
            <h3 className="text-lg font-medium text-white mb-2">No hay tareas pendientes de revisión</h3>
            <p className="text-gray-400">Las tareas aparecerán aquí cuando los usuarios las envíen para revisión.</p>
          </div>
        )}
      </div>

      {/* Modal de revisión */}
      {reviewingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2D2D3A] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-4">
              {actionType === 'approve' ? 'Aprobar Tarea' : 'Devolver Tarea'}
            </h3>
            
            <div className="mb-4">
              <h4 className="text-white font-medium">{reviewingTask.title}</h4>
              <p className="text-[#A0A0B0] text-sm">{reviewingTask.description}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  <MessageSquare size={14} className="inline mr-1" />
                  Comentarios {actionType === 'return' && <span className="text-red-400">*</span>}
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={
                    actionType === 'approve' 
                      ? 'Comentarios opcionales sobre la aprobación...' 
                      : 'Explica qué necesita ser corregido...'
                  }
                  className="w-full bg-[#1E1E2E] border border-[#3C3C4E] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:border-transparent resize-none"
                  rows={4}
                  required={actionType === 'return'}
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={submitReview}
                  className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                    actionType === 'approve'
                      ? 'bg-[#4ADE80] hover:bg-[#4ADE80]/80 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  <Send size={16} />
                  <span>{actionType === 'approve' ? 'Aprobar' : 'Devolver'}</span>
                </button>
                
                <button
                  onClick={() => setReviewingTask(null)}
                  className="px-4 py-2 bg-[#3C3C4E] hover:bg-[#4A4A5E] text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskReviewPanel;
