import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle, Clock, Target, ChevronDown, ChevronUp, Eye, RotateCcw } from 'lucide-react';

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
  }, []);
  // Calculate progress from tasks
  const calculateProgress = useCallback((tasks) => {
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return { total: 0, completed: 0, percentage: 0, pendingTasks: [], inReviewTasks: [], returnedTasks: [] };
    }

    const completed = tasks.filter(task => {
      const isCompleted = task && task.status === 'completed';
      return isCompleted;
    }).length;
    
    const total = tasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const pendingTasks = tasks.filter(task => task && task.status === 'pending');
    const inReviewTasks = tasks.filter(task => task && task.status === 'in_review');
    const returnedTasks = tasks.filter(task => task && task.status === 'returned');

    return { 
      total, 
      completed, 
      percentage, 
      pendingTasks, 
      inReviewTasks, 
      returnedTasks 
    };
  }, []);

  useEffect(() => {
    if (objective) {
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
  ]);

  // Listen for progress updates from Socket.IO
  useEffect(() => {
    const handleProgressUpdate = (event) => {
      const data = event.detail;
      
      if (data.objective_id === objective?.id) {
        const newProgress = {
          total: data.total_tasks,
          completed: data.completed_tasks,
          percentage: Math.round(data.progress),
          pendingTasks: progress?.pendingTasks || []
        };
        
        setProgress(newProgress);
        
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
      <div className="bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg p-2">
        <div className="animate-pulse flex items-center justify-between">
          <div className="h-3 bg-[#3C3C4E] rounded w-16"></div>
          <div className="h-3 bg-[#3C3C4E] rounded w-8"></div>
        </div>
        <div className="mt-1 h-1 bg-[#3C3C4E] rounded-full"></div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg p-2">
        <div className="flex items-center text-[#A0A0B0] text-xs">
          <Clock size={12} className="mr-1.5" />
          <span>Sin tareas</span>
        </div>
      </div>
    );
  }

  const getProgressColor = () => {
    if (progress.percentage === 100) return 'from-[#10B981] to-[#059669]';
    if (progress.percentage >= 75) return 'from-[#3B82F6] to-[#1D4ED8]';
    if (progress.percentage >= 50) return 'from-[#8B5CF6] to-[#7C3AED]';
    if (progress.percentage >= 25) return 'from-[#F59E0B] to-[#D97706]';
    return 'from-[#EF4444] to-[#DC2626]';
  };

  const getTextColor = () => {
    if (progress.percentage === 100) return 'text-[#10B981]';
    if (progress.percentage >= 75) return 'text-[#3B82F6]';
    if (progress.percentage >= 50) return 'text-[#8B5CF6]';
    if (progress.percentage >= 25) return 'text-[#F59E0B]';
    return 'text-[#EF4444]';
  };

  const getProgressIcon = () => {
    if (progress.percentage === 100) return <CheckCircle size={12} className={getTextColor()} />;
    if (progress.percentage >= 75) return <Target size={12} className={getTextColor()} />;
    return <Clock size={12} className={getTextColor()} />;
  };

  return (
    <div className="bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg overflow-hidden">
      {/* Ultra Compact View */}
      <div 
        className="p-1.5 cursor-pointer hover:bg-[#3C3C4E]/10 transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            {getProgressIcon()}
            <span className="text-[#A0A0B0] text-xs">
              {progress.completed}/{progress.total}
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className={`text-xs font-bold ${getTextColor()}`}>
              {progress.percentage}%
            </div>
            {progress.percentage === 100 && <span className="text-xs">🎉</span>}
            {isExpanded ? 
              <ChevronUp size={10} className="text-[#A0A0B0]" /> : 
              <ChevronDown size={10} className="text-[#A0A0B0]" />
            }
          </div>
        </div>
            
        {/* Ultra Thin Progress Bar */}
        <div className="mt-1">
          <div className="w-full bg-[#3C3C4E] rounded-full h-0.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r ${getProgressColor()}`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Minimalist Expanded View */}
      {isExpanded && (
        <div className="border-t border-[#3C3C4E]/30 bg-[#1E1E2E] p-2">          {/* Mini Stats */}
          <div className="grid grid-cols-5 gap-2 text-center mb-2">
            <div className="flex flex-col items-center">
              <CheckCircle size={12} className="text-[#10B981] mb-0.5" />
              <div className="text-xs font-bold text-[#10B981]">{progress.completed}</div>
              <div className="text-xs text-[#A0A0B0]">Hechas</div>
            </div>
            
            <div className="flex flex-col items-center">
              <Clock size={12} className="text-[#F59E0B] mb-0.5" />
              <div className="text-xs font-bold text-[#F59E0B]">{progress.pendingTasks?.length || 0}</div>
              <div className="text-xs text-[#A0A0B0]">Pendientes</div>
            </div>

            <div className="flex flex-col items-center">
              <Eye size={12} className="text-[#3B82F6] mb-0.5" />
              <div className="text-xs font-bold text-[#3B82F6]">{progress.inReviewTasks?.length || 0}</div>
              <div className="text-xs text-[#A0A0B0]">Revisión</div>
            </div>

            <div className="flex flex-col items-center">
              <RotateCcw size={12} className="text-[#EF4444] mb-0.5" />
              <div className="text-xs font-bold text-[#EF4444]">{progress.returnedTasks?.length || 0}</div>
              <div className="text-xs text-[#A0A0B0]">Devueltas</div>
            </div>
            
            <div className="flex flex-col items-center">
              <Target size={12} className="text-[#6B7280] mb-0.5" />
              <div className="text-xs font-bold text-[#6B7280]">{progress.total}</div>
              <div className="text-xs text-[#A0A0B0]">Total</div>
            </div>
          </div>

          {/* Completion Message */}
          {progress.percentage === 100 && (
            <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded p-1.5 text-center mb-2">
              <div className="flex items-center justify-center space-x-1">
                <CheckCircle size={12} className="text-[#10B981]" />
                <span className="text-[#10B981] text-xs font-medium">¡Completado!</span>
                <span className="text-xs">🎉</span>
              </div>
            </div>
          )}

          {/* Compact Pending Tasks */}
          {progress.pendingTasks.length > 0 && progress.percentage < 100 && (
            <div className="bg-[#2D2D3A] border border-[#3C3C4E]/30 rounded p-1.5">
              <div className="flex items-center mb-1">
                <Clock size={10} className="mr-1 text-[#F59E0B]" />
                <span className="text-xs font-medium text-white">Próximas ({progress.pendingTasks.length})</span>
              </div>
              <div className="space-y-0.5">
                {progress.pendingTasks.slice(0, 2).map((task) => (
                  <div key={task.id} className="flex items-center p-0.5 bg-[#3C3C4E]/20 rounded text-xs">
                    <div className="w-1 h-1 rounded-full bg-[#F59E0B] mr-1.5"></div>
                    <span className="text-[#A0A0B0] truncate">{task.title}</span>
                  </div>
                ))}
                {progress.pendingTasks.length > 2 && (
                  <div className="text-center">
                    <span className="text-xs text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded">
                      +{progress.pendingTasks.length - 2} más
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ObjectiveProgress;
