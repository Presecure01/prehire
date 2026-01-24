const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor() {
    this.service = process.env.EMAIL_SERVICE || 'smtp';
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@prehire.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'PreHire';

    // Initialize SendGrid if configured
    if (this.service === 'sendgrid' && process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }

    // Initialize SMTP transporter if using SMTP
    if (this.service === 'smtp') {
      const smtpConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true'
      };

      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        smtpConfig.auth = {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        };
      }

      this.transporter = nodemailer.createTransport(smtpConfig);
    }
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      const emailData = {
        to,
        subject,
        html,
        text: text || this.htmlToText(html),
        from: `${this.fromName} <${this.fromEmail}>`
      };

      switch (this.service) {
        case 'sendgrid':
          if (!process.env.SENDGRID_API_KEY) {
            throw new Error('SENDGRID_API_KEY not configured');
          }
          await sgMail.send(emailData);
          break;

        case 'mailgun':
          const mailgun = require('mailgun-js')({
            apiKey: process.env.MAILGUN_API_KEY,
            domain: process.env.MAILGUN_DOMAIN
          });
          await mailgun.messages().send({
            from: emailData.from,
            to: emailData.to,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text
          });
          break;

        default: // smtp
          if (!this.transporter) {
            console.warn('SMTP not configured, email not sent (This is expected in dev without credentials)');
            return { success: true, message: 'Email skipped - no credentials' };
          }
          await this.transporter.sendMail(emailData);
      }

      return { success: true };
    } catch (error) {
      console.error('Email send error:', error.message);
      // Don't crash the application if email fails
      return { success: false, error: error.message };
    }
  }

  htmlToText(html) {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }

  // Email templates
  async sendWelcomeEmail(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to PreHire</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #8b5cf6; margin: 0;">PreHire</h1>
        </div>
        <div style="background: #f9fafb; padding: 24px; border-radius: 8px;">
          <h2 style="color: #1f2937;">Welcome to PreHire, ${user.name}!</h2>
          <p>Thank you for joining PreHire. We're excited to help you ${user.role === 'candidate' ? 'find your dream job' : 'find the perfect candidates'}.</p>
          ${user.role === 'candidate' ? `
            <p>Get started by:</p>
            <ul>
              <li>Complete your profile</li>
              <li>Upload your resume</li>
              <li>Browse available job opportunities</li>
            </ul>
          ` : `
            <p>Get started by:</p>
            <ul>
              <li>Complete your company profile</li>
              <li>Post your first job</li>
              <li>Search and discover talented candidates</li>
            </ul>
          `}
          <div style="text-align: center; margin-top: 24px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/${user.role === 'candidate' ? 'candidate' : 'recruiter'}" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 32px; padding: 16px; color: #6b7280; font-size: 14px;">
          <p>If you have any questions, feel free to contact us.</p>
          <p>© ${new Date().getFullYear()} PreHire. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to PreHire!',
      html
    });
  }

  async sendProfileUnlockedEmail(candidateEmail, candidateName, recruiterName, companyName) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your Profile Was Unlocked</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #8b5cf6; margin: 0;">PreHire</h1>
        </div>
        <div style="background: #f9fafb; padding: 24px; border-radius: 8px;">
          <h2 style="color: #1f2937;">Great News, ${candidateName}!</h2>
          <p>Your profile has been unlocked by <strong>${recruiterName}</strong> from <strong>${companyName || 'a company'}</strong>.</p>
          <p>This means they're interested in learning more about you and may reach out soon!</p>
          <div style="background: #eff6ff; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af;"><strong>💡 Tip:</strong> Make sure your profile is up to date and your resume is current to increase your chances of getting contacted.</p>
          </div>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/candidate/profile" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Your Profile
            </a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 32px; padding: 16px; color: #6b7280; font-size: 14px;">
          <p>© ${new Date().getFullYear()} PreHire. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: candidateEmail,
      subject: 'Your Profile Was Unlocked on PreHire',
      html
    });
  }

  async sendApplicationReceivedEmail(recruiterEmail, recruiterName, candidateName, jobTitle) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Application Received</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #8b5cf6; margin: 0;">PreHire</h1>
        </div>
        <div style="background: #f9fafb; padding: 24px; border-radius: 8px;">
          <h2 style="color: #1f2937;">New Application Received</h2>
          <p>Hi ${recruiterName},</p>
          <p><strong>${candidateName}</strong> has applied for the position: <strong>${jobTitle}</strong></p>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/recruiter" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Review Application
            </a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 32px; padding: 16px; color: #6b7280; font-size: 14px;">
          <p>© ${new Date().getFullYear()} PreHire. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: recruiterEmail,
      subject: `New Application: ${jobTitle}`,
      html
    });
  }

  async sendApplicationStatusUpdateEmail(candidateEmail, candidateName, jobTitle, status) {
    const statusMessages = {
      shortlisted: 'Congratulations! You have been shortlisted',
      rejected: 'Application Update',
      pending: 'Application Received'
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Application Status Update</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #8b5cf6; margin: 0;">PreHire</h1>
        </div>
        <div style="background: #f9fafb; padding: 24px; border-radius: 8px;">
          <h2 style="color: #1f2937;">${statusMessages[status] || 'Application Update'}</h2>
          <p>Hi ${candidateName},</p>
          <p>Your application for <strong>${jobTitle}</strong> has been updated.</p>
          <div style="background: ${status === 'shortlisted' ? '#d1fae5' : status === 'rejected' ? '#fee2e2' : '#eff6ff'}; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: ${status === 'shortlisted' ? '#065f46' : status === 'rejected' ? '#991b1b' : '#1e40af'};">
              <strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}
            </p>
          </div>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/candidate" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Application
            </a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 32px; padding: 16px; color: #6b7280; font-size: 14px;">
          <p>© ${new Date().getFullYear()} PreHire. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: candidateEmail,
      subject: `Application Update: ${jobTitle}`,
      html
    });
  }

  async sendPasswordResetEmail(email, resetToken, name) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #8b5cf6; margin: 0;">PreHire</h1>
        </div>
        <div style="background: #f9fafb; padding: 24px; border-radius: 8px;">
          <h2 style="color: #1f2937;">Reset Your Password</h2>
          <p>Hi ${name || 'there'},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #6b7280;">If you didn't request this, please ignore this email. This link will expire in 1 hour.</p>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">Or copy and paste this link: ${resetUrl}</p>
        </div>
        <div style="text-align: center; margin-top: 32px; padding: 16px; color: #6b7280; font-size: 14px;">
          <p>© ${new Date().getFullYear()} PreHire. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset Your PreHire Password',
      html
    });
  }
}

module.exports = new EmailService();
