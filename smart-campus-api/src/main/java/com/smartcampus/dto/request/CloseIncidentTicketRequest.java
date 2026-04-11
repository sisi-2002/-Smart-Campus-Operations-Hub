package com.smartcampus.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CloseIncidentTicketRequest {

    @NotBlank(message = "A note is required")
    private String note;
}
