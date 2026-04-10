package com.smartcampus.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "password_reset_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {

    @Id
    private String id;

    @Indexed
    private String email;

    // 6-digit OTP code
    private String code;

    // Expires after 10 minutes
    private LocalDateTime expiresAt;

    // Track if already used
    private boolean used = false;

    // Count wrong attempts — lock after 5
    private int attempts = 0;

    private LocalDateTime createdAt;
}