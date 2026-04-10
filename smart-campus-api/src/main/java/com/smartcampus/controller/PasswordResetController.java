package com.smartcampus.controller;

import com.smartcampus.dto.request.ForgotPasswordRequest;
import com.smartcampus.dto.request.ResetPasswordRequest;
import com.smartcampus.dto.request.VerifyResetCodeRequest;
import com.smartcampus.dto.response.ForgotPasswordResponse;
import com.smartcampus.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/password")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    // POST /api/auth/password/forgot
    @PostMapping("/forgot")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(
            passwordResetService.sendResetCode(request));
    }

    // POST /api/auth/password/verify-code
    @PostMapping("/verify-code")
    public ResponseEntity<ForgotPasswordResponse> verifyCode(
            @Valid @RequestBody VerifyResetCodeRequest request) {
        return ResponseEntity.ok(
            passwordResetService.verifyCode(request));
    }

    // POST /api/auth/password/reset
    @PostMapping("/reset")
    public ResponseEntity<ForgotPasswordResponse> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(
            passwordResetService.resetPassword(request));
    }
}