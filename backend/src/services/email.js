import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  },
  from: process.env.SMTP_FROM || 'noreply@miapp.local'
};

let transporter = null;

export function initEmail() {
  if (config.smtp.host && config.smtp.auth.user) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.auth.user,
        pass: config.smtp.auth.pass
      }
    });
    console.log('✓ Servicio de email configurado');
  } else {
    console.log('⚠ SMTP no configurado (configura SMTP_HOST, SMTP_USER, SMTP_PASS en .env)');
  }
}

export async function sendWelcomeEmail(email, username) {
  if (!transporter) {
    console.log('⚠ Email de bienvenida no enviado: SMTP no configurado');
    return false;
  }
  
  const mailOptions = {
    from: config.from,
    to: email,
    subject: 'Bienvenido a Miapp Energía',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00d4aa;">⚡ Bienvenido a Miapp Energía</h1>
        <p>Hola <strong>${username}</strong>,</p>
        <p>¡Tu cuenta ha sido creada exitosamente!</p>
        <p>Ahora puedes acceder a la aplicación y monitorear:</p>
        <ul>
          <li>📊 Generación solar en tiempo real</li>
          <li>⚡ Consumo de energía</li>
          <li>🔋 Estado de batería</li>
          <li>💡 Control de luces</li>
          <li>❄️ Control de aire acondicionado</li>
          <li>📈 Reportes históricos</li>
        </ul>
        <p>Accede a: <a href="http://tu-servidor:5173" style="color: #00d4aa;">http://tu-servidor:5173</a></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">Miapp Energía - Sistema de Gestión Energética</p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✓ Email de bienvenida enviado a ${email}`);
    return true;
  } catch (error) {
    console.error('Error enviando email:', error.message);
    return false;
  }
}

export async function sendPasswordResetEmail(email, username, resetToken) {
  if (!transporter) {
    console.log('⚠ Email de recuperación no enviado: SMTP no configurado');
    return false;
  }
  
  const mailOptions = {
    from: config.from,
    to: email,
    subject: 'Recuperar Contraseña - Miapp Energía',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00d4aa;">🔐 Recuperar Contraseña</h1>
        <p>Hola <strong>${username}</strong>,</p>
        <p>Has solicitado recuperar tu contraseña.</p>
        <p>Tu código de recuperación: <strong style="font-size: 24px;">${resetToken}</strong></p>
        <p>Este código expira en 15 minutos.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">Miapp Energía</p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error enviando email:', error.message);
    return false;
  }
}

export default { initEmail, sendWelcomeEmail, sendPasswordResetEmail };