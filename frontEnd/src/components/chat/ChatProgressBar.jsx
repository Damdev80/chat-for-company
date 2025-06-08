import React, { useState, useEffect, useCallback } from 'react';
import { Target, TrendingUp, ChevronDown, ChevronUp, Users, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { fetchObjectivesByGroup } from '../../utils/api';
import { getToken } from '../../utils/auth';

const ChatProgressBar = ({ groupId, onToggleObjectives }) => {  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProgress, setTotalProgress] = useState(0);
  const [completedObjectives, setCompletedObjectives] = useState(0);
  const [totalObjectives, setTotalObjectives] = useState(0);
  const [activeTasks, setActiveTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [expanded, setExpanded] = useState(false);

  // Calculate progress from tasks (mismo método que ObjectiveProgressSummary)
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
    if (!groupId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = getToken();
      const result = await fetchObjectivesByGroup(groupId, token);
      const objectivesList = Array.isArray(result) ? result : result.objectives || [];
      
      // Process objectives and calculate correct progress from tasks
      const processedObjectives = objectivesList.map(obj => {
        if (obj.tasks && Array.isArray(obj.tasks)) {
          const calculatedProgress = calculateProgressFromTasks(obj.tasks);
          return {
            ...obj,
            progress: {
              ...obj.progress,
              ...calculatedProgress
            }
          };
        }
        return obj;
      });
        setObjectives(processedObjectives);
      setTotalObjectives(processedObjectives.length);
      
      if (processedObjectives.length > 0) {
        // Calcular progreso total
        const totalProgress = processedObjectives.reduce((sum, obj) => {
          const percentage = obj.progress?.percentage ?? 0;
          return sum + percentage;
        }, 0) / processedObjectives.length;
        
        // Contar objetivos completados (100%)
        const completed = processedObjectives.filter(obj => 
          (obj.progress?.percentage ?? 0) === 100
        ).length;
        
        // Calcular estadísticas de tareas
        const allTasks = processedObjectives.flatMap(obj => obj.tasks || []);
        const completedTasksCount = allTasks.filter(task => 
          task && (
            task.status === 'completed' || 
            task.status === 'completada' ||
            task.status === 'complete' ||
            task.status === 'finalizada'
          )
        ).length;
        
        setTotalProgress(Math.round(totalProgress));
        setCompletedObjectives(completed);
        setActiveTasks(allTasks.length);
        setCompletedTasks(completedTasksCount);
      } else {
        setTotalProgress(0);
        setCompletedObjectives(0);
        setActiveTasks(0);
        setCompletedTasks(0);
      }
    } catch (error) {
      console.error('Error al cargar objetivos para chat progress bar:', error);
      setObjectives([]);
      setTotalProgress(0);
      setCompletedObjectives(0);
    } finally {
      setLoading(false);
    }
  }, [groupId, calculateProgressFromTasks]);
  useEffect(() => {
    // Reset state when groupId changes
    setLoading(true);
    setExpanded(false);
    setObjectives([]);
    setTotalProgress(0);
    setCompletedObjectives(0);
    setTotalObjectives(0);
    setActiveTasks(0);
    setCompletedTasks(0);
    
    loadObjectives();
  }, [loadObjectives]);

  // Listen for progress updates from Socket.IO
  useEffect(() => {
    const handleProgressUpdate = (event) => {
      const data = event.detail;
      if (data.group_id === groupId) {
        loadObjectives();
      }
    };

    window.addEventListener('objectiveProgressUpdate', handleProgressUpdate);
    return () => {
      window.removeEventListener('objectiveProgressUpdate', handleProgressUpdate);
    };
  }, [groupId, loadObjectives]);

  // No mostrar barra para el chat global si no hay objetivos
  if (groupId === 'global' && totalObjectives === 0) {
    return null;
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'from-green-500 to-emerald-400';
    if (percentage >= 60) return 'from-yellow-500 to-amber-400';
    if (percentage >= 40) return 'from-orange-500 to-yellow-400';
    return 'from-red-500 to-orange-400';
  };

  const getProgressText = () => {
    if (loading) return 'Cargando progreso...';
    if (totalObjectives === 0) return 'Sin objetivos asignados';
    return `${completedObjectives}/${totalObjectives} objetivos completados`;
  };

  return (    <div className="border-b border-[#3C4043] bg-gradient-to-r from-[#2C2C34] to-[#252529]">
      {/* Barra principal compacta - Responsiva */}
      <div 
        className="p-3 sm:p-4 cursor-pointer hover:bg-[#3C4043]/30 transition-all duration-200"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {/* Icono */}
          <div className="p-1.5 bg-[#A8E6A3]/20 rounded-lg flex-shrink-0">
            <Target size={16} className="text-[#A8E6A3]" />
          </div>

          {/* Información principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="text-sm font-medium text-[#E8E8E8] truncate">
                Progreso del Grupo
              </h4>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!loading && (
                  <span className="text-xs sm:text-sm text-[#A8E6A3] font-semibold">
                    {totalProgress}%
                  </span>
                )}
                {expanded ? (
                  <ChevronUp size={16} className="text-[#B8B8B8]" />
                ) : (
                  <ChevronDown size={16} className="text-[#B8B8B8]" />
                )}
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-[#3C4043] rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getProgressColor(totalProgress)} transition-all duration-300 ease-out`}
                  style={{ width: `${loading ? 0 : totalProgress}%` }}
                />
              </div>
              <span className="text-xs text-[#B8B8B8] whitespace-nowrap hidden sm:inline">
                {getProgressText()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel expandido */}
      {expanded && (
        <div className="border-t border-[#3C4043]/50 bg-[#252529]/50 p-4 animate-in slide-in-from-top-2 duration-200">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2 text-[#B8B8B8]">
                <div className="w-4 h-4 border-2 border-[#A8E6A3] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Cargando objetivos...</span>
              </div>
            </div>
          ) : objectives.length === 0 ? (
            <div className="text-center py-4">
              <Target size={24} className="text-[#B8B8B8] mx-auto mb-2" />
              <p className="text-sm text-[#B8B8B8] mb-2">No hay objetivos asignados</p>
              <button 
                onClick={onToggleObjectives}
                className="text-xs text-[#A8E6A3] hover:text-[#7DD3C0] transition-colors"
              >
                Ir a Gestión de Objetivos
              </button>
            </div>
          ) : (            <div className="space-y-3">
              {/* Resumen de estadísticas */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center p-2 bg-[#3C4043]/30 rounded-lg">
                  <div className="text-lg font-bold text-[#A8E6A3]">{totalObjectives}</div>
                  <div className="text-xs text-[#B8B8B8]">Objetivos</div>
                </div>
                <div className="text-center p-2 bg-[#3C4043]/30 rounded-lg">
                  <div className="text-lg font-bold text-green-400">{completedObjectives}</div>
                  <div className="text-xs text-[#B8B8B8]">Completados</div>
                </div>
                <div className="text-center p-2 bg-[#3C4043]/30 rounded-lg">
                  <div className="text-lg font-bold text-blue-400">{completedTasks}/{activeTasks}</div>
                  <div className="text-xs text-[#B8B8B8]">Tareas</div>
                </div>
                <div className="text-center p-2 bg-[#3C4043]/30 rounded-lg">
                  <div className="text-lg font-bold text-[#A8E6A3]">{totalProgress}%</div>
                  <div className="text-xs text-[#B8B8B8]">Progreso</div>
                </div>
              </div>              {/* Lista de objetivos resumida */}
              <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-[#A8E6A3] scrollbar-track-[#3C4043]">
                {objectives.slice(0, 3).map((objective) => {
                  const progress = objective.progress?.percentage ?? 0;
                  const isCompleted = progress === 100;
                  const isInProgress = progress > 0 && progress < 100;
                  
                  return (
                    <div key={objective.id} className="flex items-center gap-2 p-2 bg-[#3C4043]/20 rounded-lg">
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 size={16} className="text-green-400" />
                        ) : isInProgress ? (
                          <Target size={16} className="text-[#A8E6A3]" />
                        ) : (
                          <AlertTriangle size={16} className="text-orange-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#E8E8E8] truncate">
                          {objective.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-[#3C4043] rounded-full">
                            <div 
                              className={`h-full bg-gradient-to-r ${getProgressColor(progress)} rounded-full transition-all duration-300`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#A8E6A3] font-medium">
                            {progress}%
                          </span>
                        </div>
                        {objective.tasks && objective.tasks.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Users size={10} className="text-[#B8B8B8]" />
                            <span className="text-xs text-[#B8B8B8]">
                              {objective.progress?.completed || 0}/{objective.progress?.total || 0} tareas
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {objectives.length > 3 && (
                  <div className="text-center py-2">
                    <span className="text-xs text-[#B8B8B8]">
                      +{objectives.length - 3} objetivos más
                    </span>
                  </div>
                )}
              </div>

              {/* Botón para ir a objetivos */}
              <div className="pt-2 border-t border-[#3C4043]/50">
                <button 
                  onClick={onToggleObjectives}
                  className="w-full p-2 bg-[#A8E6A3]/10 hover:bg-[#A8E6A3]/20 border border-[#A8E6A3]/30 rounded-lg transition-all duration-200 text-sm text-[#A8E6A3] font-medium"
                >
                  Ver Gestión Completa de Objetivos
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatProgressBar;
