package com.smartcampus.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClientNotificationRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String message;

    @NotBlank
    private String type;
}
