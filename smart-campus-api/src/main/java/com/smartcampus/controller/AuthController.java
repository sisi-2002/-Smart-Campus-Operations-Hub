package com.smartcampus.controller;

import com.smartcampus.dto.request.LoginRequest;
import com.smartcampus.dto.request.MfaVerifyRequest;
import com.smartcampus.dto.request.RegisterRequest;
import com.smartcampus.dto.response.AuthResponse;
import com.smartcampus.dto.response.LoginStepResponse;
import com.smartcampus.security.oauth2.OAuth2UserPrincipal;
import com.smartcampus.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    // POST /api/auth/login — Step 1
    @PostMapping("/login")
    public ResponseEntity<LoginStepResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // POST /api/auth/login/verify-mfa — Step 2
    @PostMapping("/login/verify-mfa")
    public ResponseEntity<LoginStepResponse> verifyMfa(
            @Valid @RequestBody MfaVerifyRequest request) {
        return ResponseEntity.ok(authService.verifyMfa(request));
    }

    // GET /api/auth/me
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        // 1. Check if the user is logged in at all
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401)
                .body(Map.of("error", "Not authenticated"));
        }

        Object principal = authentication.getPrincipal();

        // 2. Handle Local Login Users (Standard Password)
        if (principal instanceof UserDetails userDetails) {
            return ResponseEntity.ok(
                authService.getProfile(userDetails.getUsername()));
        }

        // 3. Handle Google OAuth Users
        if (principal instanceof OAuth2UserPrincipal oauth2User) {
            return ResponseEntity.ok(
                authService.getProfile(oauth2User.getUser().getEmail()));
        }

        // 4. Fallback error
        return ResponseEntity.status(401)
            .body(Map.of("error", "Unknown authentication type"));
    }
}