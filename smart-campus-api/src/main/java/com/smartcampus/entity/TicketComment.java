package com.smartcampus.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketComment {

    private String id;
    private String parentCommentId;
    private String authorUserId;
    private String authorName;
    private String authorRole;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
