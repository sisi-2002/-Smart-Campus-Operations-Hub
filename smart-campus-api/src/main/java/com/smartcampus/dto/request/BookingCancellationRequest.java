package com.smartcampus.dto.request;

import lombok.Data;

@Data
public class BookingCancellationRequest {
    private String cancellationReason;
}