// src/components/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { apiRequest, API_ENDPOINTS } from '../../config/api';

const ForgotPassword = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiRequest(`${API_ENDPOINTS.auth}/password-reset/request`, {
        method: 'POST',
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSent(true);
        } else {
          setError(data.message || 'Error al enviar el email');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error en forgot password:', error);
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2C2C34] via-[#1A1A1F] to-[#0F0F12] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-[#252529] to-[#1A1A1F] rounded-2xl shadow-2xl border border-[#3C4043] p-8">
            {/* Success Icon */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#A8E6A3] to-[#90D68C] rounded-full mb-4">
                <CheckCircle size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">¡Email Enviado!</h2>
              <p className="text-[#B8B8B8] text-sm">
                Revisa tu bandeja de entrada y sigue las instrucciones para recuperar tu contraseña.
              </p>
            </div>

            {/* Email Info */}
            <div className="bg-[#1A1A1F] border border-[#3C4043] rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-[#A8E6A3]" />
                <div>
                  <p className="text-sm text-[#B8B8B8]">Email enviado a:</p>
                  <p className="text-white font-medium">{email}</p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-[#A8E6A3]/10 border border-[#A8E6A3]/20 rounded-xl p-4 mb-6">
              <h3 className="text-[#A8E6A3] font-semibold mb-2">Qué hacer ahora:</h3>
              <ul className="text-sm text-[#B8B8B8] space-y-1">
                <li>• Revisa tu bandeja de entrada</li>
                <li>• Busca también en spam/correo no deseado</li>
                <li>• Haz clic en el enlace del email</li>
                <li>• El enlace expira en 1 hora</li>
              </ul>
            </div>

            {/* Back to Login */}
            <button
              onClick={onBackToLogin}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#3C4043] text-[#B8B8B8] rounded-xl hover:bg-[#4A4A50] hover:text-white transition-all duration-200"
            >
              <ArrowLeft size={16} />
              Volver al login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2C2C34] via-[#1A1A1F] to-[#0F0F12] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-gradient-to-br from-[#252529] to-[#1A1A1F] rounded-2xl shadow-2xl border border-[#3C4043] p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#A8E6A3] to-[#90D68C] rounded-xl mb-4">
              <Mail size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">¿Olvidaste tu contraseña?</h2>
            <p className="text-[#B8B8B8] text-sm">
              No te preocupes, te enviaremos instrucciones para recuperarla
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-[#E8E8E8] mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#1A1A1F] border border-[#3C4043] rounded-xl text-[#E8E8E8] focus:border-[#A8E6A3] focus:outline-none focus:ring-2 focus:ring-[#A8E6A3]/20 transition-all"
                  placeholder="tu@email.com"
                  required
                />
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
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Enviar instrucciones
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 pt-6 border-t border-[#3C4043]">
            <button
              onClick={onBackToLogin}
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

export default ForgotPassword;
