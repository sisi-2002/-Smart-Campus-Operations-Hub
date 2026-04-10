package com.smartcampus.dto.response;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ForgotPasswordResponse {
    private String status;    // SENT, VERIFIED, RESET_SUCCESS
    private String message;
    private String email;     // returned so frontend knows which email
}