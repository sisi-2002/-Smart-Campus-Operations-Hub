package com.smartcampus.controller;

import com.smartcampus.entity.AuthProvider;
import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/init")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:5173")
public class InitController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * ONE-TIME INITIALIZATION: Create the first admin user
     * Usage: POST http://localhost:8083/api/init/create-first-admin
     * Body: {
     *   "name": "Admin User",
     *   "email": "admin@smartcampus.edu",
     *   "password": "AdminPassword123!"
     * }
     * 
     * ⚠️ DELETE THIS ENDPOINT IN PRODUCTION
     */
    @PostMapping("/create-first-admin")
    public ResponseEntity<?> createFirstAdmin(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String password) {
        
        try {
            // Check if admin already exists
            if (userRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.badRequest().body(
                    "User with email " + email + " already exists");
            }

            // Check if ANY admin exists
            Long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.ADMIN)
                    .count();
            
            if (adminCount > 0) {
                return ResponseEntity.badRequest().body(
                    "Admin already exists. This endpoint is only for initial setup.");
            }

            // Create admin user
            User admin = User.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .role(Role.ADMIN)
                    .provider(AuthProvider.LOCAL)
                    .enabled(true)
                    .mfaEnabled(false)
                    .mfaRequired(true)  // ADMIN must set up 2FA
                    .build();

            userRepository.save(admin);
            log.info("Admin user created: {}", email);

            return ResponseEntity.ok()
                    .body("Admin user created successfully. Email: " + email + 
                          "\n\nNow log in and set up 2FA to complete admin setup.");

        } catch (Exception e) {
            log.error("Error creating admin user", e);
            return ResponseEntity.internalServerError()
                    .body("Error: " + e.getMessage());
        }
    }
}
