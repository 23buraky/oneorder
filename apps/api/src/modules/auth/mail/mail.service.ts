import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import { renderVerifyEmailTemplate } from "./templates/verify-email.template";
import { renderWelcomeTemplate } from "./templates/welcome.template";
import { renderPasswordResetTemplate } from "./templates/password-reset.template";
import { renderOrderStatusTemplate } from "./templates/order-status.template";

type OrderEmailStatus = "PENDING" | "ACCEPTED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly fromEmail: string;
  private readonly appUrl: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>("mail.resendApiKey");
    // Resend is optional in local dev — without a key we log emails instead
    // of throwing, so registration/login flows still work end-to-end.
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.fromEmail = this.config.get<string>("mail.fromEmail") ?? "ONE ORDER <no-reply@oneorderantwerp.com>";
    this.appUrl = this.config.get<string>("appUrl") ?? "http://localhost:3000";
  }

  async sendVerificationEmail(to: string, firstName: string, token: string): Promise<void> {
    const verifyUrl = `${this.appUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;
    await this.send(
      to,
      "Bevestig je e-mailadres — ONE ORDER",
      renderVerifyEmailTemplate({ firstName, verifyUrl }),
    );
  }

  async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    await this.send(
      to,
      "Welkom bij ONE ORDER",
      renderWelcomeTemplate({ firstName, appUrl: this.appUrl }),
    );
  }

  async sendPasswordResetEmail(to: string, firstName: string, token: string): Promise<void> {
    const resetUrl = `${this.appUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;
    await this.send(
      to,
      "Wachtwoord resetten — ONE ORDER",
      renderPasswordResetTemplate({ firstName, resetUrl }),
    );
  }

  async sendOrderStatusEmail(
    to: string,
    orderNumber: string,
    status: OrderEmailStatus,
    estimatedMinutes?: number | null,
  ): Promise<void> {
    const subjects: Record<OrderEmailStatus, string> = {
      PENDING: `Bestelling ${orderNumber} ontvangen — ONE ORDER`,
      ACCEPTED: `Bestelling ${orderNumber} bevestigd — ONE ORDER`,
      PREPARING: `Bestelling ${orderNumber} wordt bereid — ONE ORDER`,
      READY: `Bestelling ${orderNumber} is klaar — ONE ORDER`,
      OUT_FOR_DELIVERY: `Bestelling ${orderNumber} is onderweg — ONE ORDER`,
      DELIVERED: `Bestelling ${orderNumber} geleverd — ONE ORDER`,
      CANCELLED: `Bestelling ${orderNumber} geannuleerd — ONE ORDER`,
    };

    await this.send(
      to,
      subjects[status],
      renderOrderStatusTemplate({ orderNumber, status, estimatedMinutes, appUrl: this.appUrl }),
    );
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`RESEND_API_KEY not set — skipping email "${subject}" to ${to}`);
      return;
    }

    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject,
      html,
    });

    if (error) {
      this.logger.error(`Failed to send "${subject}" to ${to}: ${error.message}`);
    }
  }
}
