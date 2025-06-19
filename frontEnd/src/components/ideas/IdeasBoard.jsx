// src/components/ideas/IdeasBoard.jsx - Componente principal del muro de ideas
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Lightbulb, 
  Plus, 
  TrendingUp, 
  MessageSquare, 
  Star,
  AlertTriangle,
  Clock,
  Heart,
  ThumbsDown,
  X
} from 'lucide-react';

const IdeasBoard = ({ groupId }) => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('votes');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });
  // Verificar si el usuario es admin
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin' || userRole === 'supervisor';

  const loadIdeas = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = `http://localhost:3000/api/ideas/group/${groupId}`;
      const params = new URLSearchParams();
      
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (filter !== 'all') params.append('status', filter);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIdeas(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error cargando ideas:', error);
    } finally {
      setLoading(false);
    }  }, [groupId, filter, selectedCategory]);

  // Cargar ideas al montar el componente
  useEffect(() => {
    if (groupId) {
      loadIdeas();
    }
  }, [groupId, loadIdeas]);  const handleVote = async (ideaId, voteType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/ideas/${ideaId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ vote_type: voteType })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Actualizar solo la idea específica en el estado
          setIdeas(prevIdeas => 
            prevIdeas.map(idea => 
              idea.id === ideaId ? { ...idea, votes: data.data.votes } : idea
            )
          );
        } else {
          console.error('Error en la respuesta del servidor:', data.message);
        }
      } else {
        console.error('Error en la petición de voto:', response.statusText);
      }
    } catch (error) {
      console.error('Error votando idea:', error);
    }
  };

  const handleCreateIdea = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newIdea,
          group_id: groupId
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIdeas(prevIdeas => [data.data, ...prevIdeas]);
          setShowCreateModal(false);
          setNewIdea({
            title: '',
            description: '',
            category: 'general',
            priority: 'medium'
          });
        }
      }
    } catch (error) {
      console.error('Error creando idea:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-[#3C4043] text-[#B8B8B8]',
      proposed: 'bg-[#A8E6A3]/20 text-[#A8E6A3]',
      in_review: 'bg-yellow-500/20 text-yellow-400',
      approved: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400',
      implemented: 'bg-purple-500/20 text-purple-400'
    };
    return colors[status] || 'bg-[#3C4043] text-[#B8B8B8]';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      general: MessageSquare,
      feature: Star,
      improvement: TrendingUp,
      bug: AlertTriangle,
      other: Lightbulb
    };
    return icons[category] || Lightbulb;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-400',
      medium: 'text-yellow-400',
      high: 'text-orange-400',
      urgent: 'text-red-400'
    };
    return colors[priority] || 'text-[#B8B8B8]';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      draft: 'Borrador',
      proposed: 'Propuesta',
      in_review: 'En revisión',
      approved: 'Aprobada',
      rejected: 'Rechazada',
      implemented: 'Implementada'
    };
    return statusTexts[status] || status;
  };

  const getPriorityText = (priority) => {
    const priorityTexts = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      urgent: 'Urgente'
    };
    return priorityTexts[priority] || priority;
  };

  // Ordenar ideas
  const sortedIdeas = [...ideas].sort((a, b) => {
    switch (sortBy) {
      case 'votes':
        return b.votes - a.votes;
      case 'recent':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A8E6A3]"></div>
        <span className="ml-2 text-[#B8B8B8]">Cargando ideas...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#2C2C34] via-[#1A1A1F] to-[#0F0F12]">
      {/* Header */}
      <div className="border-b border-[#3C4043] bg-[#252529] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-6 w-6 text-[#A8E6A3]" />
            <h2 className="text-xl font-bold text-[#A8E6A3]">Muro de Ideas</h2>
            <span className="px-2 py-1 bg-[#A8E6A3]/20 text-[#A8E6A3] text-sm rounded-full">
              {ideas.length} ideas
            </span>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#A8E6A3] text-[#1A1A1F] rounded-lg hover:bg-[#90D68C] transition-all font-medium"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Nueva Idea</span>
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="mt-4 flex flex-wrap gap-3">
          {/* Filtro por estado */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-[#1A1A1F] border border-[#3C4043] rounded-lg text-[#E8E8E8] focus:border-[#A8E6A3] focus:outline-none"
          >
            <option value="all">Todos los estados</option>
            <option value="proposed">Propuestas</option>
            <option value="in_review">En revisión</option>
            <option value="approved">Aprobadas</option>
            <option value="implemented">Implementadas</option>
          </select>

          {/* Filtro por categoría */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-[#1A1A1F] border border-[#3C4043] rounded-lg text-[#E8E8E8] focus:border-[#A8E6A3] focus:outline-none"
          >
            <option value="all">Todas las categorías</option>
            <option value="general">General</option>
            <option value="feature">Características</option>
            <option value="improvement">Mejoras</option>
            <option value="bug">Errores</option>
            <option value="other">Otros</option>
          </select>

          {/* Ordenar por */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-[#1A1A1F] border border-[#3C4043] rounded-lg text-[#E8E8E8] focus:border-[#A8E6A3] focus:outline-none"
          >
            <option value="votes">Más votadas</option>
            <option value="recent">Más recientes</option>
            <option value="title">Por título</option>
          </select>
        </div>
      </div>

      {/* Lista de Ideas */}
      <div className="flex-1 overflow-y-auto p-4">
        {sortedIdeas.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className="h-16 w-16 text-[#3C4043] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#B8B8B8] mb-2">No hay ideas aún</h3>
            <p className="text-[#666] mb-4">
              {isAdmin ? '¡Sé el primero en compartir una idea brillante!' : 'Los administradores pueden crear ideas para que votes por ellas'}
            </p>
            {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-[#A8E6A3] text-[#1A1A1F] rounded-lg hover:bg-[#90D68C] transition-all font-medium"
              >
                Crear primera idea
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedIdeas.map((idea) => {
              const CategoryIcon = getCategoryIcon(idea.category);
              return (
                <div 
                  key={idea.id} 
                  className="group bg-gradient-to-br from-[#252529] to-[#1A1A1F] border border-[#3C4043] rounded-2xl p-6 hover:border-[#A8E6A3]/50 hover:shadow-2xl hover:shadow-[#A8E6A3]/10 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer relative overflow-hidden"
                >
                  {/* Header de la card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${
                        idea.category === 'feature' ? 'from-blue-500 to-blue-600' :
                        idea.category === 'improvement' ? 'from-green-500 to-green-600' :
                        idea.category === 'bug' ? 'from-red-500 to-red-600' :
                        'from-[#A8E6A3] to-[#90D68C]'
                      } group-hover:scale-110 transition-transform duration-300`}>
                        <CategoryIcon size={20} className="text-white" />
                      </div>
                      <div>
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(idea.status)}`}>
                          {getStatusText(idea.status)}
                        </span>
                        <div className={`mt-1 text-xs font-semibold ${getPriorityColor(idea.priority)}`}>
                          {getPriorityText(idea.priority)}
                        </div>
                      </div>
                    </div>
                      {/* Votación simple */}
                    <div className="flex items-center gap-2 bg-[#1A1A1F] rounded-xl p-2 group-hover:bg-[#2C2C34] transition-colors">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(idea.id, 'up');
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[#B8B8B8] hover:text-[#A8E6A3] hover:bg-[#A8E6A3]/10 transition-all"
                      >
                        <Heart size={16} />
                        <span className="text-sm font-medium">{idea.votes || 0}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(idea.id, 'down');
                        }}
                        className="p-1 rounded-lg text-[#B8B8B8] hover:text-red-400 hover:bg-red-400/10 transition-all"
                      >
                        <ThumbsDown size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Título */}
                  <h3 className="font-bold text-white text-lg mb-3 group-hover:text-[#A8E6A3] transition-colors line-clamp-2">
                    {idea.title}
                  </h3>

                  {/* Descripción */}
                  <p className="text-[#B8B8B8] text-sm mb-4 line-clamp-3 leading-relaxed">
                    {idea.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-[#666] pt-4 border-t border-[#3C4043] group-hover:border-[#A8E6A3]/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-[#A8E6A3] rounded-full flex items-center justify-center text-[#1A1A1F] font-semibold text-xs">
                        {idea.created_by_username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{idea.created_by_username}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Indicador de hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#A8E6A3]/0 to-[#A8E6A3]/0 group-hover:from-[#A8E6A3]/5 group-hover:to-[#90D68C]/5 rounded-2xl transition-all duration-300 pointer-events-none"></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de crear idea */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#252529] rounded-2xl p-6 w-full max-w-md border border-[#3C4043]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#A8E6A3]">Nueva Idea</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#B8B8B8] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateIdea} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#E8E8E8] mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={newIdea.title}
                  onChange={(e) => setNewIdea({...newIdea, title: e.target.value})}
                  className="w-full px-3 py-2 bg-[#1A1A1F] border border-[#3C4043] rounded-lg text-[#E8E8E8] focus:border-[#A8E6A3] focus:outline-none"
                  placeholder="Título de la idea..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#E8E8E8] mb-2">
                  Descripción
                </label>
                <textarea
                  value={newIdea.description}
                  onChange={(e) => setNewIdea({...newIdea, description: e.target.value})}
                  className="w-full px-3 py-2 bg-[#1A1A1F] border border-[#3C4043] rounded-lg text-[#E8E8E8] focus:border-[#A8E6A3] focus:outline-none h-24 resize-none"
                  placeholder="Describe tu idea..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#E8E8E8] mb-2">
                    Categoría
                  </label>
                  <select
                    value={newIdea.category}
                    onChange={(e) => setNewIdea({...newIdea, category: e.target.value})}
                    className="w-full px-3 py-2 bg-[#1A1A1F] border border-[#3C4043] rounded-lg text-[#E8E8E8] focus:border-[#A8E6A3] focus:outline-none"
                  >
                    <option value="general">General</option>
                    <option value="feature">Características</option>
                    <option value="improvement">Mejoras</option>
                    <option value="bug">Errores</option>
                    <option value="other">Otros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#E8E8E8] mb-2">
                    Prioridad
                  </label>
                  <select
                    value={newIdea.priority}
                    onChange={(e) => setNewIdea({...newIdea, priority: e.target.value})}
                    className="w-full px-3 py-2 bg-[#1A1A1F] border border-[#3C4043] rounded-lg text-[#E8E8E8] focus:border-[#A8E6A3] focus:outline-none"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-[#3C4043] text-[#B8B8B8] rounded-lg hover:bg-[#4A4A50] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#A8E6A3] text-[#1A1A1F] rounded-lg hover:bg-[#90D68C] transition-colors font-medium"
                >
                  Crear Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeasBoard;
