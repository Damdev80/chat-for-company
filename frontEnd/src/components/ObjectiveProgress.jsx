import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import confetti from 'canvas-confetti';
import { CheckCircle, Clock, Target, Users } from 'lucide-react';

const ObjectiveProgress = ({ objective, onProgressUpdate }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  // Wrap triggerConfetti in useCallback to avoid unnecessary dependency changes
  const triggerConfetti = useCallback(() => {
    // Create a burst of confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444']
    });

    // Add a second burst after a short delay
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
    }, 250);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 400);
  }, []);

  const calculateProgress = useCallback((tasks) => {
    setLoading(true);
    try {
      if (!Array.isArray(tasks) || tasks.length === 0) {
        setProgress({
          total: 0,
          completed: 0,
          percentage: 0,
          pendingTasks: []
        });
        return; // finally will still execute
      }

      const completed = tasks.filter(task => task && task.status === 'completed').length;
      const total = tasks.length;
      let percentage = 0;
      if (total > 0) {
        percentage = Math.round((completed / total) * 100);
      }

      if (isNaN(percentage)) {
        console.warn('ObjectiveProgress: Calculated percentage was NaN. Defaulting to 0. Tasks:', tasks);
        percentage = 0;
      }

      const pendingTasks = tasks.filter(task => task && task.status === 'pending');

      const newProgress = {
        total,
        completed,
        percentage,
        pendingTasks
      };

      setProgress(newProgress);

      if (percentage === 100 && !hasTriggeredConfetti) {
        triggerConfetti();
        setHasTriggeredConfetti(true);
        if (onProgressUpdate) {
          onProgressUpdate(newProgress);
        }
      } else if (percentage < 100 && hasTriggeredConfetti) {
        setHasTriggeredConfetti(false);
      }
    } catch (error) {
      console.error("Error in calculateProgress:", error, "Tasks input:", tasks);
      setProgress({
        total: 0,
        completed: 0,
        percentage: 0,
        pendingTasks: [],
        error: true
      });
    } finally {
      setLoading(false);
    }
  }, [setLoading, setProgress, hasTriggeredConfetti, setHasTriggeredConfetti, onProgressUpdate, triggerConfetti]);

  useEffect(() => {
    if (objective) {
      // calculateProgress will internally handle if objective.tasks is not an array or is empty.
      calculateProgress(objective.tasks);
    } else {
      // No objective.
      setProgress(null);
      setLoading(false); // Ensure loading is false
      if (hasTriggeredConfetti) { // Reset confetti if objective is removed
        setHasTriggeredConfetti(false);
      }
    }
  }, [objective, calculateProgress, hasTriggeredConfetti]);


  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-[#3C3C4E] rounded-full mb-2"></div>
        <div className="h-3 bg-[#3C3C4E] rounded w-3/4"></div>
      </div>
    );
  }

  if (!progress || progress.error) {
    return (
      <div className="text-[#A0A0B0] text-sm bg-[#1E1E2E] rounded-lg p-3 border border-[#3C3C4E]">
        <Clock size={16} className="inline mr-1" />
        {progress && progress.error ? "Error al calcular progreso." : "Sin tareas asignadas"}
      </div>
    );
  }
  const getProgressColor = (percentage) => {
    if (isNaN(percentage) || percentage <= 0) return 'bg-gray-500'; // Neutral for 0% or NaN
    if (percentage === 100) return 'bg-[#4ADE80]'; // Green for 100%
    if (percentage >= 75) return 'bg-blue-400';   // Blue for 75-99%
    if (percentage >= 50) return 'bg-yellow-400'; // Yellow for 50-74%
    return 'bg-gray-200'; // Red for 1-49%
  };

  const getProgressTextColor = (percentage) => {
    if (isNaN(percentage) || percentage <= 0) return 'text-gray-500'; // Neutral for 0% or NaN
    if (percentage === 100) return 'text-[#4ADE80]';
    if (percentage >= 75) return 'text-blue-400';
    if (percentage >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-3 p-1 rounded-lg max-h-96 overflow-y-auto"> 
      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center mb-0.5">
          <div className="flex items-center space-x-1.5">
            <Target size={16} className={getProgressTextColor(progress.percentage)} />
            <span className="text-sm font-medium text-white">
              Progreso del Objetivo
            </span>
          </div>
          <div className={`text-base font-semibold ${getProgressTextColor(progress.percentage)}`}>
            {progress.percentage}%
          </div>
        </div>
        
        <div className="w-full bg-gradient-to-r from-[#2D2D3A] to-[#3C3C4E] rounded-full h-4 overflow-hidden border-2 border-transparent group hover:border-[#4ADE80]/50 transition-all duration-300 shadow-md">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-in-out ${getProgressColor(progress.percentage)} flex items-center justify-end shadow-lg relative overflow-hidden`}
            style={{ width: `${progress.percentage}%` }}
          >
            {/* Animated shine effect */}
            {progress.percentage > 0 && progress.percentage < 100 && (
              <div className="absolute top-0 left-0 h-full w-full bg-white/20 opacity-50 animate-shine group-hover:animate-none"></div>
            )}
            {progress.percentage === 100 && (
              <div className="h-full w-full bg-gradient-to-r from-[#4ADE80] via-[#60A5FA] to-[#4ADE80] animate-pulseSlow"></div> // Enhanced completion pulse
            )}
             {/* Inner text for low percentages, visible on hover */}
            {progress.percentage < 30 && progress.percentage > 0 && (
              <span className="absolute left-2 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {progress.percentage}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
        <div className="bg-[#2D2D3A]/70 border border-[#3C3C4E]/50 rounded-lg p-2 flex items-center space-x-1.5 hover:bg-[#3C3C4E]/50 transition-colors duration-200">
          <CheckCircle size={16} className="text-[#4ADE80]" />
          <div>
            <span className="block text-white font-medium">{progress.completed}</span>
            <span className="text-[#A0A0B0] text-xs">Completadas</span>
          </div>
        </div>
        <div className="bg-[#2D2D3A]/70 border border-[#3C3C4E]/50 rounded-lg p-2 flex items-center space-x-1.5 hover:bg-[#3C3C4E]/50 transition-colors duration-200">
          <Clock size={16} className="text-orange-400" />
          <div>
            <span className="block text-white font-medium">{progress.total - progress.completed}</span>
            <span className="text-[#A0A0B0] text-xs">Pendientes</span>
          </div>
        </div>
        <div className="bg-[#2D2D3A]/70 border border-[#3C3C4E]/50 rounded-lg p-2 flex items-center space-x-1.5 hover:bg-[#3C3C4E]/50 transition-colors duration-200">
          <Users size={16} className="text-blue-400" />
          <div>
            <span className="block text-white font-medium">{progress.total}</span>
            <span className="text-[#A0A0B0] text-xs">Total Tareas</span>
          </div>
        </div>
      </div>

      {/* Completion Message */}
      {progress.percentage === 100 && (
        <div className="bg-gradient-to-r from-[#4ADE80]/20 to-[#60A5FA]/20 border border-[#4ADE80]/50 rounded-lg p-3 shadow-lg">
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle size={18} className="text-[#4ADE80]" />
            <span className="text-white text-sm font-medium">
              ¡Felicidades! Objetivo Completado 🎉
            </span>
          </div>
        </div>
      )}

      {/* Pending Tasks Preview - Enhanced */}
      {progress.pendingTasks.length > 0 && progress.percentage < 100 && (
        <div className="bg-[#2D2D3A]/70 border border-[#3C3C4E]/50 rounded-lg p-3">
          <h4 className="text-xs font-medium text-white mb-1.5 flex items-center space-x-1.5">
            <Clock size={15} className="text-orange-400" />
            <span>Próximas Tareas Pendientes ({progress.pendingTasks.length})</span>
          </h4>
          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1.5">
            {progress.pendingTasks.slice(0, 3).map(task => (
              <div key={task.id} className="text-xs text-[#A0A0B0] flex items-center justify-between p-1.5 bg-[#1E1E2E] rounded hover:bg-[#3C3C4E]/30 transition-colors">
                <div className="flex items-center space-x-1.5 truncate">
                  <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'}`}></div>
                  <span className="truncate">{task.title}</span>
                </div>
                {task.due_date && (
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    Vence: {new Date(task.due_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
            ))}
            {progress.pendingTasks.length > 3 && (
              <div className="text-center text-xs text-[#4ADE80] pt-1">
                ...y {progress.pendingTasks.length - 3} más.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Add this to your index.css or a global stylesheet for the animations
/*
@keyframes shine {
  0% { transform: translateX(-100%) skewX(-20deg); }
  100% { transform: translateX(100%) skewX(-20deg); }
}
.animate-shine {
  animation: shine 1.5s infinite linear;
}

@keyframes pulseSlow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.animate-pulseSlow {
  animation: pulseSlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
*/

export default ObjectiveProgress;
