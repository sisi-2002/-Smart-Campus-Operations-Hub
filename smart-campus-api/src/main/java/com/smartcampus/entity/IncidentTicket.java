package com.smartcampus.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "incident_tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentTicket {

    @Id
    private String id;

    private String userId;

    private String ticketId;

    private String location;

    private String category;

    private String priority;

    private String description;

    private String preferredContact;

    private java.util.List<String> imageNames;

    private java.util.List<String> imageDataUrls;

    private java.util.List<TicketComment> comments;

    private String status;

    private String assignedTechnicianId;

    private String assignedTechnicianName;

    private String resolutionNotes;

    private LocalDateTime firstResponseAt;

    private LocalDateTime resolvedAt;

    @CreatedDate
    private LocalDateTime createdAt;
}
