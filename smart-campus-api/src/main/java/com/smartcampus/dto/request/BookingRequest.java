package com.smartcampus.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingRequest {
    
    @NotBlank(message = "Resource ID is required")
    private String resourceId;

    private String resourceName;
    
    private String resourceType;
    
    private String resourceName;
    private String resourceType;
    
    @NotNull(message = "Start time is required")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX")
    private LocalDateTime startTime;
    
    @NotNull(message = "End time is required")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX")
    private LocalDateTime endTime;
    
    @NotBlank(message = "Purpose is required")
    @Size(min = 5, max = 500, message = "Purpose must be between 5 and 500 characters")
    private String purpose;
    
    @Min(value = 1, message = "Expected attendees must be at least 1")
    @Max(value = 500, message = "Expected attendees cannot exceed 500")
    private Integer expectedAttendees;
    
    private String specialRequests;
}