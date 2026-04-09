package com.smartcampus.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminIncidentTicketDto {

    private String id;
    private String userId;
    private String ticketId;
    private String location;
    private String category;
    private String priority;
    private String description;
    private String preferredContact;
    private String reporterName;
    private String reporterEmail;
    private List<String> imageNames;
    private List<String> imageDataUrls;
    private String status;
    private String assignedTechnicianId;
    private String assignedTechnicianName;
    private String resolutionNotes;
    private LocalDateTime createdAt;
}