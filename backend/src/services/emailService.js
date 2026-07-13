const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a 2FA OTP Email using Resend
 * 
 * @param {string} toEmail - The recipient's email address
 * @param {string} userName - The name of the user for greeting
 * @param {string} otpCode - The 6-digit OTP code
 */
const send2FAEmail = async (toEmail, userName, otpCode) => {
  try {
    const senderEmail = process.env.SENDER_EMAIL || 'security.csd@audix.site';

    const htmlTemplate = `
      <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; border-radius: 12px; border: 1px solid #eef2f6; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4a6cf7; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Connecting Scripts</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 5px; font-weight: 500;">Security Validation</p>
        </div>
        
        <h2 style="color: #1e293b; font-size: 20px; font-weight: 700; margin-bottom: 20px;">Two-Factor Authentication</h2>
        
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
          Hi ${userName},<br><br>
          You recently requested to enable Two-Factor Authentication (2FA) for your Connecting Scripts Admin Dashboard account. Please use the verification code below to complete the setup process.
        </p>
        
        <div style="background: linear-gradient(145deg, #f8fafc, #f1f5f9); border-radius: 8px; padding: 25px; text-align: center; margin-bottom: 25px; border: 1px solid #e2e8f0;">
          <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; font-weight: 700; display: block; margin-bottom: 12px;">Your Verification Code</span>
          <div style="font-size: 36px; font-weight: 800; color: #0f172a; letter-spacing: 8px; font-family: monospace;">${otpCode}</div>
        </div>
        
        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
          This code will expire in <strong>10 minutes</strong>. If you did not request this change, please ignore this email or contact the system administrator immediately.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 25px;">
        
        <p style="color: #94a3b8; font-size: 12px; text-align: center; line-height: 1.5;">
          © ${new Date().getFullYear()} Connecting Scripts. All rights reserved.<br>
          This is an automated security message. Please do not reply to this email.
        </p>
      </div>
    `;

    const response = await resend.emails.send({
      from: `Connecting Scripts Security <${senderEmail}>`,
      to: [toEmail],
      subject: 'Your 2FA Verification Code - Connecting Scripts',
      html: htmlTemplate,
    });

    if (response.error) {
      console.error('Resend Error Payload:', response.error);
      throw new Error(response.error.message);
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Email sending error via Resend:', error);
    return { success: false, error };
  }
};

module.exports = {
  send2FAEmail
};
