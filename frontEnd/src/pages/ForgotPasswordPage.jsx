// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import { API_ENDPOINTS, apiRequest } from '../config/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor ingresa tu email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiRequest(API_ENDPOINTS.passwordReset.request, {
        method: 'POST',
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuccess(true);
        } else {
          setError(data.message || 'Error al enviar el email');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error de conexión');
      }
    } catch (error) {
      console.error('Error en forgot password:', error);
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2C2C34] via-[#1A1A1F] to-[#0F0F12] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#252529] rounded-2xl p-8 border border-[#3C4043] text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-[#E8E8E8] mb-4">
              ¡Email Enviado!
            </h2>
            
            <p className="text-[#B8B8B8] mb-6">
              Si el email existe en nuestro sistema, recibirás instrucciones para recuperar tu contraseña.
            </p>
            
            <p className="text-sm text-[#666] mb-6">
              Revisa tu bandeja de entrada y la carpeta de spam.
            </p>
            
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#A8E6A3] text-[#1A1A1F] rounded-lg hover:bg-[#90D68C] transition-all font-medium"
            >
              <ArrowLeft size={16} />
              Volver al Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2C2C34] via-[#1A1A1F] to-[#0F0F12] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#252529] rounded-2xl p-8 border border-[#3C4043]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#A8E6A3]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-[#A8E6A3]" />
            </div>
            <h2 className="text-2xl font-bold text-[#E8E8E8] mb-2">
              Recuperar Contraseña
            </h2>
            <p className="text-[#B8B8B8]">
              Ingresa tu email y te enviaremos instrucciones para recuperar tu contraseña
            </p>
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
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#1A1A1F] border border-[#3C4043] rounded-lg text-[#E8E8E8] placeholder-[#666] focus:border-[#A8E6A3] focus:outline-none focus:ring-2 focus:ring-[#A8E6A3]/20 transition-all"
                placeholder="tu@email.com"
                required
                disabled={loading}
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
                  Enviando...
                </>
              ) : (
                <>
                  <Mail size={16} />
                  Enviar Instrucciones
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

export default ForgotPasswordPage;
