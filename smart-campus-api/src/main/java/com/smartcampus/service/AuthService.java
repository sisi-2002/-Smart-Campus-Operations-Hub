package com.smartcampus.service;

import com.smartcampus.dto.request.LoginRequest;
import com.smartcampus.dto.request.MfaVerifyRequest;
import com.smartcampus.dto.request.RegisterRequest;
import com.smartcampus.dto.response.AuthResponse;
import com.smartcampus.dto.response.LoginStepResponse;
import com.smartcampus.entity.AuthProvider;
import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final MfaService mfaService;
    private final NotificationService notificationService;

    // ✅ Roles that REQUIRE 2FA
    // Adjust these enum values to match whatever you named them in your Role.java file
    private static final Set<Role> MFA_REQUIRED_ROLES = Set.of(
        Role.ADMIN,
        Role.TECHNICIAN,
        Role.MANAGER
    );

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)         // default role for new signups
                .provider(AuthProvider.LOCAL)
                .enabled(true)
                .mfaEnabled(false)       // Default to false
                .mfaRequired(false)      // USER role doesn't need 2FA
                .build();

        userRepository.save(user);

        // ✅ Send welcome notification on registration
        notificationService.sendWelcomeNotification(user.getId(), user.getName());

        String token = jwtUtil.generateToken(
            user.getEmail(), user.getRole().name(), user.getId());
        return buildAuthResponse(user, token);
    }

    // ✅ Step 1 login — check password, then decide MFA flow
    public LoginStepResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!user.isEnabled()) {
            throw new RuntimeException("Administater Disabled account pleace contact adminstater ");
        }

        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException e) {
            throw new RuntimeException("Invalid email or password");
        }

        // ✅ Standard roles (Students/Lecturers) — skip 2FA, issue token immediately
        if (!MFA_REQUIRED_ROLES.contains(user.getRole())) {
            String token = jwtUtil.generateToken(
                user.getEmail(), user.getRole().name(), user.getId());
            return LoginStepResponse.builder()
                    .status("SUCCESS")
                    .token(token)
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .build();
        }

        // ✅ Privileged role — needs 2FA
        // First time — generate secret and return QR code
        if (!user.isMfaEnabled()) {
            String secret = mfaService.generateSecretKey();
            String qrUri  = mfaService.generateQrCodeUri(user.getEmail(), secret);

            // Save secret (not enabled yet — enabled after first verify)
            user.setMfaSecret(secret);
            user.setMfaRequired(true);
            userRepository.save(user);

            return LoginStepResponse.builder()
                    .status("MFA_SETUP_REQUIRED")
                    .id(user.getId())
                    .qrCodeUri(qrUri)
                    .secretKey(secret)   // show as backup code
                    .build();
        }

        // Already set up — just ask for the 6-digit code
        return LoginStepResponse.builder()
                .status("MFA_CODE_REQUIRED")
                .id(user.getId())
                .build();
    }

    // ✅ Step 2 — verify the 6-digit OTP code
    public LoginStepResponse verifyMfa(MfaVerifyRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getMfaSecret() == null) {
            throw new RuntimeException("MFA not set up for this user");
        }

        boolean valid = mfaService.verifyCode(user.getMfaSecret(), request.getCode());

        if (!valid) {
            throw new RuntimeException("Invalid or expired code. Try again.");
        }

        // ✅ First time setup — mark as permanently enabled
        if (!user.isMfaEnabled()) {
            user.setMfaEnabled(true);
            userRepository.save(user);
        }

        // Issue final JWT now
        String token = jwtUtil.generateToken(
            user.getEmail(), user.getRole().name(), user.getId());

        return LoginStepResponse.builder()
                .status("SUCCESS")
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String token = jwtUtil.generateToken(
            user.getEmail(), user.getRole().name(), user.getId());
        return buildAuthResponse(user, token);
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}