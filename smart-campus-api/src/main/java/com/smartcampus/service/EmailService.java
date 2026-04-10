package com.smartcampus.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // Send password reset OTP email
    @Async
    public void sendPasswordResetEmail(String toEmail, String userName,
            String code, int expiryMinutes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Smart Campus");
            helper.setTo(toEmail);
            helper.setSubject("Smart Campus — Password Reset Code");
            helper.setText(buildPasswordResetHtml(userName, code, expiryMinutes), true);

            mailSender.send(message);
            log.info("Password reset email sent to: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send email. Please try again.");
        }
    }

    // HTML email template
    private String buildPasswordResetHtml(String userName,
            String code, int expiryMinutes) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: Arial, sans-serif; background: #f8fafc;
                       margin: 0; padding: 20px; }
                .container { max-width: 500px; margin: 0 auto;
                             background: #fff; border-radius: 16px;
                             overflow: hidden;
                             box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
                .header { background: linear-gradient(135deg, #6366f1, #4f46e5);
                          padding: 32px; text-align: center; }
                .header h1 { color: #fff; margin: 0; font-size: 22px; }
                .header p  { color: rgba(255,255,255,0.8); margin: 8px 0 0; }
                .body { padding: 32px; }
                .greeting { font-size: 16px; color: #1e293b; margin-bottom: 16px; }
                .code-box { background: #f1f5f9; border: 2px dashed #6366f1;
                             border-radius: 12px; padding: 24px;
                             text-align: center; margin: 24px 0; }
                .code { font-size: 42px; font-weight: 700; letter-spacing: 12px;
                        color: #6366f1; font-family: monospace; }
                .expiry { font-size: 13px; color: #64748b; margin-top: 8px; }
                .warning { background: #fef3c7; border-left: 4px solid #f59e0b;
                           border-radius: 4px; padding: 12px 16px;
                           font-size: 13px; color: #92400e; margin: 16px 0; }
                .footer { background: #f8fafc; padding: 20px 32px;
                          text-align: center; font-size: 12px; color: #94a3b8; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎓 Smart Campus</h1>
                  <p>Password Reset Request</p>
                </div>
                <div class="body">
                  <p class="greeting">Hi <strong>%s</strong>,</p>
                  <p style="color:#475569; font-size:14px;">
                    We received a request to reset your password.
                    Use the code below to continue.
                  </p>
                  <div class="code-box">
                    <div class="code">%s</div>
                    <div class="expiry">⏱ Expires in %d minutes</div>
                  </div>
                  <div class="warning">
                    ⚠️ If you didn't request this, ignore this email.
                    Your password won't change.
                  </div>
                  <p style="color:#94a3b8; font-size:12px;">
                    For security, never share this code with anyone.
                  </p>
                </div>
                <div class="footer">
                  Smart Campus Operations Hub — SLIIT<br>
                  This is an automated message, please do not reply.
                </div>
              </div>
            </body>
            </html>
            """.formatted(userName, code, expiryMinutes);
    }
}