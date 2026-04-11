package com.smartcampus.security.oauth2;

import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtUtil;
import com.smartcampus.service.MfaService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler
        extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final MfaService mfaService;
    private final UserRepository userRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // ✅ Roles that REQUIRE 2FA — must match AuthService
    private static final Set<Role> MFA_REQUIRED_ROLES = Set.of(
        Role.ADMIN,
        Role.TECHNICIAN,
        Role.MANAGER
    );

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException {

        OAuth2UserPrincipal principal =
            (OAuth2UserPrincipal) authentication.getPrincipal();
        User user = principal.getUser();

        // ✅ Check if this role requires 2FA
        if (MFA_REQUIRED_ROLES.contains(user.getRole())) {

            UriComponentsBuilder builder = UriComponentsBuilder
                    .fromUriString(frontendUrl + "/oauth2/callback")
                    .queryParam("mfaRequired", "true")
                    .queryParam("userId", user.getId());

            // First time — generate secret and return QR code for setup
            if (!user.isMfaEnabled()) {
                String secret = mfaService.generateSecretKey();
                String qrUri  = mfaService.generateQrCodeUri(user.getEmail(), secret);

                // Save secret (not enabled yet — enabled after first verify)
                user.setMfaSecret(secret);
                user.setMfaRequired(true);
                userRepository.save(user);

                builder.queryParam("mfaStatus", "MFA_SETUP_REQUIRED")
                       .queryParam("qrCodeUri", URLEncoder.encode(qrUri, StandardCharsets.UTF_8))
                       .queryParam("secretKey", secret);
            } else {
                // Already set up — just ask for the 6-digit code
                builder.queryParam("mfaStatus", "MFA_CODE_REQUIRED");
            }

            getRedirectStrategy().sendRedirect(request, response, builder.build().toUriString());
            return;
        }

        // ✅ Standard roles — skip 2FA, issue token immediately
        String token = jwtUtil.generateToken(
            user.getEmail(), user.getRole().name(), user.getId());

        String redirectUrl = UriComponentsBuilder
                .fromUriString(frontendUrl + "/oauth2/callback")
                .queryParam("token", token)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}