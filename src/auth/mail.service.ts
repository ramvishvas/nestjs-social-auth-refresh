import { Injectable, Logger } from '@nestjs/common';
import * as sendGridMail from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    sendGridMail.setApiKey(
      this.configService.getOrThrow<string>('SENDGRID_API_KEY'),
    );
  }

  private getCommonMailPayload(
    to: string | string[],
    subject: string,
    html: string,
  ) {
    return {
      to,
      from: this.configService.getOrThrow<string>('FROM_MAIL'),
      subject,
      html,
    };
  }

  private async sendMail(payload: any) {
    try {
      await sendGridMail.send(payload);
      this.logger.log(`Email sent successfully to ${payload.to}`);
      return {
        message: `Email sent successfully to ${payload.to}`,
        status: 200,
      };
    } catch (error) {
      this.logger.error(`Error sending email to ${payload.to}`, error.stack);
      if (error.response) {
        this.logger.error(error.response.body);
      }
      return { message: `Error sending email to ${payload.to}` };
    }
  }

  sendWelcomeEmail(email: string) {
    const payload = this.getCommonMailPayload(
      email,
      'Welcome to our app',
      '<p>Welcome to our app. We hope you enjoy our service.</p>',
    );
    return this.sendMail(payload);
  }

  sendVerificationEmail(email: string, token: string) {
    const payload = this.getCommonMailPayload(
      email,
      'Verify your email',
      `<p>Click <a href="${this.configService.get<string>(
        'FRONTEND_URL',
      )}/auth/verify-email?token=${token}">here</a> to verify your email</p>`,
    );
    return this.sendMail(payload);
  }

  sendPasswordResetEmail(email: string, token: string) {
    // Get the current date and time
    const now = new Date();
    // Add 10 minutes to the current date
    const expirationDate = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now

    // Format the expiration date as a readable string (e.g., 'YYYY-MM-DD HH:MM:SS')
    const formattedExpirationDate = expirationDate.toLocaleString();

    // Construct the email body
    const emailBody = `
    <p>Click <a href="${this.configService.get<string>(
      'FRONTEND_URL',
    )}/auth/reset-password?token=${token}">here</a> to reset your password.</p>
    <p>This link will expire in 10 minutes on ${formattedExpirationDate}. Please use it before the expiration time to reset your password.</p>
  `;

    // Create the email payload
    const payload = this.getCommonMailPayload(
      email,
      'Reset your password',
      emailBody,
    );

    // Send the email
    return this.sendMail(payload);
  }
}
