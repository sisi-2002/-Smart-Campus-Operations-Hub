package com.smartcampus.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateRoleRequest {

    @NotBlank(message = "Role is required")
    private String role;
}