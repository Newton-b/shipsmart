import { UserRole } from '../contexts/AuthContext';

interface PasswordResetRequest {
  email: string;
}

interface PasswordResetResponse {
  success: boolean;
  message: string;
  error?: string;
}

interface SocialLoginResponse {
  success: boolean;
  user?: any;
  token?: string;
  error?: string;
  requiresRegistration?: boolean;
}

// Email service simulation
class EmailService {
  private static instance: EmailService;
  private sentEmails: Array<{
    to: string;
    subject: string;
    body: string;
    timestamp: Date;
    type: 'password_reset' | 'verification' | 'welcome';
  }> = [];

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendPasswordResetEmail(email: string): Promise<PasswordResetResponse> {
    try {
      // Generate reset token
      const resetToken = this.generateResetToken();
      const resetLink = `${window.location.origin}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
      
      // Store reset token (in real app, this would be stored in backend)
      localStorage.setItem(`reset_token_${email}`, JSON.stringify({
        token: resetToken,
        email: email,
        expires: Date.now() + (60 * 60 * 1000), // 1 hour
        used: false
      }));

      // Simulate email sending
      const emailContent = {
        to: email,
        subject: 'Reset Your RaphTrack Password',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">RaphTrack</h1>
              <p style="color: #bfdbfe; margin: 10px 0 0 0;">Global Logistics Platform</p>
            </div>
            
            <div style="padding: 40px 30px; background: #ffffff;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Reset Your Password</h2>
              
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
                We received a request to reset your password for your RaphTrack account. 
                Click the button below to create a new password:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; 
                          border-radius: 8px; font-weight: 600; display: inline-block;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
                This link will expire in 1 hour for security reasons. If you didn't request this reset, 
                you can safely ignore this email.
              </p>
              
              <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <span style="word-break: break-all;">${resetLink}</span>
                </p>
              </div>
            </div>
            
            <div style="background: #f9fafb; padding: 20px 30px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © 2024 RaphTrack. All rights reserved.<br>
                Need help? Contact us at support@raphtrack.com
              </p>
            </div>
          </div>
        `,
        timestamp: new Date(),
        type: 'password_reset' as const
      };

      this.sentEmails.push(emailContent);

      // Simulate email delivery delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Show success notification with email preview (for demo purposes)
      this.showEmailPreview(emailContent);

      return {
        success: true,
        message: `Password reset instructions have been sent to ${email}. Please check your inbox and follow the instructions to reset your password.`
      };

    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return {
        success: false,
        message: 'Failed to send password reset email. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private generateResetToken(): string {
    return btoa(Math.random().toString(36).substr(2) + Date.now().toString(36));
  }

  private showEmailPreview(email: any) {
    // Create a modal to show the email preview (for demo purposes)
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
      background: rgba(0,0,0,0.8); z-index: 10000; 
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white; border-radius: 12px; max-width: 600px; 
      width: 100%; max-height: 80vh; overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    `;

    content.innerHTML = `
      <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; justify-content: between; align-items: center;">
          <h3 style="margin: 0; color: #1f2937;">📧 Email Sent Successfully!</h3>
          <button onclick="this.closest('.email-modal').remove()" 
                  style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280;">×</button>
        </div>
        <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">
          To: ${email.to} | Subject: ${email.subject}
        </p>
      </div>
      <div style="padding: 20px;">
        ${email.body}
      </div>
      <div style="padding: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
        <button onclick="this.closest('.email-modal').remove()" 
                style="background: #3b82f6; color: white; border: none; padding: 10px 20px; 
                       border-radius: 6px; cursor: pointer; font-weight: 600;">
          Close Preview
        </button>
      </div>
    `;

    modal.className = 'email-modal';
    modal.appendChild(content);
    document.body.appendChild(modal);

    // Auto-close after 10 seconds
    setTimeout(() => {
      if (document.body.contains(modal)) {
        modal.remove();
      }
    }, 10000);
  }

  getSentEmails() {
    return this.sentEmails;
  }
}

// Social Login Service
class SocialLoginService {
  private static instance: SocialLoginService;

  static getInstance(): SocialLoginService {
    if (!SocialLoginService.instance) {
      SocialLoginService.instance = new SocialLoginService();
    }
    return SocialLoginService.instance;
  }

  async loginWithGoogle(): Promise<SocialLoginResponse> {
    try {
      // Simulate Google OAuth flow
      console.log('🔵 Initiating Google OAuth...');
      
      // Show loading state
      this.showSocialLoginModal('google', 'Connecting to Google...');
      
      // Simulate OAuth redirect and callback
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful Google response
      const googleUser = {
        id: 'google_' + Math.random().toString(36).substr(2, 9),
        email: 'user@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
        provider: 'google',
        verified: true
      };

      this.closeSocialLoginModal();

      // Check if user exists in our system
      const existingUser = this.checkExistingUser(googleUser.email);
      
      if (existingUser) {
        // User exists, log them in
        return {
          success: true,
          user: {
            ...existingUser,
            avatar: googleUser.avatar,
            lastLogin: new Date().toISOString()
          },
          token: this.generateAuthToken(existingUser.id)
        };
      } else {
        // User doesn't exist, needs registration
        return {
          success: false,
          requiresRegistration: true,
          user: googleUser,
          error: 'Account not found. Please complete registration to continue.'
        };
      }

    } catch (error) {
      this.closeSocialLoginModal();
      console.error('Google login failed:', error);
      return {
        success: false,
        error: 'Google login failed. Please try again or use email/password.'
      };
    }
  }

  async loginWithFacebook(): Promise<SocialLoginResponse> {
    try {
      // Simulate Facebook OAuth flow
      console.log('🔵 Initiating Facebook OAuth...');
      
      // Show loading state
      this.showSocialLoginModal('facebook', 'Connecting to Facebook...');
      
      // Simulate OAuth redirect and callback
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful Facebook response
      const facebookUser = {
        id: 'facebook_' + Math.random().toString(36).substr(2, 9),
        email: 'user@facebook.com',
        firstName: 'Jane',
        lastName: 'Smith',
        avatar: 'https://graph.facebook.com/me/picture?type=large',
        provider: 'facebook',
        verified: true
      };

      this.closeSocialLoginModal();

      // Check if user exists in our system
      const existingUser = this.checkExistingUser(facebookUser.email);
      
      if (existingUser) {
        // User exists, log them in
        return {
          success: true,
          user: {
            ...existingUser,
            avatar: facebookUser.avatar,
            lastLogin: new Date().toISOString()
          },
          token: this.generateAuthToken(existingUser.id)
        };
      } else {
        // User doesn't exist, needs registration
        return {
          success: false,
          requiresRegistration: true,
          user: facebookUser,
          error: 'Account not found. Please complete registration to continue.'
        };
      }

    } catch (error) {
      this.closeSocialLoginModal();
      console.error('Facebook login failed:', error);
      return {
        success: false,
        error: 'Facebook login failed. Please try again or use email/password.'
      };
    }
  }

  private checkExistingUser(email: string) {
    // Simulate checking user in database
    const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
    return users.find((user: any) => user.email === email);
  }

  private generateAuthToken(userId: string): string {
    return btoa(JSON.stringify({
      userId,
      timestamp: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }));
  }

  private showSocialLoginModal(provider: 'google' | 'facebook', message: string) {
    const modal = document.createElement('div');
    modal.id = 'social-login-modal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
      background: rgba(0,0,0,0.8); z-index: 10000; 
      display: flex; align-items: center; justify-content: center;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white; border-radius: 12px; padding: 40px; 
      text-align: center; max-width: 400px; width: 90%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    `;

    const providerColor = provider === 'google' ? '#4285f4' : '#1877f2';
    const providerIcon = provider === 'google' ? '🔵' : '📘';

    content.innerHTML = `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 48px; margin-bottom: 16px;">${providerIcon}</div>
        <h3 style="margin: 0 0 10px 0; color: #1f2937;">Connecting to ${provider.charAt(0).toUpperCase() + provider.slice(1)}</h3>
        <p style="margin: 0; color: #6b7280;">${message}</p>
      </div>
      <div style="display: flex; justify-content: center; align-items: center;">
        <div style="width: 40px; height: 40px; border: 4px solid ${providerColor}; 
                    border-top: 4px solid transparent; border-radius: 50%; 
                    animation: spin 1s linear infinite;"></div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);
  }

  private closeSocialLoginModal() {
    const modal = document.getElementById('social-login-modal');
    if (modal) {
      modal.remove();
    }
  }
}

// Export services
export const emailService = EmailService.getInstance();
export const socialLoginService = SocialLoginService.getInstance();

// Export types
export type { PasswordResetRequest, PasswordResetResponse, SocialLoginResponse };
