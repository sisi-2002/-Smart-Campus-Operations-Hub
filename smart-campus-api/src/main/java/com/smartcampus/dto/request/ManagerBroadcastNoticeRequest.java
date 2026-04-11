package com.smartcampus.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ManagerBroadcastNoticeRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 120, message = "Title cannot exceed 120 characters")
    private String title;

    @NotBlank(message = "Message is required")
    @Size(max = 1000, message = "Message cannot exceed 1000 characters")
    private String message;

    @Size(max = 120, message = "Resource query cannot exceed 120 characters")
    private String resourceQuery;

    private LocalDateTime windowStart;
    private LocalDateTime windowEnd;
}
