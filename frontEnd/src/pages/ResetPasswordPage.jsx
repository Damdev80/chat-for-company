// src/pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { API_ENDPOINTS, apiRequest } from '../config/api';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Validar token al cargar la página
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Token de recuperación no válido');
        setValidatingToken(false);
        return;
      }

      try {
        const response = await apiRequest(`${API_ENDPOINTS.passwordReset.validate}/${token}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setTokenValid(true);
            setUserInfo(data.data);
          } else {
            setError(data.message || 'Token inválido o expirado');
          }
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Token inválido o expirado');
        }
      } catch (error) {
        console.error('Error validating token:', error);
        setError('Error de conexión. Inténtalo de nuevo.');
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiRequest(API_ENDPOINTS.passwordReset.reset, {
        method: 'POST',
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuccess(true);
        } else {
          setError(data.message || 'Error al restablecer la contraseña');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al restablecer la contraseña');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError(''); // Limpiar error al escribir
  };

  // Loading de validación de token
  if (validatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2C2C34] via-[#1A1A1F] to-[#0F0F12] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#252529] rounded-2xl p-8 border border-[#3C4043] text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A8E6A3] mx-auto mb-4"></div>
            <p className="text-[#B8B8B8]">Validando token de recuperación...</p>
          </div>
        </div>
      </div>
    );
  }

  // Token inválido
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2C2C34] via-[#1A1A1F] to-[#0F0F12] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#252529] rounded-2xl p-8 border border-[#3C4043] text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-[#E8E8E8] mb-4">
              Token Inválido
            </h2>
            
            <p className="text-[#B8B8B8] mb-6">
              {error || 'El enlace de recuperación ha expirado o no es válido.'}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/forgot-password')}
                className="w-full px-4 py-3 bg-[#A8E6A3] text-[#1A1A1F] rounded-lg hover:bg-[#90D68C] transition-all font-medium"
              >
                Solicitar Nuevo Enlace
              </button>
              
              <button
                onClick={() => navigate('/login')}
                className="w-full px-4 py-3 bg-[#3C4043] text-[#B8B8B8] rounded-lg hover:bg-[#4A4A50] transition-all"
              >
                Volver al Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Éxito
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2C2C34] via-[#1A1A1F] to-[#0F0F12] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#252529] rounded-2xl p-8 border border-[#3C4043] text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-[#E8E8E8] mb-4">
              ¡Contraseña Actualizada!
            </h2>
            
            <p className="text-[#B8B8B8] mb-6">
              Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            
            <button
              onClick={() => navigate('/login')}
              className="w-full px-4 py-3 bg-[#A8E6A3] text-[#1A1A1F] rounded-lg hover:bg-[#90D68C] transition-all font-medium"
            >
              Ir al Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de reset
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2C2C34] via-[#1A1A1F] to-[#0F0F12] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#252529] rounded-2xl p-8 border border-[#3C4043]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#A8E6A3]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-[#A8E6A3]" />
            </div>
            <h2 className="text-2xl font-bold text-[#E8E8E8] mb-2">
              Nueva Contraseña
            </h2>
            {userInfo && (
              <p className="text-[#B8B8B8]">
                Establece una nueva contraseña para <span className="text-[#A8E6A3] font-medium">{userInfo.username}</span>
              </p>
            )}
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400">
                <AlertTriangle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#E8E8E8] mb-2">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#1A1A1F] border border-[#3C4043] rounded-lg text-[#E8E8E8] placeholder-[#666] focus:border-[#A8E6A3] focus:outline-none focus:ring-2 focus:ring-[#A8E6A3]/20 transition-all pr-12"
                  placeholder="Mínimo 6 caracteres"
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666] hover:text-[#A8E6A3] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#E8E8E8] mb-2">
                Confirmar Contraseña
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#1A1A1F] border border-[#3C4043] rounded-lg text-[#E8E8E8] placeholder-[#666] focus:border-[#A8E6A3] focus:outline-none focus:ring-2 focus:ring-[#A8E6A3]/20 transition-all"
                placeholder="Confirma tu nueva contraseña"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#A8E6A3] text-[#1A1A1F] rounded-lg hover:bg-[#90D68C] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1A1A1F]"></div>
                  Actualizando...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Actualizar Contraseña
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-[#A8E6A3] hover:text-[#90D68C] text-sm font-medium transition-colors"
            >
              ← Volver al Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
