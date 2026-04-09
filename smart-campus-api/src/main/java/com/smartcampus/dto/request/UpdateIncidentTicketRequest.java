package com.smartcampus.dto.request;

import lombok.Data;

@Data
public class UpdateIncidentTicketRequest {
    private String id;
    private String ticketId;
    private String status;
    private String assignedTechnicianId;
    private String resolutionNotes;
}
