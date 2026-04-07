package com.smartcampus.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MfaVerifyRequest {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotNull(message = "OTP code is required")
    private Integer code;
}