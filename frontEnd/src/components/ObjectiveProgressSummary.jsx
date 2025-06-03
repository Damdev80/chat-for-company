import React, { useState, useEffect, useCallback } from 'react';
import { Target, TrendingUp, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchObjectivesByGroup } from '../utils/api';
import { getToken } from '../utils/auth';

const ObjectiveProgressSummary = ({ groupId, groupName }) => {
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProgress, setTotalProgress] = useState(0);
  // Calculate progress from tasks (like ObjectiveProgress does)
  const calculateProgressFromTasks = useCallback((tasks) => {
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return { total: 0, completed: 0, percentage: 0 };
    }

    const completed = tasks.filter(task => {
      return task && (
        task.status === 'completed' || 
        task.status === 'completada' ||
        task.status === 'complete' ||
        task.status === 'finalizada'
      );
    }).length;
    
    const total = tasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  }, []);

  const loadObjectives = useCallback(async () => {
    try {
      const token = getToken();
      const result = await fetchObjectivesByGroup(groupId, token);
      const objectivesList = Array.isArray(result) ? result : result.objectives || [];
      
      console.log('🔧 ObjectiveProgressSummary: Raw objectives from backend:', objectivesList);
      
      // Process objectives and calculate correct progress from tasks
      const processedObjectives = objectivesList.map(obj => {
        console.log(`🎯 Processing objective "${obj.title}":`, {
          backendProgress: obj.progress,
          tasksCount: obj.tasks?.length,
          tasks: obj.tasks?.map(t => ({ title: t.title, status: t.status }))
        });
        
        // Always calculate progress from tasks since backend progress calculation has issues
        if (obj.tasks && Array.isArray(obj.tasks)) {
          const calculatedProgress = calculateProgressFromTasks(obj.tasks);
          console.log(`📊 Calculated progress for "${obj.title}":`, calculatedProgress);
          
          return {
            ...obj,
            progress: {
              ...obj.progress,
              ...calculatedProgress // Override backend progress with calculated progress
            }
          };
        }
        
        return obj;
      });
      
      console.log('✅ ObjectiveProgressSummary: Processed objectives with corrected progress:', processedObjectives);
      setObjectives(processedObjectives);
      
      // Calcular progreso total usando el progreso corregido
      if (processedObjectives.length > 0) {
        const totalProgress = processedObjectives.reduce((sum, obj) => {
          const percentage = obj.progress?.percentage ?? 0;
          return sum + percentage;
        }, 0) / processedObjectives.length;
        console.log('📈 Total progress calculated:', Math.round(totalProgress));
        setTotalProgress(Math.round(totalProgress));
      } else {
        setTotalProgress(0);
      }
    } catch (error) {
      console.error('Error al cargar objetivos:', error);
    } finally {
      setLoading(false);
    }
  }, [groupId, calculateProgressFromTasks]);
  useEffect(() => {
    loadObjectives();
  }, [loadObjectives]);

  // Listen for progress updates from Socket.IO
  useEffect(() => {
    const handleProgressUpdate = (event) => {
      const data = event.detail;
      console.log('ObjectiveProgressSummary: Received progress update event:', data);
      
      // Check if this update is for an objective in our group
      if (data.group_id === groupId) {
        console.log('ObjectiveProgressSummary: Update matches our group, refreshing...');
        // Reload objectives to get updated progress
        loadObjectives();
      }
    };

    window.addEventListener('objectiveProgressUpdate', handleProgressUpdate);
    
    return () => {
      window.removeEventListener('objectiveProgressUpdate', handleProgressUpdate);
    };
  }, [groupId, loadObjectives]);

  const getProgressColor = (progress) => {
    if (progress >= 90) return '#10B981'; // Verde brillante
    if (progress >= 75) return '#3B82F6'; // Azul
    if (progress >= 50) return '#8B5CF6'; // Púrpura
    if (progress >= 25) return '#F59E0B'; // Amarillo
    return '#EF4444'; // Rojo
  };
  const getProgressGradient = (progress) => {
    if (progress >= 90) return 'from-[#10B981] to-[#059669]'; // Verde brillante
    if (progress >= 75) return 'from-[#3B82F6] to-[#1D4ED8]'; // Azul
    if (progress >= 50) return 'from-[#8B5CF6] to-[#7C3AED]'; // Púrpura
    if (progress >= 25) return 'from-[#F59E0B] to-[#D97706]'; // Amarillo/Naranja
    return 'from-[#EF4444] to-[#DC2626]'; // Rojo
  };

  const activeObjectives = objectives.filter(obj => {
    const percentage = obj.progress?.percentage ?? 0;
    return percentage < 100;
  });
  const completedObjectives = objectives.filter(obj => {
    const percentage = obj.progress?.percentage ?? 0;
    return percentage === 100;
  });

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#2D2D3A] to-[#1E1E2E] border border-[#3C3C4E] rounded-xl p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-[#3C3C4E] rounded w-32"></div>
          <div className="h-4 bg-[#3C3C4E] rounded w-20"></div>
        </div>
        <div className="space-y-3">
          <div className="h-3 bg-[#3C3C4E] rounded-full"></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="h-16 bg-[#3C3C4E] rounded-lg"></div>
            <div className="h-16 bg-[#3C3C4E] rounded-lg"></div>
            <div className="h-16 bg-[#3C3C4E] rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (objectives.length === 0) {
    return (
      <div className="bg-gradient-to-br from-[#2D2D3A] to-[#1E1E2E] border border-[#3C3C4E] rounded-xl p-6">
        <div className="text-center py-4">
          <AlertCircle size={32} className="text-[#A0A0B0] mx-auto mb-3" />
          <h3 className="text-white font-medium mb-1">Sin objetivos</h3>
          <p className="text-[#A0A0B0] text-sm">No hay objetivos en {groupName}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-gradient-to-br from-[#2D2D3A] to-[#1E1E2E] border border-[#3C3C4E] rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-[#10B981]/20 to-[#10B981]/10 rounded-xl border border-[#10B981]/20">
            <Target size={20} className="text-[#10B981]" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Progreso de {groupName}</h3>
            <p className="text-[#A0A0B0] text-sm">{objectives.length} objetivo{objectives.length !== 1 ? 's' : ''} total{objectives.length !== 1 ? 'es' : ''}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold bg-gradient-to-r from-[#10B981] to-[#3B82F6] bg-clip-text text-transparent">
            {totalProgress}%
          </div>
          <p className="text-xs text-[#A0A0B0] font-medium">Promedio General</p>
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[#A0A0B0] font-semibold flex items-center">
            <TrendingUp size={16} className="mr-2 text-[#10B981]" />
            Progreso General
          </span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
            <span className="text-sm font-bold text-white">{totalProgress}%</span>
          </div>
        </div>
        <div className="relative">
          <div className="w-full bg-[#3C3C4E] rounded-full h-4 overflow-hidden shadow-inner border border-[#3C3C4E]/50">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${getProgressGradient(totalProgress)} relative overflow-hidden`}
              style={{ width: `${totalProgress}%` }}
            >
              {/* Animated shimmer effect */}
              {totalProgress > 0 && totalProgress < 100 && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              )}
            </div>
          </div>
          {/* Progress indicator */}
          {totalProgress > 0 && totalProgress < 100 && (
            <div 
              className="absolute -top-1 w-1 h-6 bg-white/90 rounded-full shadow-lg transition-all duration-1000 border border-white/50"
              style={{ left: `${totalProgress}%`, transform: 'translateX(-50%)' }}
            />
          )}
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card bg-gradient-to-br from-[#10B981]/10 to-[#10B981]/5 border border-[#10B981]/20 rounded-xl p-4 text-center hover:border-[#10B981]/40 transition-all">
          <div className="p-2 bg-[#10B981]/20 rounded-lg w-fit mx-auto mb-2">
            <CheckCircle size={18} className="text-[#10B981]" />
          </div>
          <div className="text-xl font-bold text-[#10B981]">{completedObjectives.length}</div>
          <div className="text-xs text-[#A0A0B0]">Completados</div>
        </div>
        
        <div className="stat-card bg-gradient-to-br from-[#F59E0B]/10 to-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-xl p-4 text-center hover:border-[#F59E0B]/40 transition-all">
          <div className="p-2 bg-[#F59E0B]/20 rounded-lg w-fit mx-auto mb-2">
            <Clock size={18} className="text-[#F59E0B]" />
          </div>
          <div className="text-xl font-bold text-[#F59E0B]">{activeObjectives.length}</div>
          <div className="text-xs text-[#A0A0B0]">En Progreso</div>
        </div>
        
        <div className="stat-card bg-gradient-to-br from-[#3B82F6]/10 to-[#3B82F6]/5 border border-[#3B82F6]/20 rounded-xl p-4 text-center hover:border-[#3B82F6]/40 transition-all">
          <div className="p-2 bg-[#3B82F6]/20 rounded-lg w-fit mx-auto mb-2">
            <Users size={18} className="text-[#3B82F6]" />
          </div>
          <div className="text-xl font-bold text-[#3B82F6]">{objectives.length}</div>
          <div className="text-xs text-[#A0A0B0]">Total</div>
        </div>
      </div>

      {/* Objetivos activos detallados */}
      {activeObjectives.length > 0 && (
        <div className="bg-[#2D2D3A]/60 border border-[#3C3C4E]/60 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium flex items-center space-x-2">
              <Clock size={16} className="text-[#F59E0B]" />
              <span>Objetivos Activos</span>
            </h4>
            {activeObjectives.length > 2 && (
              <span className="text-xs text-[#A0A0B0]">Mostrando 2 de {activeObjectives.length}</span>
            )}
          </div>
          
          <div className="space-y-3">
            {activeObjectives.slice(0, 2).map(objective => {
              const percentage = objective.progress?.percentage ?? 0;
              return (
                <div key={objective.id} className="flex items-center justify-between p-3 bg-[#1E1E2E]/80 rounded-lg border border-[#3C3C4E]/30 hover:border-[#3C3C4E]/60 transition-all">
                  <div className="flex-1 min-w-0 mr-4">
                    <h5 className="text-white font-medium text-sm truncate mb-1">{objective.title}</h5>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-[#3C3C4E] rounded-full h-1.5">
                        <div 
                          className="h-full rounded-full transition-all duration-500 progress-fill"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: getProgressColor(percentage)
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium min-w-[35px] text-right" style={{ color: getProgressColor(percentage) }}>
                        {percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {activeObjectives.length > 2 && (
              <div className="text-center py-2">
                <span className="text-xs text-[#10B981]">
                  +{activeObjectives.length - 2} objetivos más en progreso
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mensaje de finalización total */}
      {completedObjectives.length === objectives.length && objectives.length > 0 && (
        <div className="bg-gradient-to-r from-[#10B981]/20 via-[#3B82F6]/20 to-[#10B981]/20 border border-[#10B981]/50 rounded-xl p-4 text-center mt-4 progress-completed">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <CheckCircle size={20} className="text-[#10B981]" />
            <TrendingUp size={20} className="text-[#3B82F6]" />
          </div>
          <h4 className="text-white font-bold mb-1">¡Todos los objetivos completados! 🎉</h4>
          <p className="text-[#A0A0B0] text-sm">Excelente trabajo en {groupName}</p>
        </div>
      )}
    </div>
  );
};

export default ObjectiveProgressSummary;
