// src/components/ideas/IdeasBoard.jsx - Componente principal del muro de ideas
import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Plus, 
  Filter, 
  TrendingUp, 
  MessageSquare, 
  Calendar,
  Users,
  Star,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Trash2
} from 'lucide-react';

const IdeasBoard = ({ groupId, currentUser }) => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('votes');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Cargar ideas al montar el componente
  useEffect(() => {
    if (groupId) {
      loadIdeas();
    }
  }, [groupId, filter, selectedCategory]);

  const loadIdeas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = `/api/ideas/${groupId}`;
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
    }
  };

  const handleVote = async (ideaId, voteType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/ideas/${ideaId}/vote`, {
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
          // Actualizar la idea en el estado
          setIdeas(prevIdeas => 
            prevIdeas.map(idea => 
              idea.id === ideaId ? data.data : idea
            )
          );
        }
      }
    } catch (error) {
      console.error('Error votando idea:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      proposed: 'bg-blue-100 text-blue-700',
      in_review: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      implemented: 'bg-purple-100 text-purple-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
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
      low: 'text-green-500',
      medium: 'text-yellow-500',
      high: 'text-orange-500',
      urgent: 'text-red-500'
    };
    return colors[priority] || 'text-gray-500';
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Cargando ideas...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Muro de Ideas</h2>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
              {ideas.length} ideas
            </span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus size={16} />
            Nueva Idea
          </button>
        </div>

        {/* Filtros */}
        <div className="mt-4 flex flex-wrap gap-4">
          {/* Filtro por estado */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white"
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
            className="px-3 py-2 border rounded-lg bg-white"
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
            className="px-3 py-2 border rounded-lg bg-white"
          >
            <option value="votes">Más votadas</option>
            <option value="recent">Más recientes</option>
            <option value="title">Por título</option>
          </select>
        </div>
      </div>

      {/* Lista de Ideas */}
      <div className="p-6">
        {sortedIdeas.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ideas aún</h3>
            <p className="text-gray-500 mb-4">¡Sé el primero en compartir una idea brillante!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Crear primera idea
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {sortedIdeas.map((idea) => {
              const CategoryIcon = getCategoryIcon(idea.category);
              return (
                <div key={idea.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header de la idea */}
                      <div className="flex items-center gap-2 mb-2">
                        <CategoryIcon size={16} className="text-purple-600" />
                        <h3 className="font-semibold text-gray-900">{idea.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(idea.status)}`}>
                          {idea.status}
                        </span>
                        <span className={`text-xs font-medium ${getPriorityColor(idea.priority)}`}>
                          {idea.priority}
                        </span>
                      </div>

                      {/* Descripción */}
                      <p className="text-gray-600 mb-3">{idea.description}</p>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Por {idea.created_by_username}</span>
                        <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {idea.category}
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 ml-4">
                      {/* Votación */}
                      <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                        <button
                          onClick={() => handleVote(idea.id, 'up')}
                          className="p-1 hover:bg-green-100 rounded transition-colors"
                        >
                          <ThumbsUp size={14} className="text-green-600" />
                        </button>
                        <span className="px-2 text-sm font-medium">{idea.votes}</span>
                        <button
                          onClick={() => handleVote(idea.id, 'down')}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                        >
                          <ThumbsDown size={14} className="text-red-600" />
                        </button>
                      </div>

                      {/* Acciones del creador */}
                      {idea.user_id === currentUser?.id && (
                        <div className="flex gap-1">
                          <button className="p-1 hover:bg-blue-100 rounded transition-colors">
                            <Edit size={14} className="text-blue-600" />
                          </button>
                          <button className="p-1 hover:bg-red-100 rounded transition-colors">
                            <Trash2 size={14} className="text-red-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de crear idea */}
      {showCreateModal && (
        <CreateIdeaModal
          groupId={groupId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadIdeas();
          }}
        />
      )}
    </div>
  );
};

// Componente modal para crear ideas (simplificado por ahora)
const CreateIdeaModal = ({ groupId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          group_id: groupId
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Error creando idea:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Nueva Idea</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Título de tu idea..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows="3"
              placeholder="Describe tu idea..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="general">General</option>
                <option value="feature">Característica</option>
                <option value="improvement">Mejora</option>
                <option value="bug">Error</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Prioridad</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              disabled={loading || !formData.title.trim()}
            >
              {loading ? 'Creando...' : 'Crear Idea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IdeasBoard;
