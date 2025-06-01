import React, { useState, useEffect, useCallback } from 'react';
import { Target, TrendingUp, Users, Clock } from 'lucide-react';
import { fetchObjectivesByGroup } from '../utils/api';
import { getToken } from '../utils/auth';

const ObjectiveProgressSummary = ({ groupId, groupName }) => {
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProgress, setTotalProgress] = useState(0);

  const loadObjectives = useCallback(async () => {
    try {
      const token = getToken();
      const result = await fetchObjectivesByGroup(groupId, token);
      const objectivesList = Array.isArray(result) ? result : result.objectives || [];
      setObjectives(objectivesList);
      
      // Calcular progreso total
      if (objectivesList.length > 0) {
        const totalProgress = objectivesList.reduce((sum, obj) => {
          return sum + (obj.progress || 0);
        }, 0) / objectivesList.length;
        setTotalProgress(Math.round(totalProgress));
      } else {
        setTotalProgress(0);
      }
    } catch (error) {
      console.error('Error al cargar objetivos:', error);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadObjectives();
  }, [loadObjectives]);

  const getProgressColor = (progress) => {
    if (progress >= 75) return '#4ADE80'; // Verde
    if (progress >= 50) return '#60A5FA'; // Azul
    if (progress >= 25) return '#FBBF24'; // Amarillo
    return '#F87171'; // Rojo
  };

  const activeObjectives = objectives.filter(obj => obj.progress < 100);
  const completedObjectives = objectives.filter(obj => obj.progress === 100);

  if (loading) {
    return (
      <div className="bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-[#3C3C4E] rounded mb-2"></div>
        <div className="h-8 bg-[#3C3C4E] rounded"></div>
      </div>
    );
  }

  if (objectives.length === 0) {
    return (
      <div className="bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg p-4">
        <div className="flex items-center space-x-2 text-[#A0A0B0]">
          <Target size={16} />
          <span className="text-sm">No hay objetivos en {groupName}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#2D2D3A] border border-[#3C3C4E] rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Target size={16} className="text-[#4ADE80]" />
          <span className="text-sm font-medium text-white">Progreso de {groupName}</span>
        </div>
        <span className="text-xs text-[#A0A0B0]">{objectives.length} objetivos</span>
      </div>

      {/* Progreso general */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#A0A0B0]">Progreso General</span>
          <span className="text-xs font-medium text-white">{totalProgress}%</span>
        </div>
        <div className="w-full bg-[#3C3C4E] rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${totalProgress}%`,
              backgroundColor: getProgressColor(totalProgress)
            }}
          />
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="text-lg font-bold text-[#4ADE80]">{completedObjectives.length}</div>
          <div className="text-xs text-[#A0A0B0]">Completados</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-400">{activeObjectives.length}</div>
          <div className="text-xs text-[#A0A0B0]">En Progreso</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-[#60A5FA]">{objectives.length}</div>
          <div className="text-xs text-[#A0A0B0]">Total</div>
        </div>
      </div>

      {/* Objetivos activos (máximo 2) */}
      {activeObjectives.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-[#A0A0B0] font-medium">Objetivos Activos:</div>
          {activeObjectives.slice(0, 2).map(objective => (
            <div key={objective.id} className="flex items-center justify-between text-xs">
              <span className="text-white truncate flex-1 mr-2">{objective.title}</span>
              <div className="flex items-center space-x-2">
                <div className="w-12 bg-[#3C3C4E] rounded-full h-1">
                  <div 
                    className="h-1 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${objective.progress || 0}%`,
                      backgroundColor: getProgressColor(objective.progress || 0)
                    }}
                  />
                </div>
                <span className="text-[#A0A0B0] w-8 text-right">{objective.progress || 0}%</span>
              </div>
            </div>
          ))}
          {activeObjectives.length > 2 && (
            <div className="text-xs text-[#A0A0B0] text-center">
              +{activeObjectives.length - 2} objetivos más
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ObjectiveProgressSummary;
