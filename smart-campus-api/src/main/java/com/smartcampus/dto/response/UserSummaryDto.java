package com.smartcampus.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserSummaryDto {

    private String id;
    private String name;
    private String email;
    private String role;
    private String provider;    // LOCAL or GOOGLE
    private boolean mfaEnabled;
    private boolean enabled;
    private LocalDateTime createdAt;

    // ✅ No password, no mfaSecret — safe to send to frontend
}
