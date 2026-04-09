package com.smartcampus.dto.request;

import lombok.Data;

@Data
public class UpdateIncidentTicketRequest {
    private String status;
    private String assignedTechnicianId;
    private String resolutionNotes;
}
