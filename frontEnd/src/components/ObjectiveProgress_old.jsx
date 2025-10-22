import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle, Clock, Target, ChevronDown, ChevronUp } from 'lucide-react';

const ObjectiveProgress = ({ objective, onProgressUpdate }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
  };  return (
    <div className="bg-gradient-to-r from-[#2D2D3A] to-[#1E1E2E] border border-[#3C3C4E] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      {/* Compact View */}
      <div 
        className="p-2 cursor-pointer hover:bg-[#3C3C4E]/10 transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getProgressIcon()}
            <div className="flex items-center space-x-2">
              <span className="text-white text-xs font-medium">Progreso</span>
              <span className="text-[#A0A0B0] text-xs">
                {progress.completed}/{progress.total}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`text-sm font-bold ${getTextColor()}`}>
              {progress.percentage}%
            </div>
            {progress.percentage === 100 && <span className="text-xs">🎉</span>}
            {isExpanded ? 
              <ChevronUp size={14} className="text-[#A0A0B0] hover:text-white transition-colors" /> : 
              <ChevronDown size={14} className="text-[#A0A0B0] hover:text-white transition-colors" />
            }
          </div>
        </div>
            
        {/* Compact Progress Bar */}
        <div className="mt-2">
          <div className="w-full bg-[#3C3C4E] rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${getProgressColor()} ${progress.percentage === 100 ? 'shadow-sm shadow-[#10B981]/30' : ''}`}
              style={{ width: `${progress.percentage}%` }}
            >
              {/* Subtle shimmer for active progress */}
              {progress.percentage > 0 && progress.percentage < 100 && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
              )}
            </div>
          </div>
        </div>
      </div>      {/* Simplified Expanded View */}
      {isExpanded && (
        <div className="border-t border-[#3C3C4E]/30 bg-[#1E1E2E] p-3 space-y-3">
          {/* Simple Stats */}
          <div className="flex justify-around text-center">
            <div className="flex flex-col items-center">
              <CheckCircle size={16} className="text-[#10B981] mb-1" />
              <div className="text-sm font-bold text-[#10B981]">{progress.completed}</div>
              <div className="text-xs text-[#A0A0B0]">Hechas</div>
            </div>
            
            <div className="flex flex-col items-center">
              <Clock size={16} className="text-[#F59E0B] mb-1" />
              <div className="text-sm font-bold text-[#F59E0B]">{progress.total - progress.completed}</div>
              <div className="text-xs text-[#A0A0B0]">Pendientes</div>
            </div>
            
            <div className="flex flex-col items-center">
              <Target size={16} className="text-[#3B82F6] mb-1" />
              <div className="text-sm font-bold text-[#3B82F6]">{progress.total}</div>
              <div className="text-xs text-[#A0A0B0]">Total</div>
            </div>
          </div>

          {/* Completion Message - Simplified */}
          {progress.percentage === 100 && (
            <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle size={16} className="text-[#10B981]" />
                <span className="text-[#10B981] text-sm font-medium">¡Completado!</span>
                <span className="text-sm">🎉</span>
              </div>
            </div>
          )}

          {/* Simplified Pending Tasks */}
          {progress.pendingTasks.length > 0 && progress.percentage < 100 && (
            <div className="bg-[#2D2D3A] border border-[#3C3C4E]/30 rounded-lg p-2">
              <div className="flex items-center mb-2">
                <Clock size={14} className="mr-2 text-[#F59E0B]" />
                <span className="text-xs font-medium text-white">Próximas ({progress.pendingTasks.length})</span>
              </div>
              <div className="space-y-1">
                {progress.pendingTasks.slice(0, 2).map((task) => (
                  <div key={task.id} className="flex items-center p-1 bg-[#3C3C4E]/20 rounded text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mr-2"></div>
                    <span className="text-[#A0A0B0] truncate">{task.title}</span>
                  </div>
                ))}
                {progress.pendingTasks.length > 2 && (
                  <div className="text-center">
                    <span className="text-xs text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">
                      +{progress.pendingTasks.length - 2} más
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>)}
    </div>
  );
};

export default ObjectiveProgress;
