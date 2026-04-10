package com.smartcampus.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationResponse {
    private String id;
    private String type;
    private String title;
    private String message;
    private String relatedEntityId;
    private String relatedEntityType;
    private boolean read;
    private LocalDateTime createdAt;
}