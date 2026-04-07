package com.smartcampus.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginStepResponse {

    // MFA_SETUP_REQUIRED | MFA_CODE_REQUIRED | SUCCESS
    private String status;

    // Only set when status = SUCCESS
    private String token;
    private String id;
    private String name;
    private String email;
    private String role;

    // Only set when MFA setup is needed
    private String qrCodeUri;
    private String secretKey;
}