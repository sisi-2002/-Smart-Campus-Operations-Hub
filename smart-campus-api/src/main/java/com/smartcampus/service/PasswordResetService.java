package com.smartcampus.service;

import com.smartcampus.dto.request.ForgotPasswordRequest;
import com.smartcampus.dto.request.ResetPasswordRequest;
import com.smartcampus.dto.request.VerifyResetCodeRequest;
import com.smartcampus.dto.response.ForgotPasswordResponse;
import com.smartcampus.entity.AuthProvider;
import com.smartcampus.entity.PasswordResetToken;
import com.smartcampus.entity.User;
import com.smartcampus.repository.PasswordResetTokenRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final UserRepository              userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService                 emailService;
    private final PasswordEncoder              passwordEncoder;

    @Value("${app.password-reset.expiry-minutes}")
    private int expiryMinutes;

    private final SecureRandom random = new SecureRandom();

    // ─── STEP 1: Send reset code ────────────────────────────────────
    public ForgotPasswordResponse sendResetCode(ForgotPasswordRequest request) {

        String email = request.getEmail().toLowerCase().trim();

        // Check if user exists before proceeding
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("No user found with this email address."));

        // Block Google OAuth users from resetting password
        if (user.getProvider() == AuthProvider.GOOGLE) {
            throw new RuntimeException(
                "This account uses Google sign-in. "
                + "Please log in with Google instead.");
        }

        // Delete any existing reset tokens for this email
        tokenRepository.deleteAllByEmail(email);

        // Generate 6-digit code
        String code = String.format("%06d", random.nextInt(1000000));

        // Save token to DB
        PasswordResetToken token = PasswordResetToken.builder()
            .email(email)
            .code(code)
            .expiresAt(LocalDateTime.now().plusMinutes(expiryMinutes))
            .used(false)
            .attempts(0)
            .createdAt(LocalDateTime.now())
            .build();

        tokenRepository.save(token);

        // Send email (async — non-blocking)
        emailService.sendPasswordResetEmail(
            email, user.getName(), code, expiryMinutes);

        log.info("Password reset code sent to: {}", email);

        return ForgotPasswordResponse.builder()
            .status("SENT")
            .message("A 6-digit code has been sent to your email.")
            .email(email)
            .build();
    }

    // ─── STEP 2: Verify the code ────────────────────────────────────
    public ForgotPasswordResponse verifyCode(VerifyResetCodeRequest request) {

        String email = request.getEmail().toLowerCase().trim();

        PasswordResetToken token = tokenRepository
            .findByEmailAndUsedFalse(email)
            .orElseThrow(() ->
                new RuntimeException("No active reset request found. "
                    + "Please request a new code."));

        // Check if too many wrong attempts (max 5)
        if (token.getAttempts() >= 5) {
            tokenRepository.delete(token);
            throw new RuntimeException(
                "Too many incorrect attempts. Please request a new code.");
        }

        // Check expiry
        if (LocalDateTime.now().isAfter(token.getExpiresAt())) {
            tokenRepository.delete(token);
            throw new RuntimeException(
                "Code has expired. Please request a new one.");
        }

        // Check code matches
        if (!token.getCode().equals(request.getCode())) {
            token.setAttempts(token.getAttempts() + 1);
            tokenRepository.save(token);
            int remaining = 5 - token.getAttempts();
            throw new RuntimeException(
                "Invalid code. " + remaining + " attempt(s) remaining.");
        }

        // Code is correct — mark as verified (but not used yet)
        // We use a verified flag via a separate field — reuse 'attempts' = -1
        token.setAttempts(-1); // -1 means verified
        tokenRepository.save(token);

        return ForgotPasswordResponse.builder()
            .status("VERIFIED")
            .message("Code verified. You can now reset your password.")
            .email(email)
            .build();
    }

    // ─── STEP 3: Reset the password ─────────────────────────────────
    public ForgotPasswordResponse resetPassword(ResetPasswordRequest request) {

        String email = request.getEmail().toLowerCase().trim();

        PasswordResetToken token = tokenRepository
            .findByEmailAndUsedFalse(email)
            .orElseThrow(() ->
                new RuntimeException("Invalid or expired reset session. "
                    + "Please start again."));

        // Must be verified (attempts = -1) before reset is allowed
        if (token.getAttempts() != -1) {
            throw new RuntimeException(
                "Please verify your code first before resetting.");
        }

        // Check not expired (extra safety)
        if (LocalDateTime.now().isAfter(token.getExpiresAt())) {
            tokenRepository.delete(token);
            throw new RuntimeException("Session expired. Please start again.");
        }

        // Final code check
        if (!token.getCode().equals(request.getCode())) {
            throw new RuntimeException("Invalid reset session.");
        }

        // Update password
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Mark token as used and clean up
        token.setUsed(true);
        tokenRepository.save(token);
        tokenRepository.deleteAllByEmail(email); // clean up all tokens

        log.info("Password successfully reset for: {}", email);

        return ForgotPasswordResponse.builder()
            .status("RESET_SUCCESS")
            .message("Password reset successfully. You can now log in.")
            .email(email)
            .build();
    }
}