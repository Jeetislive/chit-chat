import nodemailer from "nodemailer";
import dns from "dns";
import { logger } from "../config/logger.js";

function getTransport() {
    const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        return null;
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587", 10),
        secure: process.env.SMTP_SECURE === "true",
        requireTLS: true,
        lookup: (hostname, options, cb) => {
            dns.lookup(hostname, { ...options, family: 4 }, cb);
        },
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
}

async function sendMail(to, subject, html) {
    const transporter = getTransport();

    if (!transporter) {
        logger.warn({ to, subject }, "Email not configured — skipping send");
        return;
    }

    try {
        await transporter.sendMail({
            from: `"Chat App" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        logger.info({ to, subject }, "Email sent");
    } catch (err) {
        logger.error({ err, to, subject }, "Failed to send email");
    }
}

export function sendWelcomeEmail(to, name) {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
                <div style="width: 48px; height: 48px; margin: 0 auto; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a855f7); display: flex; align-items: center; justify-content: center;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                </div>
            </div>
            <h1 style="font-size: 20px; color: #1a1a2e; text-align: center; margin-bottom: 8px;">Welcome, ${name}!</h1>
            <p style="color: #64748b; text-align: center; margin-bottom: 24px; line-height: 1.5;">
                Your account has been created successfully. Start chatting with your friends instantly.
            </p>
            <div style="text-align: center; padding: 16px; background: #f8fafc; border-radius: 12px;">
                <p style="color: #64748b; font-size: 13px; margin: 0;">Happy Chatting!</p>
            </div>
        </div>
    `;
    return sendMail(to, "Welcome to Chat App!", html);
}

export function sendResetCodeEmail(to, name, code) {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h1 style="font-size: 20px; color: #1a1a2e; text-align: center; margin-bottom: 8px;">Password Reset Code</h1>
            <p style="color: #64748b; text-align: center; margin-bottom: 8px;">Hi ${name},</p>
            <p style="color: #64748b; text-align: center; margin-bottom: 24px;">
                Use the code below to reset your password. It expires in 10 minutes.
            </p>
            <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; padding: 16px 32px; background: #f0f0ff; border-radius: 12px; letter-spacing: 8px; font-size: 32px; font-weight: bold; color: #6366f1;">
                    ${code}
                </div>
            </div>
            <p style="color: #94a3b8; text-align: center; font-size: 12px;">
                If you didn't request this, you can ignore this email.
            </p>
        </div>
    `;
    return sendMail(to, "Password Reset Code", html);
}
