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
import { getToken } from '../utils/auth';
import ObjectiveProgress from './ObjectiveProgress';
import TaskManager from './TaskManager';

const ObjectiveManager = ({ groupId, groupName, onObjectiveCreated }) => {
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true); // Correctly use setLoading
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingObjective, setEditingObjective] = useState(null);
  const [expandedObjective, setExpandedObjective] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: ''
  });
  
  const loadObjectives = useCallback(async () => {
    setLoading(true); // Set loading to true when starting
    try {
      const token = getToken();
      const result = await fetchObjectivesByGroup(groupId, token);
      const objectivesList = Array.isArray(result) ? result : result.objectives || [];
      setObjectives(objectivesList);
    } catch (error) {
      console.error('Error al cargar objetivos:', error);
      setObjectives([]); // Set to empty array on error to avoid rendering issues
    } finally {
      setLoading(false); // Set loading to false in finally block
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

  const toggleExpanded = (objectiveId) => {
    setExpandedObjective(expandedObjective === objectiveId ? null : objectiveId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha límite';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[#3C3C4E] rounded mb-4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#2D2D3A] h-24 rounded-lg mb-3"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-[#2D2D3A] rounded-lg border border-[#3C3C4E] p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <Target size={24} className="text-[#4ADE80]" />
              <span>Objetivos del Grupo</span>
            </h2>
            <p className="text-[#A0A0B0] mt-1">{groupName}</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-[#4ADE80] hover:bg-[#3BC470] text-black px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors font-medium"
          >
            <Plus size={18} />
            <span>Nuevo Objetivo</span>
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">
              {editingObjective ? 'Editar Objetivo' : 'Nuevo Objetivo'}
            </h3>
            <button
              onClick={resetForm}
              className="text-[#A0A0B0] hover:text-white transition-colors"
            >
              <X size={20} />
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
                className="w-full px-4 py-3 bg-[#1E1E2E] border border-[#3C3C4E] rounded-lg focus:ring-2 focus:ring-[#4ADE80] focus:border-[#4ADE80] text-white placeholder-[#A0A0B0] transition-all"
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
                className="w-full px-4 py-3 bg-[#1E1E2E] border border-[#3C3C4E] rounded-lg focus:ring-2 focus:ring-[#4ADE80] focus:border-[#4ADE80] text-white placeholder-[#A0A0B0] transition-all resize-none"
                placeholder="Describe el objetivo y sus metas (opcional)"
                rows="4"
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
                className="w-full px-4 py-3 bg-[#1E1E2E] border border-[#3C3C4E] rounded-lg focus:ring-2 focus:ring-[#4ADE80] focus:border-[#4ADE80] text-white transition-all"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 text-[#A0A0B0] border border-[#3C3C4E] rounded-lg hover:bg-[#3C3C4E] hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-[#4ADE80] text-black rounded-lg hover:bg-[#3BC470] transition-colors flex items-center space-x-2 font-medium"
              >
                <Save size={16} />
                <span>{editingObjective ? 'Actualizar' : 'Crear'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Objectives List */}
      <div className="space-y-4">        {objectives.length === 0 ? (
          <div className="bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg p-12 text-center">
            <Target size={64} className="mx-auto mb-4 text-[#4ADE80]" />
            <h3 className="text-lg font-medium text-white mb-2">
              No hay objetivos definidos
            </h3>
            <p className="text-[#A0A0B0] mb-6">
              Los objetivos te ayudan a organizar y hacer seguimiento del progreso del equipo
            </p>
            
            {/* Mini tutorial */}
            <div className="bg-[#1E1E2E] border border-[#3C3C4E] rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
              <h4 className="text-sm font-medium text-[#4ADE80] mb-3">¿Cómo funciona?</h4>
              <div className="space-y-2 text-xs text-[#A0A0B0]">
                <div className="flex items-start space-x-2">
                  <span className="text-[#4ADE80] font-bold">1.</span>
                  <span>Crea un objetivo (ej: "Desarrollar nueva feature")</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-[#4ADE80] font-bold">2.</span>
                  <span>Haz clic en el objetivo para expandirlo</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-[#4ADE80] font-bold">3.</span>
                  <span>Crea tareas específicas y asígnalas al equipo</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-[#4ADE80] font-bold">4.</span>
                  <span>Marca tareas como completadas para seguir progreso</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-[#4ADE80] hover:bg-[#3BC470] text-black px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Crear Primer Objetivo
            </button>
          </div>
        ) : (
          objectives.map(objective => (
            <div
              key={objective.id}
              className="bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">                      <button
                        onClick={() => toggleExpanded(objective.id)}
                        className="flex items-center space-x-2 text-left group hover:bg-[#3C3C4E]/30 rounded-lg p-2 -m-2 transition-colors"
                      >
                        {expandedObjective === objective.id ? (
                          <ChevronDown size={20} className="text-[#4ADE80] group-hover:text-white" />
                        ) : (
                          <ChevronRight size={20} className="text-[#A0A0B0] group-hover:text-[#4ADE80]" />
                        )}
                        <h3 className="text-xl font-semibold text-white group-hover:text-[#4ADE80] transition-colors">
                          {objective.title}
                        </h3>
                        {expandedObjective !== objective.id && (
                          <span className="text-xs bg-[#4ADE80]/20 text-[#4ADE80] px-2 py-1 rounded-full ml-2">
                            Click para ver tareas
                          </span>
                        )}
                      </button>
                      {objective.deadline && isOverdue(objective.deadline) && (
                        <span className="bg-red-500/20 text-red-400 text-xs font-medium px-2 py-1 rounded-full">
                          Vencido
                        </span>
                      )}
                    </div>
                    
                    {objective.description && (
                      <p className="text-[#A0A0B0] mb-3">{objective.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-[#A0A0B0]">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{formatDate(objective.deadline)}</span>
                      </div>
                      <span>•</span>
                      <span>Creado por: {objective.created_by_name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit(objective)}
                      className="p-2 text-[#4ADE80] hover:bg-[#4ADE80]/20 rounded-lg transition-colors"
                      title="Editar objetivo"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(objective.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Eliminar objetivo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <ObjectiveProgress 
                  objectiveId={objective.id}
                  objective={objective}
                  onProgressUpdate={(progress) => {
                    console.log(`Objetivo ${objective.title} progreso:`, progress);
                  }}
                />
              </div>
              
              {/* Expanded Content */}
              {expandedObjective === objective.id && (
                <div className="border-t border-[#3C3C4E] bg-[#1E1E2E] p-6">
                  <TaskManager 
                    objectiveId={objective.id}
                    objective={objective}
                    onTaskUpdate={loadObjectives}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ObjectiveManager;
