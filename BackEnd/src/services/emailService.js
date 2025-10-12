// src/services/emailService.js
import { Resend } from 'resend';
import { config } from '../config/config.js';

// Inicializar Resend con la API key
const resend = new Resend(config.RESEND_API_KEY);

export class EmailService {
  /**
   * Enviar email de recuperación de contraseña
   * @param {string} email - Email del destinatario
   * @param {string} resetToken - Token de recuperación
   * @param {string} username - Nombre de usuario
   */  static async sendPasswordResetEmail(email, resetToken, username) {
    try {
      console.log('🔑 Enviando email de recuperación:', { email, username, hasToken: !!resetToken });
      console.log('📧 RESEND_API_KEY configurada:', !!config.RESEND_API_KEY);
      
      // URL de reset - usar variable de entorno o dominio de producción
      const resetUrl = config.NODE_ENV === 'production' 
        ? `https://chat-for-company.vercel.app/reset-password?token=${resetToken}`
        : `http://localhost:5173/reset-password?token=${resetToken}`;
      
      console.log('🔗 Reset URL generada:', resetUrl);

      const { data, error } = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>', // Dominio sandbox de Resend para desarrollo
        to: [email],
        subject: 'Recuperación de Contraseña - Chat App',
        html: `
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Recuperación de Contraseña</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
              }
              .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .logo {
                background: linear-gradient(135deg, #A8E6A3, #90D68C);
                color: white;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                font-weight: bold;
                margin: 0 auto 20px;
              }
              .title {
                color: #1A1A1F;
                font-size: 24px;
                font-weight: 600;
                margin: 0;
              }
              .content {
                margin: 30px 0;
              }
              .greeting {
                font-size: 16px;
                margin-bottom: 20px;
              }
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #A8E6A3, #90D68C);
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
                text-align: center;
              }
              .alternative-link {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #A8E6A3;
                margin: 20px 0;
                font-size: 14px;
              }
              .alternative-link code {
                background: #e9ecef;
                padding: 2px 6px;
                border-radius: 4px;
                font-family: monospace;
                word-break: break-all;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                text-align: center;
                font-size: 14px;
                color: #666;
              }
              .warning {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">💬</div>
                <h1 class="title">Recuperación de Contraseña</h1>
              </div>
              
              <div class="content">
                <p class="greeting">Hola <strong>${username}</strong>,</p>
                
                <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Chat App.</p>
                
                <p>Para continuar con el proceso de recuperación, haz clic en el siguiente botón:</p>
                
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
                </div>
                
                <div class="alternative-link">
                  <strong>¿El botón no funciona?</strong><br>
                  Copia y pega este enlace en tu navegador:<br>
                  <code>${resetUrl}</code>
                </div>
                
                <div class="warning">
                  <strong>⚠️ Importante:</strong>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Este enlace expirará en <strong>1 hora</strong></li>
                    <li>Solo puede ser usado una vez</li>
                    <li>Si no solicitaste este cambio, puedes ignorar este email</li>
                  </ul>
                </div>
                
                <p>Si tienes algún problema o no solicitaste este cambio, contáctanos de inmediato.</p>
              </div>
              
              <div class="footer">
                <p>Este email fue enviado automáticamente, por favor no respondas a este mensaje.</p>
                <p>&copy; 2024 Chat App. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Hola ${username},

Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Chat App.

Para continuar con el proceso de recuperación, visita el siguiente enlace:
${resetUrl}

IMPORTANTE:
- Este enlace expirará en 1 hora
- Solo puede ser usado una vez
- Si no solicitaste este cambio, puedes ignorar este email

Si tienes algún problema, contáctanos de inmediato.

Este email fue enviado automáticamente, por favor no respondas a este mensaje.

© 2024 Chat App. Todos los derechos reservados.
        `      });

      console.log('📤 Respuesta de Resend:', { data, error });

      if (error) {
        console.error('❌ Error enviando email con Resend:', error);
        throw new Error('Error al enviar el email de recuperación');
      }

      console.log('✅ Email de recuperación enviado exitosamente:', data);
      return data;
    } catch (error) {
      console.error('Error en EmailService.sendPasswordResetEmail:', error);
      throw error;
    }
  }

  /**
   * Enviar email de confirmación de cambio de contraseña
   * @param {string} email - Email del destinatario
   * @param {string} username - Nombre de usuario
   */
  static async sendPasswordChangeConfirmation(email, username) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>', // Dominio sandbox de Resend para desarrollo
        to: [email],
        subject: 'Contraseña Cambiada Exitosamente - Chat App',
        html: `
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Contraseña Cambiada</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
              }
              .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .logo {
                background: linear-gradient(135deg, #A8E6A3, #90D68C);
                color: white;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                font-weight: bold;
                margin: 0 auto 20px;
              }
              .title {
                color: #1A1A1F;
                font-size: 24px;
                font-weight: 600;
                margin: 0;
              }
              .success {
                background: #d4edda;
                border: 1px solid #c3e6cb;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                text-align: center;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                text-align: center;
                font-size: 14px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">✅</div>
                <h1 class="title">Contraseña Cambiada</h1>
              </div>
              
              <div class="success">
                <p><strong>¡Perfecto, ${username}!</strong></p>
                <p>Tu contraseña ha sido cambiada exitosamente.</p>
              </div>
              
              <p>Tu cuenta está ahora segura con la nueva contraseña. Ya puedes iniciar sesión con normalidad.</p>
              
              <p>Si no realizaste este cambio, contáctanos inmediatamente para proteger tu cuenta.</p>
              
              <div class="footer">
                <p>Este email fue enviado automáticamente, por favor no respondas a este mensaje.</p>
                <p>&copy; 2024 Chat App. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Hola ${username},

¡Perfecto! Tu contraseña ha sido cambiada exitosamente.

Tu cuenta está ahora segura con la nueva contraseña. Ya puedes iniciar sesión con normalidad.

Si no realizaste este cambio, contáctanos inmediatamente para proteger tu cuenta.

Este email fue enviado automáticamente, por favor no respondas a este mensaje.

© 2024 Chat App. Todos los derechos reservados.
        `
      });

      if (error) {
        console.error('Error enviando confirmación con Resend:', error);
        throw new Error('Error al enviar el email de confirmación');
      }

      console.log('Email de confirmación enviado:', data);
      return data;
    } catch (error) {
      console.error('Error en EmailService.sendPasswordChangeConfirmation:', error);
      throw error;
    }
  }
}
