package com.smartcampus.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VerifyResetCodeRequest {

    @Email
    @NotBlank
    private String email;

    @NotBlank(message = "Code is required")
    private String code;
}