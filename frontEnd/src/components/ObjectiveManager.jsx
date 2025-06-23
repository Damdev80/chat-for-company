import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  Target, 
  ChevronDown, 
  ChevronRight,
  X,
  Save
} from 'lucide-react';
import {
  fetchObjectivesByGroup,
  createObjective,
  updateObjective,
  deleteObjective
} from '../utils/api';
import { getToken, isAdmin } from '../utils/auth';
import ObjectiveProgress from './ObjectiveProgress';
import TaskManager from './TaskManager';

const ObjectiveManager = ({ groupId, groupName, token, onObjectiveCreated, onTaskUpdate }) => {
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true); // Correctly use setLoading
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingObjective, setEditingObjective] = useState(null);
  const [expandedObjective, setExpandedObjective] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: ''
  });  const loadObjectives = useCallback(async () => {
    console.log('🔄 ObjectiveManager: Loading objectives for groupId:', groupId);
    setLoading(true);
    try {
      const token = getToken();
      const result = await fetchObjectivesByGroup(groupId, token);
      const objectivesList = Array.isArray(result) ? result : result.objectives || [];
      console.log('✅ ObjectiveManager: Objectives loaded successfully:', objectivesList.length, 'objectives');
      console.log('🎯 FULL API RESULT:', result);
      
      // Debug: Log each objective with its progress data
      objectivesList.forEach((obj, index) => {
        console.log(`📋 Objective ${index + 1}:`, {
          id: obj.id,
          title: obj.title,
          progress: obj.progress,
          tasks: obj.tasks,
          tasksCount: obj.tasks?.length || 0,
          fullObjective: obj
        });
      });
      
      setObjectives(objectivesList);
    } catch (error) {
      console.error('❌ Error al cargar objetivos:', error);
      setObjectives([]);
    } finally {
      setLoading(false);
      console.log('🏁 ObjectiveManager: Loading completed');
    }
  }, [groupId]);

  useEffect(() => {
    loadObjectives();
  }, [loadObjectives]);  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      
      // Convert date to datetime format if provided
      let deadline = null;
      if (formData.deadline) {
        // Convert YYYY-MM-DD to YYYY-MM-DDTHH:MM:SS.sssZ format
        deadline = new Date(formData.deadline + 'T23:59:59.999Z').toISOString();
      }
      
      const objectiveData = {
        ...formData,
        group_id: groupId,
        deadline: deadline
      };
      
      console.log('Datos del objetivo a enviar:', objectiveData);
      console.log('Token:', token ? 'Present' : 'Missing');
        if (editingObjective) {
        console.log('Actualizando objetivo:', editingObjective.id);
        await updateObjective(editingObjective.id, objectiveData, token);
      } else {
        console.log('Creando nuevo objetivo...');
        const response = await createObjective(objectiveData, token);
        console.log('Respuesta del servidor:', response);
        
        // Call the callback to redirect to chat after creating an objective
        if (onObjectiveCreated && typeof onObjectiveCreated === 'function') {
          onObjectiveCreated();
        }
      }
      
      await loadObjectives();
      resetForm();
    } catch (error) {
      console.error('Error al guardar objetivo:', error);
      console.error('Detalles del error:', error.message);
      alert(`Error al guardar el objetivo: ${error.message}`);
    }
  };

  const handleDelete = async (objectiveId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este objetivo? Esto también eliminará todas sus tareas.')) return;
    
    try {
      const token = getToken();
      await deleteObjective(objectiveId, token);
      await loadObjectives();
      if (expandedObjective === objectiveId) {
        setExpandedObjective(null);
      }
    } catch (error) {
      console.error('Error al eliminar objetivo:', error);
      alert('Error al eliminar el objetivo');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', deadline: '' });
    setShowCreateForm(false);
    setEditingObjective(null);
  };

  const startEdit = (objective) => {
    setEditingObjective(objective);
    setFormData({
      title: objective.title,
      description: objective.description || '',
      deadline: objective.deadline ? objective.deadline.split('T')[0] : ''
    });
    setShowCreateForm(true);
  };


  if (loading) {
    return (
      <div className="h-full flex flex-col space-y-3 sm:space-y-4 p-3 sm:p-4 lg:p-6">
        <div className="flex-shrink-0">
          <div className="h-6 sm:h-8 bg-[#3C3C4E] rounded mb-3 sm:mb-4 animate-pulse"></div>
        </div>
        <div className="flex-1 min-h-0 space-y-2 sm:space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-[#2D2D3A] h-20 sm:h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }return (
    <div className="p-3 sm:p-4 lg:p-6 pt-4 sm:pt-6 lg:pt-8 h-full overflow-y-auto">
      <div className="space-y-4 sm:space-y-6 max-w-full">
        {/* Header */}
        <div className="bg-[#2D2D3A] rounded-lg border border-[#3C3C4E] p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center space-x-2">
                <Target size={20} className="sm:w-6 sm:h-6 text-[#4ADE80] flex-shrink-0" />
                <span className="truncate">Objetivos del Grupo</span>
              </h2>
              <p className="text-[#A0A0B0] mt-1 sm:mt-2 text-sm sm:text-base truncate">{groupName}</p>
            </div>
            {isAdmin() && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-[#4ADE80] hover:bg-[#3BC470] text-black px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center space-x-2 transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
              >
                <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Nuevo Objetivo</span>
                <span className="sm:hidden">Nuevo</span>
              </button>
            )}
          </div>
        </div>        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-white">
                {editingObjective ? 'Editar Objetivo' : 'Nuevo Objetivo'}
              </h3>
              <button
                onClick={resetForm}
                className="text-[#A0A0B0] hover:text-white transition-colors p-1"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#A0A0B0] mb-2">
                  Título del Objetivo *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-[#1E1E2E] border border-[#3C3C4E] rounded-lg focus:ring-2 focus:ring-[#4ADE80] focus:border-[#4ADE80] text-white placeholder-[#A0A0B0] transition-all text-sm sm:text-base"
                  placeholder="Ej: Implementar sistema de reportes"
                  required
                  autoComplete="off"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#A0A0B0] mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-[#1E1E2E] border border-[#3C3C4E] rounded-lg focus:ring-2 focus:ring-[#4ADE80] focus:border-[#4ADE80] text-white placeholder-[#A0A0B0] transition-all resize-none text-sm sm:text-base"
                  placeholder="Describe el objetivo y sus metas (opcional)"
                  rows="3"
                  autoComplete="off"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#A0A0B0] mb-2">
                  Fecha Límite
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-[#1E1E2E] border border-[#3C3C4E] rounded-lg focus:ring-2 focus:ring-[#4ADE80] focus:border-[#4ADE80] text-white transition-all text-sm sm:text-base"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 sm:px-6 py-2 sm:py-3 text-[#A0A0B0] border border-[#3C3C4E] rounded-lg hover:bg-[#3C3C4E] hover:text-white transition-colors text-sm sm:text-base"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-[#4ADE80] text-black rounded-lg hover:bg-[#3BC470] transition-colors flex items-center justify-center space-x-2 font-medium text-sm sm:text-base"
                >
                  <Save size={14} className="sm:w-4 sm:h-4" />
                  <span>{editingObjective ? 'Actualizar' : 'Crear'}</span>
                </button>
              </div>
            </form>
          </div>
        )}        {/* Objectives List */}
        <div className="space-y-3 sm:space-y-4">
          {objectives.length === 0 ? (
            <div className="bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg p-6 sm:p-8 lg:p-12 text-center">
              <Target size={48} className="sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-[#4ADE80]" />
              <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                No hay objetivos definidos
              </h3>
              <p className="text-[#A0A0B0] mb-4 sm:mb-6 text-sm sm:text-base">
                {isAdmin() 
                  ? "Los objetivos te ayudan a organizar y hacer seguimiento del progreso del equipo"
                  : "Los objetivos del grupo aparecerán aquí cuando el administrador los cree"
                }
              </p>
              
              {/* Mini tutorial - solo para admins */}
              {isAdmin() && (
                <div className="bg-[#1E1E2E] border border-[#3C3C4E] rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 text-left max-w-md mx-auto">
                  <h4 className="text-sm font-medium text-[#4ADE80] mb-2 sm:mb-3">¿Cómo funciona?</h4>
                  <div className="space-y-2 text-xs sm:text-sm text-[#A0A0B0]">
                    <div className="flex items-start space-x-2">
                      <span className="text-[#4ADE80] font-bold flex-shrink-0">1.</span>
                      <span>Crea un objetivo (ej: "Desarrollar nueva feature")</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-[#4ADE80] font-bold flex-shrink-0">2.</span>
                      <span>Haz clic en el objetivo para expandirlo</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-[#4ADE80] font-bold flex-shrink-0">3.</span>
                      <span>Crea tareas específicas y asígnalas al equipo</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-[#4ADE80] font-bold flex-shrink-0">4.</span>
                      <span>El equipo enviará tareas a revisión y tú las aprobarás</span>
                    </div>
                  </div>
                </div>
              )}
              
              {isAdmin() && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-[#4ADE80] hover:bg-[#3BC470] text-black px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors font-medium text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">Crear Primer Objetivo</span>
                  <span className="sm:hidden">Crear Objetivo</span>
                </button>
              )}
            </div>
          ) : (
            objectives.map(objective => (
              <div
                key={objective.id}
                className="bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg overflow-hidden"
              >
                {/* Objective Header - Clickable to expand */}
                <div 
                  className="p-3 sm:p-4 flex justify-between items-start cursor-pointer hover:bg-[#3C3C4E] transition-colors"
                  onClick={() => setExpandedObjective(expandedObjective === objective.id ? null : objective.id)}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center mb-1">
                      <h3 className="text-white font-medium text-sm sm:text-base lg:text-lg truncate">{objective.title}</h3>
                      <div className="ml-2 sm:ml-3 flex-shrink-0">
                        {expandedObjective === objective.id ? (
                          <ChevronDown size={18} className="sm:w-5 sm:h-5 text-[#A0A0B0]" />
                        ) : (
                          <ChevronRight size={18} className="sm:w-5 sm:h-5 text-[#A0A0B0]" />
                        )}
                      </div>
                    </div>
                    {objective.description && (
                      <p className="text-[#A0A0B0] text-xs sm:text-sm mb-2 line-clamp-2">{objective.description}</p>
                    )}
                    <ObjectiveProgress objective={objective} />
                  </div>
                  {isAdmin() && (
                    <div className="flex space-x-1 sm:space-x-2 ml-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(objective);
                        }}
                        className="text-[#A0A0B0] hover:text-[#4ADE80] transition-colors p-1 sm:p-1.5"
                        title="Editar objetivo"
                      >
                        <Edit3 size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(objective.id);
                        }}
                        className="text-[#A0A0B0] hover:text-red-500 transition-colors p-1 sm:p-1.5"
                        title="Eliminar objetivo"
                      >
                        <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Expanded content - Task Manager */}
                {expandedObjective === objective.id && (
                  <div className="border-t border-[#3C3C4E] bg-[#1E1E2E]">
                    <TaskManager 
                      objectiveId={objective.id}
                      groupId={groupId}
                      token={token}
                      onTaskUpdate={async () => {
                        // Load local objectives to update progress bars
                        await loadObjectives();
                        // Trigger parent refresh for real-time updates
                        if (onTaskUpdate) {
                          onTaskUpdate();
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ObjectiveManager;
