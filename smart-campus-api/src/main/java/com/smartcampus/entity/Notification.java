package com.smartcampus.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    private String id;

    // Who receives this notification
    @Indexed
    private String recipientUserId;

    // Notification type — used for icons and filtering
    private NotificationType type;

    private String title;
    private String message;

    // Optional link to related resource
    private String relatedEntityId;    // bookingId, ticketId, etc.
    private String relatedEntityType;  // "BOOKING", "TICKET", "COMMENT"

    private boolean read = false;

    // Which roles can see this (null = only recipientUserId sees it)
    private String targetRole;         // "ADMIN", "TECHNICIAN", null

    @CreatedDate
    private LocalDateTime createdAt;
}