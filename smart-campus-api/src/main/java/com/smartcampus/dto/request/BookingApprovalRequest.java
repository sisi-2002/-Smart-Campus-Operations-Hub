package com.smartcampus.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BookingApprovalRequest {
    private boolean approved;
    
    @Size(max = 500, message = "Rejection reason cannot exceed 500 characters")
    private String rejectionReason;
}