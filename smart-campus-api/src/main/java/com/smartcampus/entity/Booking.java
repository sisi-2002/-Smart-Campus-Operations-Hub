package com.smartcampus.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
@CompoundIndex(name = "resource_time_idx", def = "{'resourceId': 1, 'startTime': 1, 'endTime': 1}")
public class Booking {
    
    @Id
    private String id;
    
    @DBRef
    private User user;
    
    private String resourceId;
    private String resourceName;
    private String resourceType; // LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT
    
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    private String purpose;
    private Integer expectedAttendees;
    
    private BookingStatus status;
    private String rejectionReason;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    private String cancellationReason;
    private LocalDateTime cancelledAt;
    
    private LocalDateTime approvedAt;
    private String approvedBy;

    private String checkInToken;
    private boolean checkedIn;
    private LocalDateTime checkedInAt;
    private String checkedInBy;
    
    // Additional metadata
    private boolean requiresApproval;
    private String specialRequests;
}