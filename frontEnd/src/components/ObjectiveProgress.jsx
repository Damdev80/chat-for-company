import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle, Clock, Target, ChevronDown, ChevronUp } from 'lucide-react';

const ObjectiveProgress = ({ objective, onProgressUpdate }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  // Debug: Log the objective prop whenever it changes
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🎯 ObjectiveProgress received objective:', {
        id: objective?.id,
        title: objective?.title,
        tasks: objective?.tasks,
        tasksCount: objective?.tasks?.length,
        progress: objective?.progress,
        fullObjective: objective
      });
    }
  }, [objective]);

  // Confetti effect
  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4ADE80', '#60A5FA', '#F59E0B']
    });
  }, []);  // Calculate progress from tasks
  const calculateProgress = useCallback((tasks) => {
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return { total: 0, completed: 0, percentage: 0, pendingTasks: [] };
    }

    const completed = tasks.filter(task => {
      // More flexible status checking
      const isCompleted = task && (
        task.status === 'completed' || 
        task.status === 'completada' ||
        task.status === 'complete' ||
        task.status === 'finalizada'
      );
      return isCompleted;
    }).length;
    
    const total = tasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const pendingTasks = tasks.filter(task => task && (
      task.status === 'pending' || 
      task.status === 'pendiente' ||
      task.status === 'in_progress' ||
      task.status === 'en_progreso'
    ));    const result = { total, completed, percentage, pendingTasks };
    return result;
  }, []);

  useEffect(() => {
    // Debug: Log all tasks and their status in development
    if (import.meta.env.DEV && objective?.tasks) {
      console.log('📋 ObjectiveProgress: Tasks breakdown:', objective.tasks.map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        rawTask: task
      })));
    }

    if (objective) {
      // Always calculate progress from tasks since backend progress calculation has issues
      if (objective.tasks && Array.isArray(objective.tasks)) {
        const calculatedProgress = calculateProgress(objective.tasks);
        setProgress(calculatedProgress);
        
        if (calculatedProgress.percentage === 100 && !hasTriggeredConfetti) {
          triggerConfetti();
          setHasTriggeredConfetti(true);
          if (onProgressUpdate) {
            onProgressUpdate(calculatedProgress);
          }
        } else if (calculatedProgress.percentage < 100 && hasTriggeredConfetti) {
          setHasTriggeredConfetti(false);
        }
      } else {
        setProgress({ total: 0, completed: 0, percentage: 0, pendingTasks: [] });
      }
    } else {
      setProgress(null);
      if (hasTriggeredConfetti) {
        setHasTriggeredConfetti(false);
      }
    }
    
    setLoading(false);
  }, [
    objective, 
    objective?.id,
    objective?.progress?.percentage, 
    objective?.progress?.completed, 
    objective?.progress?.total,
    calculateProgress, 
    hasTriggeredConfetti, 
    triggerConfetti, 
    onProgressUpdate
  ]);  // Listen for progress updates from Socket.IO
  useEffect(() => {
    const handleProgressUpdate = (event) => {
      const data = event.detail;
      
      // Check if this update is for our objective
      if (data.objective_id === objective?.id) {
        // Update progress state directly
        const newProgress = {
          total: data.total_tasks,
          completed: data.completed_tasks,
          percentage: Math.round(data.progress),
          pendingTasks: progress?.pendingTasks || [] // Keep existing pending tasks for now
        };
        
        setProgress(newProgress);
        
        // Trigger confetti if completed
        if (newProgress.percentage === 100 && !hasTriggeredConfetti) {
          triggerConfetti();
          setHasTriggeredConfetti(true);
          if (onProgressUpdate) {
            onProgressUpdate(newProgress);
          }
        }
      }
    };

    window.addEventListener('objectiveProgressUpdate', handleProgressUpdate);
    
    return () => {
      window.removeEventListener('objectiveProgressUpdate', handleProgressUpdate);
    };
  }, [objective?.id, progress?.pendingTasks, hasTriggeredConfetti, triggerConfetti, onProgressUpdate]);

  if (loading) {
    return (
      <div className="bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg p-3">
        <div className="animate-pulse flex items-center justify-between">
          <div className="h-4 bg-[#3C3C4E] rounded w-20"></div>
          <div className="h-4 bg-[#3C3C4E] rounded w-10"></div>
        </div>
        <div className="mt-2 h-2 bg-[#3C3C4E] rounded-full"></div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg p-3">
        <div className="flex items-center text-[#A0A0B0] text-sm">
          <Clock size={16} className="mr-2" />
          <span>Sin tareas asignadas</span>
        </div>
      </div>
    );
  }
  const getProgressColor = () => {
    if (progress.percentage === 100) return 'from-[#10B981] to-[#059669]'; // Verde brillante
    if (progress.percentage >= 75) return 'from-[#3B82F6] to-[#1D4ED8]'; // Azul
    if (progress.percentage >= 50) return 'from-[#8B5CF6] to-[#7C3AED]'; // Púrpura
    if (progress.percentage >= 25) return 'from-[#F59E0B] to-[#D97706]'; // Amarillo/Naranja
    return 'from-[#EF4444] to-[#DC2626]'; // Rojo
  };

  const getTextColor = () => {
    if (progress.percentage === 100) return 'text-[#10B981]';
    if (progress.percentage >= 75) return 'text-[#3B82F6]';
    if (progress.percentage >= 50) return 'text-[#8B5CF6]';
    if (progress.percentage >= 25) return 'text-[#F59E0B]';
    return 'text-[#EF4444]';
  };

  const getProgressIcon = () => {
    if (progress.percentage === 100) return <CheckCircle size={16} className={getTextColor()} />;
    if (progress.percentage >= 75) return <Target size={16} className={getTextColor()} />;
    return <Clock size={16} className={getTextColor()} />;
  };
  return (
    <div className="bg-gradient-to-br from-[#2D2D3A] to-[#1E1E2E] border border-[#3C3C4E] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Compact View */}
      <div 
        className="p-4 cursor-pointer hover:bg-[#3C3C4E]/20 transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getProgressIcon()}
            <div>
              <span className="text-white text-sm font-semibold">Progreso del Objetivo</span>
              <div className="text-xs text-[#A0A0B0] mt-0.5">
                {progress.completed} de {progress.total} tareas completadas
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className={`text-xl font-bold ${getTextColor()}`}>
                {progress.percentage}%
              </div>
              {progress.percentage === 100 && (
                <div className="text-xs text-[#10B981] font-medium">
                  ¡Completado! 🎉
                </div>
              )}
            </div>
            {isExpanded ? 
              <ChevronUp size={18} className="text-[#A0A0B0] hover:text-white transition-colors" /> : 
              <ChevronDown size={18} className="text-[#A0A0B0] hover:text-white transition-colors" />
            }
          </div>
        </div>
            {/* Enhanced Progress Bar */}
        <div className="relative">
          <div className="w-full bg-[#3C3C4E] rounded-full h-3 overflow-hidden shadow-inner border border-[#3C3C4E]/50">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${getProgressColor()} progress-fill relative overflow-hidden ${progress.percentage === 100 ? 'shadow-lg shadow-[#10B981]/50' : ''}`}
              style={{ width: `${progress.percentage}%` }}
            >
              {/* Shimmer effect for active progress */}
              {progress.percentage > 0 && progress.percentage < 100 && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              )}
              {/* Celebration effect for completed */}
              {progress.percentage === 100 && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              )}
            </div>
          </div>
          {/* Progress indicator */}
          {progress.percentage > 0 && progress.percentage < 100 && (
            <div 
              className="absolute -top-1 w-1 h-5 bg-white/80 rounded-full shadow-lg transition-all duration-1000 border border-white/50"
              style={{ left: `${progress.percentage}%`, transform: 'translateX(-50%)' }}
            />
          )}
          {/* Completion indicator */}
          {progress.percentage === 100 && (
            <div className="absolute -top-1 right-0 w-1 h-5 bg-[#10B981] rounded-full shadow-lg animate-pulse border border-[#10B981]/50"></div>
          )}
        </div>
      </div>      {/* Expanded View */}
      {isExpanded && (
        <div className="border-t border-[#3C3C4E]/50 bg-gradient-to-br from-[#1E1E2E] to-[#2D2D3A] p-4 space-y-4 animate-fadeIn">
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="group bg-gradient-to-br from-[#10B981]/10 to-[#10B981]/5 border border-[#10B981]/20 rounded-xl p-3 text-center hover:border-[#10B981]/40 hover:shadow-lg hover:shadow-[#10B981]/10 transition-all duration-200">
              <div className="p-2 bg-[#10B981]/20 rounded-lg w-fit mx-auto mb-2 group-hover:scale-110 transition-transform">
                <CheckCircle size={18} className="text-[#10B981]" />
              </div>
              <div className="text-xl font-bold text-[#10B981]">{progress.completed}</div>
              <div className="text-xs text-[#A0A0B0] font-medium">Completadas</div>
            </div>
            
            <div className="group bg-gradient-to-br from-[#F59E0B]/10 to-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-xl p-3 text-center hover:border-[#F59E0B]/40 hover:shadow-lg hover:shadow-[#F59E0B]/10 transition-all duration-200">
              <div className="p-2 bg-[#F59E0B]/20 rounded-lg w-fit mx-auto mb-2 group-hover:scale-110 transition-transform">
                <Clock size={18} className="text-[#F59E0B]" />
              </div>
              <div className="text-xl font-bold text-[#F59E0B]">{progress.total - progress.completed}</div>
              <div className="text-xs text-[#A0A0B0] font-medium">Pendientes</div>
            </div>
            
            <div className="group bg-gradient-to-br from-[#3B82F6]/10 to-[#3B82F6]/5 border border-[#3B82F6]/20 rounded-xl p-3 text-center hover:border-[#3B82F6]/40 hover:shadow-lg hover:shadow-[#3B82F6]/10 transition-all duration-200">
              <div className="p-2 bg-[#3B82F6]/20 rounded-lg w-fit mx-auto mb-2 group-hover:scale-110 transition-transform">
                <Target size={18} className="text-[#3B82F6]" />
              </div>
              <div className="text-xl font-bold text-[#3B82F6]">{progress.total}</div>
              <div className="text-xs text-[#A0A0B0] font-medium">Total</div>
            </div>
          </div>

          {/* Completion Message */}
          {progress.percentage === 100 && (
            <div className="bg-gradient-to-r from-[#10B981]/15 via-[#3B82F6]/10 to-[#10B981]/15 border border-[#10B981]/30 rounded-xl p-4 text-center animate-pulse">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <CheckCircle size={24} className="text-[#10B981]" />
                <span className="text-[#10B981] text-lg font-bold">
                  ¡Objetivo Completado!
                </span>
                <div className="text-2xl">🎉</div>
              </div>
              <p className="text-sm text-[#A0A0B0]">
                Todas las tareas han sido completadas exitosamente
              </p>
            </div>
          )}

          {/* Enhanced Pending Tasks Preview */}
          {progress.pendingTasks.length > 0 && progress.percentage < 100 && (
            <div className="bg-gradient-to-br from-[#1E1E2E] to-[#2D2D3A] border border-[#3C3C4E]/50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                <Clock size={16} className="mr-2 text-[#F59E0B]" />
                Próximas Tareas ({progress.pendingTasks.length})
              </h4>
              <div className="space-y-2">
                {progress.pendingTasks.slice(0, 3).map((task, index) => (
                  <div key={task.id} className="flex items-center p-2 bg-[#3C3C4E]/30 rounded-lg hover:bg-[#3C3C4E]/50 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-[#F59E0B] mr-3 animate-pulse"></div>
                    <span className="text-sm text-[#A0A0B0] flex-1 truncate">{task.title}</span>
                    <div className="text-xs text-[#666] ml-2">#{index + 1}</div>
                  </div>
                ))}
                {progress.pendingTasks.length > 3 && (
                  <div className="text-center py-2">
                    <span className="text-xs text-[#10B981] font-medium bg-[#10B981]/10 px-3 py-1 rounded-full">
                      +{progress.pendingTasks.length - 3} tareas más
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>      )}
    </div>
  );
};

export default ObjectiveProgress;
