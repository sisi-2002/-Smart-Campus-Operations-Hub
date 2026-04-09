package com.smartcampus.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponse {
    private String id;
    private String userId;
    private String userName;
    private String userEmail;
    private String resourceId;
    private String resourceName;
    private String resourceType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private String status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean canCancel;
    private boolean canModify;
}