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

    private String status;

    @CreatedDate
    private LocalDateTime createdAt;
}
