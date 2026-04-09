package com.smartcampus.dto.request;

import lombok.Data;

@Data
public class AddTicketCommentRequest {
    private String message;
    private String parentCommentId;
}
