// src/components/auth/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { apiRequest, API_ENDPOINTS } from '../../config/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  // Validar token al cargar el componente
  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await apiRequest(`${API_ENDPOINTS.auth}/password-reset/validate/${token}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setTokenValid(true);
            setUserInfo(data.data);
          } else {
            setError(data.message || 'Token inválido o expirado');
          }
        } else {
          setError('Token inválido o expirado');
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
    setLoading(true);
    setError('');

    // Validaciones
    if (formData.newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const response = await apiRequest(`${API_ENDPOINTS.auth}/password-reset/reset`, {
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
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setError(data.message || 'Error al cambiar la contraseña');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al cambiar la contraseña');
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
  };

  // Validando token
  if (validatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2C2C34] via-[#1A1A1F] to-[#0F0F12] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-[#252529] to-[#1A1A1F] rounded-2xl shadow-2xl border border-[#3C4043] p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#A8E6A3] border-t-transparent mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-white mb-2">Validando token...</h2>
              <p className="text-[#B8B8B8] text-sm">Por favor espera un momento</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Token inválido
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2C2C34] via-[#1A1A1F] to-[#0F0F12] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-[#252529] to-[#1A1A1F] rounded-2xl shadow-2xl border border-[#3C4043] p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-900/20 rounded-full mb-4">
                <AlertCircle size={32} className="text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Token Inválido</h2>
              <p className="text-[#B8B8B8] text-sm mb-6">
                {error || 'El enlace de recuperación es inválido o ha expirado.'}
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#A8E6A3] to-[#90D68C] text-[#1A1A1F] rounded-xl hover:from-[#90D68C] hover:to-[#7FC77A] transition-all duration-200 font-semibold"
              >
                <ArrowLeft size={16} />
                Volver al login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Contraseña cambiada exitosamente
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2C2C34] via-[#1A1A1F] to-[#0F0F12] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-[#252529] to-[#1A1A1F] rounded-2xl shadow-2xl border border-[#3C4043] p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#A8E6A3] to-[#90D68C] rounded-full mb-4">
                <CheckCircle size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">¡Contraseña Cambiada!</h2>
              <p className="text-[#B8B8B8] text-sm mb-6">
                Tu contraseña ha sido actualizada correctamente. Serás redirigido al login en unos segundos.
              </p>
              <div className="animate-pulse text-[#A8E6A3] text-sm">
                Redirigiendo...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de cambio de contraseña
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2C2C34] via-[#1A1A1F] to-[#0F0F12] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-gradient-to-br from-[#252529] to-[#1A1A1F] rounded-2xl shadow-2xl border border-[#3C4043] p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#A8E6A3] to-[#90D68C] rounded-xl mb-4">
              <Lock size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Nueva Contraseña</h2>
            {userInfo && (
              <p className="text-[#B8B8B8] text-sm">
                Hola <span className="text-[#A8E6A3] font-medium">{userInfo.username}</span>, 
                establece tu nueva contraseña
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-[#E8E8E8] mb-2">
                Nueva contraseña
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-[#1A1A1F] border border-[#3C4043] rounded-xl text-[#E8E8E8] focus:border-[#A8E6A3] focus:outline-none focus:ring-2 focus:ring-[#A8E6A3]/20 transition-all"
                  placeholder="Mínimo 6 caracteres"
                  required
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[#E8E8E8] mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666]" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-[#1A1A1F] border border-[#3C4043] rounded-xl text-[#E8E8E8] focus:border-[#A8E6A3] focus:outline-none focus:ring-2 focus:ring-[#A8E6A3]/20 transition-all"
                  placeholder="Repite la contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666] hover:text-[#A8E6A3] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-700/30 rounded-xl text-red-400 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#A8E6A3] to-[#90D68C] text-[#1A1A1F] rounded-xl hover:from-[#90D68C] hover:to-[#7FC77A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#1A1A1F] border-t-transparent"></div>
                  Cambiando contraseña...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Cambiar contraseña
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 pt-6 border-t border-[#3C4043]">
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[#B8B8B8] hover:text-[#A8E6A3] transition-colors"
            >
              <ArrowLeft size={16} />
              Volver al login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
